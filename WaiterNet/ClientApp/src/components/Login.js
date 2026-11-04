import BaseCom from "./BaseCom";
import FormInput from './FormInput';
import Alert from './Alert';
import L from './Lang';
import { qreq } from "../shared/qrequest";
import Card from "./Card";
import { Link } from 'react-router-dom';
import Logo from "./Logo";
import Auth from "../shared/Auth";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import LoadingAlert from "./LoadingAlert";

class Login extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: {}
        };
        this.login = this.login.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if(u)
                window.location.replace('/manage');
            else
                this.setState({ loaded: true});
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
                window.location.replace('/manage');
            }
            this.setState({ submitting: false });
        }, () => {
            this.showError('Unknown error ocurred, please try again.');
            this.setState({ submitting: false });
        });
    }

    render() {
        if(!this.state.loaded)
            return <LoadingAlert />
        return <>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-4">

                        <Card title="Login" className="mt-5">
                            <form onSubmit={this.login}>
                                <FormInput model={this.state.info} name="email" label="Email" type="email" required className="mt-2" autoComplete="email" />
                                <FormInput model={this.state.info} name="password" label="Password" type="password" required autoComplete="current-password" />
                                {this.props.onForgotPassword ? <p className="text-center"><a href="#" onClick={e => { e.preventDefault(); this.props.onForgotPassword(); }}><L>I forgot my password!</L></a></p> : ''}
                                <div className="mt-2">
                                    <button type="submit" className="btn btn-primary btn-lg d-block w-100" disabled={this.state.submitting}><L>Login</L></button>
                                </div>
                                {this.state.error ? <Alert message={this.state.error} type="danger" className="mt-2" /> : ''}
                            </form>
                            <div className="text-center mt-3">
                                <Link to="/forgot-password"><L>Forgot Password?</L></Link>
                            </div>
                        </Card>
                        <div className="text-center mt-4">
                            <Link to="/"><L>Back to Home Page</L></Link>
                        </div>
                    </div>
                </div>
            </div></>;
    }
}

export default withParamsAndNavigate(Login);