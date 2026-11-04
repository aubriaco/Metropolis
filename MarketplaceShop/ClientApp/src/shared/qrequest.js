import Globals from "./Globals";



export function qget(loc, successCallback, errorCallback, localRequest) {
    fetch((localRequest ? '' : Globals.serverUrl) + loc, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    }).then(async (r) => {
        try {
            var j = await r.json();
            if (successCallback)
                successCallback(j);
        }
        catch (e) {
            if (errorCallback)
                errorCallback(e);
        }
    }, (e) => {
        if (errorCallback)
            errorCallback(e);
    });
}

export function qpost(loc, data, successCallback, errorCallback) {
    fetch(Globals.serverUrl + loc, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(async (r) => {
        try {
            var j = await r.json();
            if (successCallback)
                successCallback(j);
        }
        catch (e) {
            if (errorCallback)
                errorCallback(e);
        }
    }, (e) => {
        if (errorCallback)
            errorCallback(e);
    });
}

export const qreq = {
    get: qget,
    post: qpost
};

