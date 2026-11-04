import React from 'react';
import Auth from '../shared/Auth';

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
        alert(msg);
    }

    goBack() {
        window.history.go(-1);
    }

    showError(msg) {
        this.setState({ error: msg });
        setTimeout(() => {
            this.setState({ error: null });
        }, 3000);
    }

}