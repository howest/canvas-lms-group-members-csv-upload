
var apiGroups = (function apiGroups()
{
    function getGroups(courseID)
    {
        return api.get('courses/' + courseID + '/groups' + '?per_page=50');
    }

    function editGroupMembers(groupID, userIDs)
    {
        let formData = new FormData();
        if (userIDs && userIDs.length > 0) {
            userIDs.forEach(function(userID) {
                formData.append("members[]", userID);
            });

            return api.put('groups/' + groupID, formData);
        }

        return false;
    }

    function addGroupMember(groupID, userID)
    {
        let data = new URLSearchParams('user_id=' + userID);
        return api.post('groups/' + groupID + '/memberships', data);
    }

    return {
        getGroups: getGroups,
        editGroupMembers: editGroupMembers,
        addGroupMember: addGroupMember
    };
})();
