/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Globals from "./Globals";
import { qreq } from "./qrequest";

const Languages = [
    { ident: 'en', name: 'English', flag: 'us' },
    { ident: 'es', name: 'Español', flag: 'pr' }
];
var Lang = {};
var CurrentLangItem = Languages[0];
var CurrentLang = CurrentLangItem.ident;
var CurrentLangName = CurrentLangItem.name;

export function getLanguages() {
    return Languages;
}

export function pullCurrentLang(callback) {
    var params = Globals.parseQS();
    if (params && params.lang)
        setCurrentLangByIdent(params.lang);
    else {
        qreq.get('/api/content/lang/get', (r) => {
            if (!r.errorCode) {
                setCurrentLangByIdent(r.item);
                if(callback)
                    callback(r.item);
            }
        });
    }
};

export function setCurrentLang(a, c) {
    CurrentLangItem = a;
    CurrentLang = a.ident;
    CurrentLangName = a.name;
    if (c) {
        qreq.post('/api/content/lang/set/' + a.ident, (r) => {
            if (r.errorCode)
                console.log('Lang set error', r.errorMessage);
        });
    }
};

export function setCurrentLangByIdent(a, c) {
    Languages.forEach(i => {
        if (i.ident === a) {
            setCurrentLang(i, c);
        }
    });
};

export function loadLang(callback) {
    qreq.localget('/lang/dict.json', (r) => {
        Lang = r;
        if(callback)
            callback();
    });
}

export function getCurrentLangItem() {
    return CurrentLangItem;
}

export function getLang(a) {
    if (Lang && Lang[a] && Lang[a][CurrentLang])
        return Lang[a][CurrentLang];
    return a;
}

