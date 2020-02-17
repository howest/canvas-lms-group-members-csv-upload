var api = (function api()
{
    function get(url)
    {
        return recFetch(getBaseUrl() + url, getRequestOpts('GET'));
    }

    function post(url, data)
    {
        return recFetch(getBaseUrl() + url, getRequestOpts('POST', data));
    }

    function put(url, data)
    {
        return recFetch(getBaseUrl() + url, getRequestOpts('PUT', data));
    }

    function getBaseUrl()
    {
        return window.location['origin'] + '/api/v1/';
    }

    function getRequestOpts(method, data = null)
    {
        let headers = new Headers();
        headers.append('Accept',  'application/json');
        headers.append('X-CSRF-Token', getCsrfToken());

        let opts = {
            method: method,
            headers: headers,
            credentials: 'same-origin'
        };

        if(data != null) {
            opts.body = data;
        }

        return opts;
    }

    function recFetch(url, opts, result = [])
    {
        return new Promise(function(resolve, reject) {
            fetch(url, opts).then(function(response) {
                if(!response.ok) {
                    throw new Error(response.statusText);
                }
                getResponse(response).then(function(res) {
                    result = result.concat(res);
                    let nextPage = getNextPage(response);
                    if (nextPage && nextPage != null) {
                        recFetch(nextPage, opts, result).then(resolve).catch(reject);
                    } else {
                        resolve(result);
                    }
                }).catch(function(error) {
                    reject(error);
                });
            }).catch(function(error) {
                reject(error);
            });
        });
    }

    function getNextPage(response)
    {
        let linksInfo = response.headers.get('Link');
        if(linksInfo) {
            let links = linksInfo.split(/,/);
            let nextPage = null;
            links.forEach(function(link) {
                if(link) {
                    let next = link.split(/<(.*?)>; rel="next"$/);
                    if (next.length > 1) {
                        nextPage = next[1];
                    }
                }
            });

            if (nextPage) {
                return nextPage;
            }
        }

        return false;
    }

    function getResponse(rawResponse)
    {
        return rawResponse.text()
            .then(function(rawText) {
                let text = rawText.replace('while(1);', '');
                return JSON.parse(text);
            });
    }

    function getCsrfToken() {
        let csrfRegex = new RegExp('^_csrf_token=(.*)$');
        let csrf;
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            let match = csrfRegex.exec(cookie);
            if (match) {
                csrf = decodeURIComponent(match[1]);
                break;
            }
        }

        return csrf;
    }

    return {
        get: get,
        post: post,
        put: put
    }
})();
