/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Globals from './Globals';
import { qreq } from './qrequest';

const Auth = {

    getLogin(callback, errorCallback, force) {
        if (!force) {
            if (Globals.get('user')) {
                if (callback)
                    callback(Globals.get('user'));
                return;
            }
        }

        if (Auth.getLogin_process) {
            setTimeout(() => this.getLogin(callback, errorCallback, force), 100);
            return;
        }

        Auth.getLogin_process = true;

        qreq.get('/api/auth/user', j => {
            if (j.errorCode) {
                if (callback)
                    callback(null);
            }
            else {
                Globals.set('user', j.item);
                if (callback)
                    callback(j.item);
            }
            Auth.getLogin_process = false;
        }, e => {
            if (errorCallback)
                errorCallback(e);
            Auth.getLogin_process = false;
        });
    },

    async getLoginAsync(force) {
        return new Promise((resolve, reject) => {
            this.getLogin(resolve, reject, force);
        });
    },

    getUser() {
        return Globals.get('user');
    },

    reset() {
        Globals.set('user', null);
    },

    requireLogin(successCallback) {

        if (Globals.get('user')) {
            if (successCallback)
                successCallback(Globals.get('user'));
            return;
        }

        this.getLogin((user) => {
            if (user) {
                Globals.set('user', user);
                if (successCallback)
                    successCallback(user);
            }
            else
                window.location.replace('/login');
        }, (e) => {
            window.location.replace('/error/connection');
        });
    },

    logout(navigateFunc) {
        qreq.post('/api/auth/logout', j => {
            if (j.errorCode !== 0)
                alert(j.errorMessage);
            else {
                Globals.set('user', null);
                Globals.set('sid', null);
                if (navigateFunc)
                    navigateFunc('/login');
                else
                    window.location.replace('/login');
            }
        });
    },

    hasRole(role) {
        var user = Globals.get('user');
        if (!user)
            return false;

        var b = false;
        if (role.indexOf('|') >= 0) {
            var p = role.split('|');
            p.forEach(s => {
                user.roles.forEach(i => {
                    if (i === s)
                        b = true;
                });
            });
        }
        else {
            user.roles.forEach(i => {
                if (i === role)
                    b = true;
            });
        }
        return b;
    }
};

export default Auth;