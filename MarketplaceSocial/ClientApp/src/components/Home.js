import React, { Component } from 'react';
import Auth from '../shared/Auth';
import Alert from './Alert';
import BaseCom from './BaseCom';
import FormInput from './FormInput';
import L from './Lang';
import Login from './Login';
import Timeline from './Timeline';
import SignupModal from './SignupModal';
import ForgotPasswordModal from './ForgotPasswordModal';

export class Home extends BaseCom {


    componentDidMount() {
        Auth.getLogin(j => {
            this.setState({ user: j, loaded: true });
        });
    }


    render() {
        if (!this.state.loaded)
            return <></>;
        return <>
            {this.state.user ? <Timeline /> : <>
                <SignupModal show={this.state.showSignupModal} onToggle={() => this.setState({ showSignupModal: false })} />
                <ForgotPasswordModal show={this.state.showForgotPasswordModal} onToggle={() => this.setState({ showForgotPasswordModal: false })} />
                <Login onSignUp={e => {e.preventDefault(); this.setState({ showSignupModal: true });}} onForgotPassword={() => this.setState({ showForgotPasswordModal: true })} />
            </>}
        </>;
    }
}
