/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Modal, ModalBody } from 'reactstrap';
import BaseCom from "./BaseCom";
import FormInput from './FormInput';
import L from './Lang';
import { qreq } from '../shared/qrequest';
import Globals from '../shared/Globals';
import Auth from '../shared/Auth';
import Card from './Card';
import Icon from './Icon';
import { Link } from 'react-router-dom';
import SubHeader from './SubHeader';
import AppStickyBottom from './AppStickyBottom';
import { withParamsAndNavigate } from './WithParamsAndNavigate';

class Signup extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: {},
            step: null
        };
        this.signupEmail = this.signupEmail.bind(this);
        this.signupUser = this.signupUser.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if(u)
                this.props.navigate('/my');
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.show !== this.props.show) {
            if (this.props.show && this.props.email) {
                this.setState({ info: { email: this.props.email } });
                if (this.props.from === 'login')
                    this.signupEmail(null, { email: this.props.email });
            }
            else
                this.setState({ info: {} });
            if (this.props.show) {
                Auth.getLogin(j => {
                    if (j)
                        window.location.replace('/');
                });
            }
        }

        if(prevState.step !== this.state.step) {
            window.scrollTo(0, 0);
        }
    }

    signupEmail(e, info) {
        if (!info)
            info = this.state.info;
        if (e) {
            e.preventDefault();
            if (!info.acceptTerms) {
                this.alert(<L>You must accept the Privacy Policy and Terms of Service.</L>);
                return;
            }
        }
        this.setState({ submitting: true });
        qreq.post('/api/signup/check/email', info, j => {
            if (j.errorCode)
                this.alert(j.errorMessage);
            else
                this.setState({ step: 2 });
            this.setState({ submitting: false });
        }, () => {
            this.showError(<L>Unknown error ocurred, please try again.</L>);
            this.setState({ submitting: false });
        });
    }


    signupUser(e) {
        e.preventDefault();
        this.setState({ submitting: true });
        qreq.post('/api/signup/submit/basic', { ...this.state.info, username: this.state.info.email }, j => {
            if (j.errorCode)
                this.alert(j.errorMessage);
            else
                this.setState({ step: 3 });
            this.setState({ submitting: false });
        }, () => {
            this.showError(<L>Unknown error ocurred, please try again.</L>);
            this.setState({ submitting: false });
        });
    }

    render() {
        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title="Customer Signup" />
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            {!this.state.step ? <Card>
                                <div className="d-flex justify-content-start align-items-center">
                                    <Icon icon="faTruckFast" className="fs-1 d-block text-dark opacity-50" />
                                    <div className="ms-3">
                                        <strong className="fs-5"><L>Start Shopping Now!</L></strong>
                                        <p><L>Registering in Metropolis is fast and and free.</L></p>
                                    </div>
                                </div>
                            </Card> : ''}
                            <Card title="Signup for Metropolis">
                                {this.state.step === 3 ? <>
                                    <div className="text-center">
                                        <h1><L>Please verify your email</L></h1>
                                        <hr />
                                    </div>
                                    <div>
                                        <p><L>Just a few more steps! We've sent a verification email to:</L> <strong>{this.state.info.email}</strong></p>
                                        <p><L>Please click the button within the email to activate your account.</L></p>
                                        <div className="bg-light p-3 mt-2 rounded border">
                                            <strong><L>Can't find the email?</L></strong>
                                            <p><L>Please check your spam folder in case the email is located there. If you're still encountering difficulties, kindly add</L> <i>"notify@{Globals.domainName}"</i> <L>to your email contacts.</L></p>
                                        </div>
                                    </div>
                                </> : this.state.step === 2 ? <>
                                    <form onSubmit={this.signupUser}>
                                        <FormInput model={this.state.info} name="password" label="Password" type="password" required placeholder="********" />
                                        <AppStickyBottom showGoBack>
                                            <button type="submit" className="btn btn-success btn-lg" disabled={this.state.submitting}><L>Create Account</L></button>
                                        </AppStickyBottom>
                                        <div className="mt-4">
                                            <small><L>By creating a</L> {Globals.appName} <L>account, you are agreeing to our</L> <Link to="/privacy-policy" target="_blank"><L>Privacy Policy</L></Link> <L>and</L> <Link to="/terms-of-service" target="_blank"><L>Terms of Service</L></Link>. <L>You also agree to receive email communications from</L> {Globals.appName} <L>and can change your subscription preferences at any time.</L></small>
                                        </div>
                                    </form>
                                </> : <>
                                    <div className="text-center">
                                        {this.props.onLogin ?
                                            <p className="lead"><L>Already have an account?</L> <a href="/home/login" onClick={this.props.onLogin}><L>Login here!</L></a></p> : ''}
                                    </div>
                                    <form onSubmit={this.signupEmail}>
                                        <FormInput model={this.state.info} name="email" label="Email address" type="email" required placeholder="myemailaddress@myprovider.com" autoFocus />
                                        <div className="my-2">
                                            <FormInput model={this.state.info} name="acceptTerms" label={<><L>I accept the</L> <Link to="/privacy-policy" target="_blank"><L>Privacy Policy</L></Link> <L>and</L> <Link to="/terms-of-service" target="_blank"><L>Terms of Service</L></Link>.</>} type="switch" required />
                                        </div>
                                        <AppStickyBottom showGoBack>
                                            <button type="submit" className="btn btn-success btn-lg" disabled={this.state.submitting}><L>Next</L></button>
                                        </AppStickyBottom>
                                    </form>
                                </>}
                            </Card>
                            {!this.state.step ? <Card>
                                <div className="mt-3">
                                    <p className="fs-5"><L>Are you a business owner?</L></p>
                                    <Link to="/vendor/signup" className="btn btn-secondary btn-lg"><Icon icon="faShop" /> <L>Sign Up as a Business</L></Link>
                                </div>
                            </Card> : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(Signup);