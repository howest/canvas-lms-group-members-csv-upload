var csvHandler = (function csvHandler()
{
    var validHeaders = [];

    function setValidHeaders(headers)
    {
        validHeaders = headers;
    }

    function read(text)
    {
        let lines = [];
        let rows = text.split(/[\r\n]+/g);
        let headers = getHeaders(rows[0].split(/;/));

        for (let i = 1; i < rows.length; i++) {
            let cells = rows[i].split(/;/);
            let res = [];
            for (let j = 0; j < headers.length; j++) {
                if (typeof headers[j] !== 'undefined' && headers[j] !== null) {
                    res[headers[j]] = cells[j];
                }
            }
            lines.push(res);
        }

        return lines;
    }

    function getHeaders(firstRow)
    {
        let headers = [];
        firstRow.forEach(function(e) {
            let csvHeader = e.trim().toLowerCase();
            if (validHeaders.length == 0) {
                headers.push(csvHeader);
            } else {
                if (validHeaders.includes(csvHeader)) {
                    headers.push(csvHeader);
                } else {
                    headers.push(null);
                }
            }
        });

        if (headers.length === 0) {
            throw(new Error('Incorrect headers'));
        }

        validHeaders.forEach(function(e) {
            if (!headers.includes(e)) {
                throw(new Error('Incorrect headers'));
            }
        });

        return headers;
    }

    return {
        setValidHeaders: setValidHeaders,
        read: read
    };
})();
