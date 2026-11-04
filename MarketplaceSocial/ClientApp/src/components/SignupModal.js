import { Modal, ModalBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import BaseCom from "./BaseCom";
import FormInput from './FormInput';
import L from './Lang';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import { qreq } from '../shared/qrequest';
import Globals from '../shared/Globals';
import Auth from '../shared/Auth';

export default class SignupModal extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: {},
            step: null
        };
        this.signupEmail = this.signupEmail.bind(this);
        this.signupUser = this.signupUser.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show) {
            this.setState({ info: {} });
            if (this.props.show) {
                Auth.getLogin(j => {
                    if (j)
                        document.location.replace('/');
                });
            }
        }
    }

    signupEmail(e) {
        e.preventDefault();
        this.setState({ submitting: true });
        qreq.post('/api/signup/check/email', this.state.info, j => {
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
        qreq.post('/api/signup/submit/basic', { ...this.state.info, isAuctionUser: true, isAuctioneer: this.props.isAuctioneer ?? false }, j => {
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
        return <><Modal isOpen={this.props.show} toggle={() => { this.setState({ step: null }); if (this.props.onToggle) this.props.onToggle() }}>
            <ModalBody>
                <div className="p-5">
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
                        <div className="text-center">
                            <h1><L>Sign Up!</L></h1>
                            <hr />
                        </div>
                        <form onSubmit={this.signupUser}>
                            <FormInput model={this.state.info} name="password" label="Password" type="password" required />
                            <p className="mb-2"><L>Password must contain at least 8 characters, uppercase letters, lowercase letters, one or more numbers, and one or more symbols.</L></p>
                            <FormInput model={this.state.info} name="username" label="Username (public display name)" type="text" required className="mt-2" />
                            <div className="mt-2">
                                <button type="submit" className="btn btn-success btn-lg d-block w-100" disabled={this.state.submitting}><L>Create Account</L></button>
                            </div>
                            <div className="mt-4">
                                <small><L>By creating a</L> {Globals.appName} <L>account, you are agreeing to our Terms of Use and Privacy Policy. You also agree to receive email communications from</L> {Globals.appName} <L>and can change your subscription preferences at any time.</L></small>
                            </div>
                        </form>
                    </> : <>
                        <div className="text-center">
                            <h1><L>Sign Up!</L></h1>
                            {this.props.onLogin ?
                                <p className="lead"><L>Already have an account?</L> <a href="/home/login" onClick={this.props.onLogin}><L>Login here!</L></a></p> : ''}
                            <hr />
                        </div>
                        <form onSubmit={this.signupEmail}>
                            <FormInput model={this.state.info} name="email" label="Email address" type="email" required />
                            <div className="mt-2">
                                <button type="submit" className="btn btn-success btn-lg d-block w-100" disabled={this.state.submitting}><L>Next</L></button>
                            </div>
                        </form>
                    </>}
                </div>
            </ModalBody>
        </Modal></>;
    }
}