import BaseCom from "./BaseCom";
import FormInput from './FormInput';
import Alert from './Alert';
import L from './Lang';
import { qreq } from "../shared/qrequest";
import Card from "./Card";
import { Link } from 'react-router-dom';
import SignupModal from "./SignupModal";
import Globals from "../shared/Globals";
import NativeNav from "./NativeNav";
import Auth from "../shared/Auth";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class Login extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: {}
        };
        this.login = this.login.bind(this);
        this.onSignUp = this.onSignUp.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if(u)
                this.props.navigate('/my');
        });
    }

    login(e) {
        e.preventDefault();
        this.setState({ submitting: true });

        qreq.post('/api/auth/login/email', { ...this.state.info }, j => {
            if (j.errorCode) {
                this.setState({ error: j.errorMessage });
                setTimeout(() => {
                    this.setState({ error: null });
                }, 3000);
            }
            else {
                window.location.replace('/');
            }
            this.setState({ submitting: false });
        }, () => {
            this.showError('Unknown error ocurred, please try again.');
            this.setState({ submitting: false });
        });
    }

    onSignUp(e) {
        if(e) e.preventDefault();
        this.setState({ showSignupModal: true });
    }

    render() {
        return <>
            <NativeNav show={Globals.mobileView} noBack />
            <SignupModal email={this.state.email} from="login" show={this.state.showSignupModal} onToggle={() => { this.setState({ showSignupModal: false }); if (this.props.onToggle) this.props.onToggle(); }} />

            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <Card title="Login" alignTitle="center">

                            <p className="lead text-center"><L>Ready to get started?</L> <a href="/home/signup" onClick={this.onSignUp}><L>Create your account!</L></a></p>
                            <hr />
                            <form onSubmit={this.login}>
                                <FormInput model={this.state.info} name="email" label="Email" type="email" required className="mt-2" autoComplete="email" placeholder="myemailaddress@myprovider.com" />
                                <FormInput model={this.state.info} name="password" label="Password" type="password" required autoComplete="current-password" placeholder="********" />
                                {this.props.onForgotPassword ? <p className="text-center"><a href="#" onClick={e => { e.preventDefault(); this.props.onForgotPassword(); }}><L>I forgot my password!</L></a></p> : ''}
                                <div className="mt-2">
                                    <button type="submit" className="btn btn-success btn-lg d-block w-100" disabled={this.state.submitting}><L>Login</L></button>
                                </div>
                                {this.state.error ? <Alert message={this.state.error} type="danger" className="mt-2" /> : ''}
                            </form>
                            <div className="text-center mt-3">
                                <Link to="/forgot-password"><L>Forgot Password?</L></Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div></>;
    }
}

export default withParamsAndNavigate(Login);