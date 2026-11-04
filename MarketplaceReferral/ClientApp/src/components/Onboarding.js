import Address from "./Address";
import BaseCom from "./BaseCom";
import Card from "./Card";
import FormInput from "./FormInput";
import L from "./Lang";
import Icon from "./Icon";
import { Link } from 'react-router-dom';
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { qreq } from "../shared/qrequest";
import Alert from "./Alert";
import Auth from "../shared/Auth";

class Onboarding extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            info: {
                address: {},
                referralSurvey: {}
            },
            step: 0,
            success: false
        };

        /*
        this.state.info = {
            username: 'testuser12345',
            email: 'testemail12345@yopmail.com',
            fullName: 'Test Person',
            phone: '(123) 123 1234',
            address: {
                line1: '123 Test St',
                line2: '',
                city: 'San Juan',
                postalCode: '00926'
            },
            survey: {}
        };
        */

        this.onSubmit = this.onSubmit.bind(this);
        this.signupEmail = this.signupEmail.bind(this);
        this.filterUsername = this.filterUsername.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if (u)
                this.props.navigate('/dashboard');
        });
    }

    filterUsername(str) {
        str = str.replace(/[^0-9A-Za-z]/g, '');
        this.setState({ info: { ...this.state.info, username: str } });
    }

    signupEmail(e, info) {
        if (e)
            e.preventDefault();
        if (!info)
            info = this.state.info;
        this.setState({ submitting: true });
        qreq.post('/api/signup/check/email', info, j => {
            if (j.errorCode)
                this.showError(j.errorMessage);
            else
                this.setState({ step: 1 });
            this.setState({ submitting: false });
        }, () => {
            this.showError(<L>Unknown error ocurred, please try again.</L>);
            this.setState({ submitting: false });
        });
    }


    onSubmit(e) {
        if (e) e.preventDefault();
        if (this.state.step === 2) {
            this.setState({ submitting: true });
            qreq.post('/api/signup/submit/basic', { ...this.state.info, isRefUser: true }, j => {
                if (j.errorCode)
                    this.showError(j.errorMessage);
                else {
                    qreq.post('/api/auth/login', this.state.info, k => {
                        if (k.errorCode === 0)
                            document.location.replace('/dashboard');
                    });
                    this.state.info.password = null;
                    this.setState({ success: true, info: this.state.info });
                }
                this.setState({ submitting: false });
            }, () => {
                this.showError(<L>Unknown error ocurred, please try again.</L>);
                this.setState({ submitting: false });
            });
        }
        else if (this.state.step === 1) {
            this.setState({ step: 2 });
        }
        else if (this.state.step === 0) {
            if (!this.state.info.fullName)
                this.showError('Full Name is blank.');
            else {
                var fullName = this.state.info.fullName.toLowerCase();
                var n = fullName.indexOf(' ');
                if (n < 0)
                    this.showError('Full Name must have First and Last Name.');
                else {
                    var firstName = fullName.substr(0, n);
                    var lastName = fullName.substr(n + 1);
                    if (firstName.length < 2)
                        this.showError('First Name must be valid. At least 2 characters.')
                    else if (lastName.length < 2)
                        this.showError('Last Name must be valid. At least 2 characters.')
                    else {
                        this.state.info.firstName = firstName;
                        this.state.info.lastName = lastName;
                        this.setState({ info: this.state.info });
                        this.signupEmail();
                    }
                }
            }
        }
    }

    render() {
        if (this.state.success) {
            return <div className="container Onboarding">
                <Card title="Success">
                    <p><L>Remember to check your email</L> <strong>{this.state.info.email}</strong> <L>to validate your account. Rewards can not be dispatched to invalid accounts.</L></p>
                    <div className="d-grid">
                        <Link to="/dashboard" role="button" className="btn btn-primary btn-lg"><L>Continue to Dashboard</L> <Icon icon="faDashboard" /></Link>
                    </div>
                </Card>
            </div>;
        }
        return <div className="container Onboarding">
            <h1><L>Referral Program</L></h1>
            <form onSubmit={this.onSubmit}>
                {this.state.step === 0 ? <>
                    <Card title="Your information">
                        <div className="row row-cols-1 row-cols-md-2">
                            <div className="col">
                                <FormInput model={this.state.info} name="email" label="Your email address" placeholder="myemail@provider.com" type="email" required size="lg" />
                            </div>
                            <div className="col">
                                <FormInput model={this.state.info} name="fullName" label="Your full name" placeholder="Jose Rodriguez" type="text" required size="lg" />
                            </div>
                            <div className="col">
                                <FormInput model={this.state.info} name="phone" label="Your phone number" placeholder="(XXX) XXX-XXXX" type="tel" required size="lg" />
                            </div>
                        </div>
                    </Card>
                    <small className="d-block mb-3 text-muted"><L>Please fill in the precise information. Your reward will be sent under this name. We are not responsible if you can not cash out your reward due to incorrect information.</L></small>
                    <button type="submit" className="btn btn-primary btn-lg d-block w-100" disabled={this.state.submitting}><L>Next</L> <Icon icon="faArrowRight" /></button>
                </> : this.state.step === 1 ? <>
                        <Address item={this.state.info.address} title="Postal address" required />
                        <small className="d-block mb-3 text-muted"><L>You will receive your reward to this address. Please make sure it is a correct postal address.</L></small>
                        <button type="submit" className="btn btn-primary btn-lg d-block w-100" disabled={this.state.submitting}><L>Next</L> <Icon icon="faArrowRight" /></button>
                        <a onClick={() => this.setState({ step: (this.state.step - 1) })} className="d-block p-3 my-3 text-center" role="button" disabled={this.state.submitting}><Icon icon="faArrowLeft" /> <L>Go back to previous step</L></a>
                    </> : this.state.step === 2 ? <>
                            <Card title="Your login information">
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <FormInput model={this.state.info} name="username" label="Username" placeholder="myusername" type="text" required size="lg" onChange={obj => this.filterUsername(obj)} />
                                        <small className="text-muted"><L>Must be at least 3 characters long. Only letters and/or numbers.</L></small>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <FormInput model={this.state.info} name="password" label="Password" placeholder="********" type="password" required size="lg" />
                                        <small className="text-muted"><L>Must be at least 8 characters long, must contain at least 1 digit and 1 symbol.</L></small>
                                    </div>
                                </div>
                            </Card>
                            <Card title="Survey">
                                {!this.state.info.referralSurvey.hasEnergyProvider ?
                                    <FormInput model={this.state.info.referralSurvey} name="isInterestedSolar" label="I am interested in having solar energy in my home." type="switch" onChange={() => this.setState({ info: this.state.info })} /> :''}
                                <FormInput model={this.state.info.referralSurvey} name="hasEnergyProvider" label="I already have solar energy system installed in my home." type="switch" onChange={() => this.setState({ info: this.state.info })} />
                                {this.state.info.referralSurvey.hasEnergyProvider ?
                                    <FormInput model={this.state.info.referralSurvey} name="isSunrunClient" label="I am a client of Sun Run." type="switch" onChange={() => this.setState({ info: this.state.info })} /> : ''}

                            </Card>
                            <small className="d-block mb-3"><L>By registering you agree to our</L> <a href="#" onClick={e => { e.preventDefault(); this.setState({ showTOSModal: true }); }}><L>Terms of Service</L></a> <L>and</L> <a href="#" onClick={e => { e.preventDefault(); this.setState({ showPrivacyPolicyModal: true }); }}><L>Privacy Policy.</L></a></small>
                            <button type="submit" className="btn btn-primary btn-lg d-block w-100" disabled={this.state.submitting}><L>Complete</L> <Icon icon="faArrowRight" /></button>
                            <a onClick={() => this.setState({ step: (this.state.step - 1) })} className="d-block p-3 my-3 text-center" role="button" disabled={this.state.submitting}><Icon icon="faArrowLeft" /> <L>Go back to previous step</L></a>

                </> : ''}
                {this.state.error ? <Alert type="danger" className="mt-2"><L>{this.state.error}</L></Alert> : ''}
            </form>
        </div>;
    }
}

export default withParamsAndNavigate(Onboarding);