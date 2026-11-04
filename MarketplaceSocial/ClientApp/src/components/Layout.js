import React, { Component } from 'react';
import { Container } from 'reactstrap';
import NavMenu from './NavMenu';
import LoginModal from './LoginModal';
import BaseCom from './BaseCom';
import SignupModal from './SignupModal';
import Globals from '../shared/Globals';

export class Layout extends BaseCom {

    constructor(props) {
        super(props);
        this.setLayoutState = this.setLayoutState.bind(this);
    }

    setLayoutState(v) {
        this.setState(v);
    } 

    render() {
        return (
            <div>
                <LoginModal show={this.state.showLoginModal} onToggle={() => this.setState({ showLoginModal: false })} onSignUp={e => { e.preventDefault(); this.setState({ showSignUpModal: true, showLoginModal: false }); }} />
                <SignupModal show={this.state.showSignUpModal} onToggle={() => this.setState({ showSignUpModal: false })} />
                <NavMenu setLayoutState={this.setLayoutState} onLangChange={lang => this.props.onLangChange(lang)} />
                <div className="page-wrapper">
                    {this.props.children}
                </div>
            </div>
        );
    }
}
