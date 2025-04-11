/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Globals from "./Globals";

export function localget(loc, successCallback, errorCallback, raw) {
    fetch(loc, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    }).then(async (r) => {
        var j = await r.json();
        if (successCallback)
            successCallback(j);
    }, (e) => {
        if (errorCallback)
            errorCallback(e);
    });
}

export function localgetraw(loc, successCallback, errorCallback) {
    fetch(loc, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    }).then(async (r) => {
        var j = await r.text();
        if (successCallback)
            successCallback(j);
    }, (e) => {
        if (errorCallback)
            errorCallback(e);
    });
}

export function qget(loc, successCallback, errorCallback) {
    fetch(Globals.serverUrl + loc, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    }).then(async (r) => {
        var j = await r.json();
        if (successCallback)
            successCallback(j);
    }, (e) => {
        if (errorCallback)
            errorCallback(e);
    });
}

export async function qgetAsync(loc) {
    return new Promise((resolve, reject) => {
        fetch(Globals.serverUrl + loc, {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        }).then(async (r) => {
            try {
                var j = await r.json();
                resolve(j);
            }
            catch (e) {
                reject(e);
            }
        }, (e) => {
            reject(e);
        });
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
        var j = await r.json();
        if (successCallback)
            successCallback(j);
    }, (e) => {
        if (errorCallback)
            errorCallback(e);
    });
}

export async function qpostAsync(loc, data) {
    return new Promise((resolve, reject) => {
        fetch(Globals.serverUrl + loc, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(async (r) => {
            try {
                var j = await r.json();
                resolve(j);
            }
            catch (e) {
                reject(e);
            }
        }, (e) => {
            reject(e);
        });
    });
}



export const qreq = {
    get: qget,
    post: qpost,
    getAsync: qgetAsync,
    postAsync: qpostAsync,
    localget: localget,
    localgetraw: localgetraw
};

