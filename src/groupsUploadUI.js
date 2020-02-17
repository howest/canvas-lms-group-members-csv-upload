var groupsUploadUI = (function groupsUploadUI()
{
    function getTaskBar()
    {
        return $('#group_categories_tabs .group-categories-actions');
    }

    function createButton(title, appendTo)
    {
        let spanCSV = document.createElement("label");
        spanCSV.style.float='left';
        spanCSV.style.marginRight='5px';
        spanCSV.innerHTML = '<input type="file" id="csvFile" class="hidden">' + title;
        spanCSV.classList.add('btn-upload');
        spanCSV.classList.add('btn');
        spanCSV.classList.add('btn-primary');
        appendTo.appendChild(spanCSV);
    }

    function createModalDialog(id, appendTo, title, info)
    {
        let modalID = id + 'Modal';
        $('<button class="element_toggler btn btn-primary" style="float: left; margin-right: 5px;" aria-controls="' + modalID + '" aria-label="Toggle ' + modalID + ' modal">' + title + '</button>').appendTo(appendTo);

        let modal = document.createElement("div");
        modal.innerHTML =
            '<div id="' + modalID + '" style="display: none;">'
                + '<div class="ui-widget-overlay container middle-xs center-xs" style="text-align: left; display: flex; position: fixed; z-index: 11; left: 84px; top: 0; width: 100%; height: 100%;">'
                + '<div id="modal" class="ui-corner-all box-shadow" style="background-color: #fff; padding: 10px; position: absolute; width: 100vw; max-width: 600px;">'
                + '<div id="modal_content">'
                + '<p>' + info + '</p>'
                + '<div style="background-color: #f8f9fa; margin: 10px;">'
                + '<span style="display: block; font-style: italic; font-weight: bold;">groep; email</span>'
                + '<span style="display: block; font-style: italic;">Groep 1; student1@example.com</span>'
                + '<span style="display: block; font-style: italic;">Groep 2; student2@example.com</span>'
                + '</div>'
                + '<p class="collapseMsg alert alert-info" style="white-space: pre-line;max-height:200px;overflow:auto;font-size: 90%;display:none;" id="' + id + 'CSVInfo"></p>'
                + '</div>'
                + '<div class="text-right">'
                + '<a id="' + id + 'CloseCSV" class="element_toggler btn ui-corner-all" role="button" aria-controls="' + modalID + '" aria-label="Toggle ' + modalID + ' modal"> <span class="ui-button-text">Close</span></a>'
                + '<a id="' + id + 'UploadCSV" style="margin-left:5px;" class="btn btn-primary"><input type="file" id="' + id + '" style="opacity: 0; position: absolute; top: 0; left: 0; cursor: pointer;">Upload CSV</a>'
                + '</div>'
                + '</div>'
                + '</div>'
                + '</div>'
        ;

        document.body.appendChild(modal);

        $('#' + id + 'CloseCSV').click(function() {
            $('#' + modalID + 'CSVInfo').hide();
        });
    }

    function loadingMsg(modalID)
    {
        let p = $('#' + modalID + 'CSVInfo');
        if(p.hasClass('alert-error'))
        {
            p.toggleClass('alert-error alert-info');
        }
        p.html('<div class="loadingIndicator" style="float: left; width: 20px; margin-right: 5px;"></div>' + 'Loading...');
        p.show();
    }

    function errorMsg(modalID, msg)
    {
        let p = $('#' + modalID + 'CSVInfo');
        if(p.hasClass('alert-info'))
        {
            p.toggleClass('alert-info alert-error');
        }
        p.text("Error: " + msg);

        let max_length = 150;
        if(p.html().length > max_length) {
            let short_content = p.html().substr(0,max_length);
            let long_content = p.html().substr(max_length);
            p.html(short_content+'<a href="#" class="read_more"> ... show more</a>'+
                '<span class="more_text" style="display:none;">'+long_content+'</span>'+'<a href="#" class="read_less" style="display:none;"> show less</a>');
            p.find('a.read_more').click(function(event) {
                event.preventDefault();
                $(this).hide();
                $('.read_less').show();
                $(this).parents('.collapseMsg').find('.more_text').show();
            });

            p.find('a.read_less').click(function(event) {
                event.preventDefault();
                $(this).hide();
                $('.read_less').hide();
                $('.read_more').show();
                $(this).parents('.collapseMsg').find('.more_text').hide();

            });
        }

        p.show();
    }

    return {
        getTaskBar: getTaskBar,
        createButton: createButton,
        createModalDialog: createModalDialog,
        loadingMsg: loadingMsg,
        errorMsg: errorMsg
    };

})();