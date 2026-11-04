import React, { Component } from 'react';
import Login from './Login';
import Auth from '../shared/Auth';
import BaseCom from './BaseCom';
import TableList from './TableList';

export class Home extends BaseCom {

    componentDidMount() {
        Auth.getLogin(j => {
            this.setState({ user: j, loaded: true });
        });
    }

    render() {
        if (!this.state.loaded)
            return <></>;
        if (this.state.user)
            return <TableList />;
        else
            return <Login />;
    }
}
