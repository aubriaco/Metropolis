/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import React from 'react';
import Auth from '../shared/Auth';
import { toast } from 'react-toastify';
import sanitizeHtml from 'sanitize-html';
import { qreq } from '../shared/qrequest';

const allowedHTML = {
    parseStyleAttributes: false,
    allowedTags: ['table', 'thead', 'tbody', 'tr', 'td', 'th', 'div', 'span', 'b', 'i', 'strong', 'h1', 'h2', 'h3', 'h4', 'h5', 'hr', 'img', 'br', 'p', 'ul', 'ol', 'li'],
    allowedAttributes: {
        table: ['style', 'class'],
        b: ['style', 'class'],
        i: ['style', 'class'],
        strong: ['style', 'class'],
        div: ['style', 'class', 'varnote'],
        span: ['style', 'class'],
        tr: ['style', 'class'],
        td: ['style', 'class', 'colspan'],
        th: ['style', 'class', 'colspan'],
        a: ['href', 'target'],
        img: ['src', 'alt', 'style', 'class']
    },
    allowedSchemes: ['data', 'http', 'https']
};

export default class BaseCom extends React.Component {

    constructor(props, state) {
        if (!props)
            props = {};
        super(props);
        if (!state)
            state = {};
        this.state = state;
        this.set = this.set.bind(this);
        this.get = this.get.bind(this);
        this.addToList = this.addToList.bind(this);
        this.removeFromList = this.removeFromList.bind(this);
        this.goBack = this.goBack.bind(this);
        this.alert = this.alert.bind(this);
    }

    set(a, b) {
        var state = this.state;
        state[a] = b;
        this.setState(state);
    }

    get(a) {
        return this.state[a];
    }

    addToList(list, obj) {
        if (!obj)
            obj = {};
        obj.key = list.length;
        list.push(obj);
        this.setState({ item: this.state.item });
    }

    removeFromList(list, obj) {
        if (list.indexOf(obj) === -1)
            return;
        list.splice(list.indexOf(obj), 1);
        this.setState({ item: this.state.item });
    }

    getLogin(callback, errorCallback) {
        Auth.getLogin(callback, errorCallback);
    }

    requireLogin(successCallback) {
        Auth.requireLogin(successCallback);
    }

    alert(msg) {
        toast.error(msg);
    }

    success(msg) {
        toast.success(msg);
    }

    goBack() {
        window.history.go(-1);
    }

    toast() {
        return toast;
    }

    unkownErrorCallback() {
        toast.error('Unknown error ocurred. Please try again.');
    }

    processHTML(html, allowLinks) {
        if(allowLinks)
        {
            var allowed = {...allowedHTML, allowedTags: [...allowedHTML.allowedTags, 'a']};
            return sanitizeHtml(html, allowed);        
        }
        else
            return sanitizeHtml(html, allowedHTML);
    }

    noAccess = () => {
        setTimeout(() => {
            if(this.props.navigate)
                this.props.navigate('/login');
            else
                window.location.href = '/login';
        }, 100);
    }

    fillItem(api, vname) {
        if(!vname) vname = 'item';
        qreq.get(api, j => {
            if (j.item)
                this.setState({ [vname]: j.item });
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    fillList(api, vname, usePost, successCallback, errorCallback) {
        if (usePost) {
            qreq.post(api, {}, j => {
                if (j.list) {
                    this.setState({ [vname]: j.list });
                    successCallback?.(j.list);
                }
                else {
                    this.alert(j.errorMessage);
                    errorCallback?.(j.errorMessage);
                }
            }, () => {
                this.unkownErrorCallback();
                errorCallback?.();
            });
        }
        else {
            qreq.get(api, j => {
                if (j.list) {
                    this.setState({ [vname]: j.list });
                    successCallback?.(j.list);
                }
                else {
                    this.alert(j.errorMessage);
                    errorCallback?.(j.errorMessage);
                }
            }, () => {
                this.unkownErrorCallback();
                errorCallback?.();
            });
        }
    }
    
    fillListAsync(api, vname, usePost) {
        return new Promise((resolve, reject) => {
            this.fillList(api, vname, usePost, resolve, resolve);
        });
    }

    requireLoginAsync = async (force) => {
        try {
            let u = await Auth.getLoginAsync(force);
            if(u)
                this.setState({ user: u, loaded: true });
            else
                this.noAccess();
        }
        catch(e) {
            console.error(e);
            this.noAccess();
        }
    }

}