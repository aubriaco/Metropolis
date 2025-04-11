import React, { Component } from 'react';
import FormInput from './FormInput';
import L from './Lang';
import { Link } from 'react-router-dom';
import PostSignupModal from './PostSignupModal';
import { qreq } from '../shared/qrequest';
import Auth from '../shared/Auth';
import LoginModal from './LoginModal';
import { withParamsAndNavigate } from './WithParamsAndNavigate';
import RegisterCardModal from './RegisterCardModal';
import AuctionBrowser from './AuctionBrowser';
import ForgotPasswordModal from './ForgotPasswordModal';
import SetPasswordModal from './SetPasswordModal';
import TOSModal from './TOSModal';
import SignupModal from './SignupModal';

class Home extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            showPostSignupModal: false,
            showSetPasswordModal: false,
            showLoginModal: false,
            showSignupModal: false
        };
    }

    componentDidMount() {
        if (this.props.showPostSignupModal) {
            Auth.getLogin(j => {
                this.setState({ user: j, showPostSignupModal: true });
            });
        }
        else if (this.props.showRegisterCardModal) {
            Auth.getLogin(j => {
                this.setState({ user: j });
                qreq.post('/api/user/agreement/check', { documentName: 'TOSBuyers' }, r => {
                    if (r.errorCode === 0) {
                        this.setState({ showRegisterCardModal: true });
                    }
                    else if (r.errorCode === 10) {
                        this.setState({ showTOSModal: true });
                    }
                    else
                        this.alert(r.errorMessage);
                }, () => {
                    this.alert('An unknown error ocurred. Please try again.');
                });
            });
        }
        else if (this.props.showSetPassword) {
            this.setState({ showSetPasswordModal: true });
        }
        else if (this.props.showLoginModal) {
            this.setState({ showLoginModal: true });
        }
        else if (this.props.showSignupModal) {
            this.setState({ showSignupModal: true });
        }
    }

    render() {
        return (<>
            <TOSModal type="TOSBuyers" show={this.state.showTOSModal} onToggle={() => { this.setState({ showTOSModal: false }); if (this.props.onToggle) this.props.onToggle(); }} onSuccess={() => { this.setState({ showTOSModal: false, showRegisterCardModal: true }); }} />
            <LoginModal show={this.state.showLoginModal} onToggle={() => { this.setState({ showLoginModal: false }); this.props.navigate('/'); }} onForgotPassword={() => this.setState({ showForgotPasswordModal: true, showLoginModal: false })} onSignUp={(e) => { e.preventDefault(); this.setState({ showSignupModal: true, showLoginModal: false }); }} />
            <SignupModal show={this.state.showSignupModal} onToggle={() => { this.setState({ showSignupModal: false }); this.props.navigate('/'); }} onLogin={(e) => { e.preventDefault(); this.setState({ showSignupModal: false, showLoginModal: true }); }} />
            <PostSignupModal show={this.state.showPostSignupModal} onToggle={(v) => { if (v === 'register') this.setState({ showTOSModal: true }); this.setState({ showPostSignupModal: false }) }} />
            <RegisterCardModal show={this.state.showRegisterCardModal} onToggle={() => this.setState({ showRegisterCardModal: false })} />
            <ForgotPasswordModal show={this.state.showForgotPasswordModal} onToggle={() => this.setState({ showForgotPasswordModal: false })} onLogin={() => this.setState({ showForgotPasswordModal: false, showLoginModal: true })} />
            <SetPasswordModal show={this.state.showSetPasswordModal} onToggle={() => this.setState({ showSetPasswordModal: false })} code={this.props.params.code} />
            <AuctionBrowser />
        </>
        );
    }
}

export default withParamsAndNavigate(Home);
