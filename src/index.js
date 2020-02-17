$(window).load(function()
{
    let actionsBar = groupsUploadUI.getTaskBar();
    if (actionsBar && actionsBar.length > 0 && window.location.href.includes('/groups') && lmsENV.isTeacher()) {
        //csv headers
        csvHandler.setValidHeaders(['groep', 'email']);

        //create dialogs to add and edit group members
        let addModalID = 'addMembers';
        groupsUploadUI.createModalDialog(
            addModalID,
            actionsBar[0],
            '<i class="icon-plus"></i> Studenten',
            'Voeg studenten en groepen toe aan de bestaande groepenreeksen. Met deze actie voegt u studenten toe, u overschrijft de bestaande data niet.');

        let editModalID = 'editGroups';
        groupsUploadUI.createModalDialog(
            editModalID,
            actionsBar[0],
            '<i class="icon-edit"></i> Groepen',
            'Met deze actie verander je de groepensamenstelling. Deze actie overschrijft de bestaande data en dit voor alle klasgroepenreeksen.');

        //fetch course ID
        let courseID = lmsENV.getCurrentCourse();
        //fetch users in the course
        let pUsers = apiCourse.getCourseUsers(courseID);

        //add onchange events to input elements
        let inputEdit = document.getElementById(editModalID);
        inputEdit.onchange = function(event) {
            csvGroupsUpload.processCSV(inputEdit, courseID, pUsers, editModalID, csvGroupsUpload.editMembers);
            inputEdit.value = ""; //workaround for handling same name files on change event
        };

        let inputAdd = document.getElementById(addModalID);
        inputAdd.onchange = function(event) {
            csvGroupsUpload.processCSV(inputAdd, courseID, pUsers, addModalID, csvGroupsUpload.addMembers);
            inputAdd.value = ""; //workaround for handling same name files on change event
        };
    }
});


var csvGroupsUpload = (function csvGroupsUpload()
{
    /* Process a csv file and try to add/edit the group members in the file */
    function processCSV(input, courseID, pUsers, modalID, callback)
    {
        //fetch groups in the course
        let pGroups = apiGroups.getGroups(courseID); //groups may differ between input onchange events
        //prepare to read csv file
        let reader = new FileReader();
        reader.readAsText(input.files[0]);
        reader.onload = function(e) {
            groupsUploadUI.loadingMsg(modalID);
            Promise.all([
                pGroups.catch(function(e) { groupsUploadUI.errorMsg(modalID, e.message);}),
                pUsers.catch(function(e) { groupsUploadUI.errorMsg(modalID, e.message);})
            ]).then(function(values) {
                //process csv lines after the groups and users are fetched
                let lmsGroups = values[0];
                let lmsUsers = values[1];
                let lines = csvHandler.read(e.target.result);
                if (lines && lines.length > 0) {
                    //get groups and members IDs
                    let groups = findGroupMembers(lines, lmsGroups, lmsUsers);
                    if (groups && groups.members) {
                        //send requests to add or edit group members
                        let requests = callback(groups.members);
                        if (requests.length > 0) {
                            Promise.all(requests.map((p) => p.catch(e => new Error(e.responseText))))
                            .then(function(values) {
                                let errors = values.filter(values => values instanceof Error);
                                if (errors.length === 0) {
                                    if (groups.error) {
                                        throw new Error(groups.error.message);
                                    } else {
                                        location.reload(); //everything ok, reload the page
                                    }
                                } else {
                                    throw new Error(getRequestsErrorMessage(errors));
                                }
                            }).catch(function(e) {
                                //there were some errors, but some requests might have been processed
                                groupsUploadUI.errorMsg(modalID, e.message);
                                $('#' + modalID + 'CloseCSV').click(function() {
                                    location.reload();
                                });
                            });
                        } else {
                            throw new Error('None of the groups or of the users in the CSV file could be found in the course');
                        }
                    }
                }
            }).catch(function(e) {
                groupsUploadUI.errorMsg(modalID, e.message);
            });
        };
    }

    /* Return an array of promises to edit members in multiple groups */
    function editMembers(members)
    {
        let requests = [];
        for (let [groupID, userIDs] of Object.entries(members)) {
            if(groupID > 0 && userIDs.length > 0) {
                requests.push(apiGroups.editGroupMembers(groupID, userIDs));
            }
        }

        return requests;
    }

    /* Return an array of promises to add multiple members in multiple groups */
    function addMembers(members)
    {
        let requests = [];
        for(let [groupID, userIDs] of Object.entries(members)) {
            if(groupID > 0) {
                userIDs.forEach(function(userID) {
                    requests.push(apiGroups.addGroupMember(groupID, userID));
                });
            }
        }

        return requests;
    }

    /* Create one error message from multiple instances of Error */
    function getRequestsErrorMessage(errors)
    {
        let message = 'There were some errors while processing the file. Please try again later.' + '\n';
        errors.forEach(function(e) {
            if(e.message) {
                let item = JSON.parse(e.message);
                message += '\n' + item.errors[0].message;
                message += ' (error report id: ' + item.error_report_id + ')';
            }
        });

        return message;
    }

    /* Given an array with group names and user emails, find the group and user ids, then return an array of group ids and member ids */
    function findGroupMembers(lines, lmsGroups, lmsUsers)
    {
        let members = {};
        let userErrors = [];
        let groupErrors = [];
        lines.forEach(function(line) {
            if (line && line['groep'] != '' && typeof line['groep'] != 'undefined' && line['email'] != '' && typeof line['email'] != 'undefined') {
                //find group id
                let group = findGroup(line['groep'], lmsGroups);
                if (group && group.id) {
                    if (!members[group.id]) {
                        members[group.id] = [];
                    }
                    //find user id
                    let user = findUser(line['email'], lmsUsers);
                    if (user && user.id) {
                        members[group.id].push(user.id);
                    } else {
                        if (userErrors.indexOf(line['email']) === -1) {
                            userErrors.push(line['email']);
                        }
                    }
                } else {
                    if (groupErrors.indexOf(line['groep']) === -1) {
                        groupErrors.push(line['groep']);
                    }
                }
            }
        });

        //prepare error messages
        let error = null;
        if (groupErrors.length > 0 || userErrors.length > 0) {
            let message = '';
            if (groupErrors.length > 0) {
                message += 'Groups not found: ' + groupErrors.join(', ') + '\n';
            }

            if (userErrors.length > 0) {
                message += 'Users not found: ' + userErrors.join(', ');
            }

            error = new Error(message);
        }

        return { members: members, error: error };
    }

    /* Find a user by email */
    function findUser(email, users)
    {
        for(let user of users) {
            if(typeof email !== 'undefined' && user.email && email.trim().toLowerCase() == user.email.trim().toLowerCase()) {
                return user;
            }
        }

        return false;
    }

    /* Find a group by name */
    function findGroup(name, groups)
    {
        for(let group of groups) {
            if(typeof name !== 'undefined' && name.trim().toLowerCase() == group.name.trim().toLowerCase()) {
                return group;
            }
        }

        return false;
    }

    return {
        processCSV: processCSV,
        addMembers: addMembers,
        editMembers: editMembers
    };
})();




