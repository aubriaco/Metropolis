import configData from '../config.json';
import { qreq } from './qrequest';
import { v4 as uuidv4 } from 'uuid';

class _Globals {

    constructor() {
        this.globals = {};
        this.serverUrl = configData.serverUrl;
        this.appName = configData.appName;
        this.domainName = configData.domainName;
        this.devMode = configData.devMode;
        this.lang = {};
        this.currentLang = 'en';
        this.formatter = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    }

    getFormatter() {
        return this.formatter;
    }

    loadEnv(callback) {
        qreq.get('/env-config.json', j => {
            this.domainName = j.domainName;
            this.serverUrl = j.serverUrl;
            this.devMode = j.devMode;
            if(callback)
                callback();
        }, () => { }, true);
    }

    set(a, b) {
        this.globals[a] = b;
    }
    get(a) {
        return this.globals[a];
    }

    setLang(lang) {
        this.currentLang = lang;
        qreq.post('/api/content/lang/set/' + lang, {}, j => { });
    }

    loadLang(callback) {
        qreq.get('/lang/dict.json?r=' + uuidv4(), j => {
            if (j)
                this.lang = j;
        }, () => { }, true);
        qreq.get('/api/content/lang/get', j => {
            if (j.item) {
                this.currentLang = j.item;
                if (callback)
                    callback(this.currentLang);
            }
        });
    }

    getLang(a) {
        if (this.lang && this.lang[a] && this.lang[a][this.currentLang])
            return this.lang[a][this.currentLang];
        return a;
    }


    isDiffObject(a, b, testInvert) {
        if (a !== b)
            return true;
        if (typeof (a) !== typeof (b))
            return true;
        if (a && b) {
            for (var k in a) {
                if (a[k] !== b[k]) {
                    return true;
                }
                else if (typeof (a[k]) === 'object') {
                    if (!a[k] && !b[k])
                        continue;
                    if (this.isDiffObject(a[k], b[k])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isEmptyOrWhitespace(a) {
        if (!a || a.length === 0 || a.trim().length === 0)
            return true;
        return false;
    }

    toMDYDateString(d) {
        function pad(n) { return n < 10 ? '0' + n : n };
        return pad(d.getUTCMonth() + 1) + '/' + pad(d.getUTCDate()) + '/' + d.getUTCFullYear();
    }

    toMDYHMLocalDateString(d) {
        if (!d)
            return '';
        function pad(n) { return n < 10 ? '0' + n : n };
        if (!d.getMonth)
            d = new Date(Date.parse(d));
        return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    toMDYHMAMPMLocalDateString(d) {
        if (!d)
            return '';
        function pad(n) { return n < 10 ? '0' + n : n };
        if (!d.getMonth)
            d = new Date(Date.parse(d));

        var h = Number(d.getHours());
        var apm = 'AM';

        if (h > 12) {
            h -= 12;
            apm = 'PM';
        }
        else if (h === 12)
            apm = 'PM';

        return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '/' + d.getFullYear() + ' ' + pad(h) + ':' + pad(d.getMinutes()) + ' ' + apm;
    }

    toISODateString(d) {
        function pad(n) { return n < 10 ? '0' + n : n }
        return d.getUTCFullYear() + '-'
            + pad(d.getUTCMonth() + 1) + '-'
            + pad(d.getUTCDate()) + 'T'
            + pad(d.getUTCHours()) + ':'
            + pad(d.getUTCMinutes()) + ':'
            + pad(d.getUTCSeconds()) + 'Z';
    }

    toISOLocalDateString(d) {
        function pad(n) { return n < 10 ? '0' + n : n }
        return d.getFullYear() + '-'
            + pad(d.getMonth() + 1) + '-'
            + pad(d.getDate()) + 'T'
            + pad(d.getHours()) + ':'
            + pad(d.getMinutes()) + ':'
            + pad(d.getSeconds());
    }

    toLocaleDateString(d) {
        if (!d)
            return '';
        if (!d.getMonth)
            d = new Date(Date.parse(d));
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    getOutsidePath(loc) {
        var r = null;
        this.outsidePaths.forEach(i => {
            if (loc.length >= i.length && loc.substring(0, i.length) === i) {
                r = i;
            }
        });
        return r;
    }

    isOutsidePath(loc) {
        return (this.getOutsidePath(loc) !== null);
    }

    deepClone(a, exclude) {
        if (!Array.isArray(exclude))
            exclude = [exclude];
        var b = {};
        for (var i in a) {
            if (exclude.indexOf(i) === -1)
                b[i] = a[i];
        }
        return b;
    }

    deepCopy(src, dst, exclude) {
        if (!Array.isArray(exclude))
            exclude = [exclude];
        for (var i in src) {
            if (exclude.indexOf(i) === -1)
                dst[i] = src[i];
        }
    }

    emptyObj(obj, exclude) {
        if (!Array.isArray(exclude))
            exclude = [exclude];
        for (var i in obj) {
            if(exclude.indexOf(i) === -1)
                delete obj[i];
        }
    }

    processResultObject(obj) {
        try {
            if (typeof (obj) === 'object') {
                for (var k in obj) {
                    if (Array.isArray(obj[k])) {
                        obj[k].forEach(i => {
                            this.processResultObject(i);
                        });
                    }
                    else {
                        var s = obj[k];
                        if (s) {
                            if (s.toLowerCase && s === '0001-01-01T00:00:00')
                                obj[k] = this.toISOLocalDateString(new Date());
                            else {
                                if (s.endsWith && !s.endsWith('Z'))
                                    s += 'Z';
                                var v = Date.parse(s);
                                if (s.indexOf && s.indexOf('-') !== -1 && !isNaN(v)) {
                                    var d = new Date(v);
                                    obj[k] = this.toISOLocalDateString(d);
                                }
                                else if (typeof (obj[k]) === 'object') {
                                    this.processResultObject(obj[k]);
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (e) {
            console.log('exception', e);
        }
    }
}

const Globals = new _Globals();

export default Globals;