/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link } from "react-router-dom";
import BaseCom from "./BaseCom";
import Card from "./Card";
import FormInput from "./FormInput";
import Icon from "./Icon";
import L from "./Lang";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import SubHeader from "./SubHeader";
import Address from "./Address";
import { qreq } from "../shared/qrequest";
import Globals from "../shared/Globals";
import Auth from "../shared/Auth";
import AppStickyBottom from "./AppStickyBottom";

class VendorSignup extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            info: {
                vendor: {
                    address: {
                        country: 'USA',
                        state: 'PR'
                    }
                }
            },
            step: 1
        };
        this.onChange = this.onChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if (u)
                this.props.navigate('/my');
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.step !== this.state.step || prevState.success !== this.state.success) {
            window.scrollTo(0, 0);
        }
    }

    onChange(v) {
        this.setState({ info: { ...this.state.info } });
    }

    onPasswordChange(v) {
        if (this.passwordCompliantTimer)
            clearTimeout(this.passwordCompliantTimer);
        if (!v) {
            this.setState({ passwordCompliantMsg: null });
            return;
        }
        else {
            this.passwordCompliantTimer = setTimeout(() => {
                qreq.post('/api/auth/password-compliant', { password: v }, j => {
                    if (j.errorCode)
                        this.setState({ passwordCompliantMsg: j.errorMessage });
                    else
                        this.setState({ passwordCompliantMsg: true });
                });
            }, 1000);
        }
        this.setState({ info: { ...this.state.info } });
    }

    submit(e) {
        if (e) e.preventDefault();
        if (this.state.step === 1 && !this.state.info.acceptTerms) {
            this.alert(<L>You must accept the Privacy Policy and Terms of Service.</L>);
            return;
        }
        if (this.state.step === 4) {
            if (this.state.info.password !== this.state.info.confirmPassword) {
                this.alert('Passwords entered do not match.');
                return;
            }
            this.setState({ submitting: true });
            qreq.post('/api/signup/submit/basic', { ...this.state.info, username: this.state.info.email }, j => {
                if (j.errorCode === 0) {
                    this.setState({ success: true });
                }
                else
                    this.alert(j.errorMessage);
                this.setState({ submitting: false });
            }, () => {
                this.unkownErrorCallback();
                this.setState({ submitting: false });
            });
        }
        else
            this.setState({ step: this.state.step + 1 });
    }

    render() {
        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title="Business Signup" />
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            {this.state.step === 1 ? <Card>
                                <div className="d-flex justify-content-start align-items-center">
                                    <Icon icon="faShop" className="fs-1 d-block text-dark opacity-50" />
                                    <div className="ms-3">
                                        <strong className="fs-5"><L>Fast and Easy</L></strong>
                                        <p><L>Registering in Metropolis is fast and and free.</L></p>
                                    </div>
                                </div>
                            </Card> : ''}
                            {this.state.success ? <Card title="Successfully Registered!">
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
                            </Card> :
                                <form onSubmit={this.submit}>
                                    {this.state.step >= 3 ? <Card title="User Information">
                                        <FormInput model={this.state.info} name="email" label="Email address" type="email" required placeholder="myemailaddress@myprovider.com" autoFocus />
                                        <FormInput model={this.state.info} name="password" label="Password" type="password" required placeholder="********" onChange={this.onPasswordChange} />
                                        {this.state.passwordCompliantMsg ? this.state.passwordCompliantMsg === true ? <small className="d-block text-success mb-3">Good password!</small> : <small className="d-block text-danger mb-3">{this.state.passwordCompliantMsg}</small> : <small className="d-block text-secondary mb-3">Must contain at least 8 characters, uppercase letters, lowercase letters, 1 number or more and 1 symbol or more.</small>}
                                        {this.state.step === 4 ? <>
                                            <FormInput model={this.state.info} name="confirmPassword" label="Confirm Password" type="password" required placeholder="********" id="confirmPassword" autoFocus onChange={this.onChange} />
                                            {this.state.info.password && this.state.info.confirmPassword && this.state.info.password === this.state.info.confirmPassword ? <small className="d-block text-success mb-3">Passwords match!</small> : ''}
                                        </> : ''}
                                        <AppStickyBottom>
                                            <button type="button" className="btn btn-lg btn-secondary d-block d-md-none" onClick={() => this.setState({ step: this.state.step - (this.state.step === 4 ? 2 : 1) })} disabled={this.state.submitting}><L>Go Back</L></button>
                                            <button type="submit" className="btn btn-lg btn-success d-block" disabled={this.state.submitting}><L>Submit</L></button>
                                        </AppStickyBottom>
                                        <div className="d-none d-md-grid">
                                            <button type="button" className="btn btn-lg btn-secondary" onClick={() => this.setState({ step: this.state.step - (this.state.step === 4 ? 2 : 1) })} disabled={this.state.submitting}><L>Go Back</L></button>
                                        </div>
                                        </Card> : this.state.step === 2 ? <Address title="Business Address" item={this.state.info.vendor.address} required autoFocus>
                                        <AppStickyBottom>
                                            <button type="button" className="btn btn-lg btn-secondary d-block d-md-none" onClick={() => this.setState({ step: this.state.step - 1 })} disabled={this.state.submitting}><L>Go Back</L></button>
                                            <button type="submit" className="btn btn-lg btn-success d-block" disabled={this.state.submitting}><L>Next</L></button>
                                        </AppStickyBottom>
                                        <div className="d-none d-md-grid">
                                            <button type="button" className="btn btn-lg btn-secondary" onClick={() => this.setState({ step: this.state.step - 1 })} disabled={this.state.submitting}><L>Go Back</L></button>
                                        </div>
                                        </Address> :
                                        <Card title="Sell with Metropolis">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <FormInput model={this.state.info.vendor} name="name" label="Business Name" type="text" required placeholder="Super Store" autoFocus />
                                                </div>
                                                <div className="col-md-6">
                                                    <FormInput model={this.state.info.vendor} name="email" label="Your Email" type="email" required placeholder="myemailaddress@myprovider.com" />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <FormInput model={this.state.info.vendor} name="phone" label="Your Phone Number" type="tel" required placeholder="7870000000" />
                                                </div>
                                                <div className="col-md-6">
                                                    <FormInput model={this.state.info.vendor.address} name="postalCode" label="Zip code of the business" type="text" required placeholder="00000" />
                                                </div>
                                            </div>
                                            <div className="my-2">
                                                <FormInput model={this.state.info} name="acceptTerms" label={<><L>I accept the</L> <Link to="/privacy-policy" target="_blank"><L>Privacy Policy</L></Link> <L>and</L> <Link to="/terms-of-service" target="_blank"><L>Terms of Service</L></Link>.</>} type="switch" required />
                                            </div>
                                            <AppStickyBottom showGoBack>
                                                <button type="submit" className="btn btn-success btn-lg d-block w-md-100" disabled={this.state.submitting}><L>Next</L></button>
                                            </AppStickyBottom>
                                        </Card>}
                                </form>}
                            {this.state.step === 1 ? <Card className="d-none d-md-block">
                                <div className="mt-3">
                                    <p className="fs-5"><L>Only looking to shop in Metropolis?</L></p>
                                    <Link to="/signup" className="btn btn-secondary btn-lg"><Icon icon="faShop" /> <L>Sign Up as a Customer</L></Link>
                                </div>
                            </Card> : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(VendorSignup);