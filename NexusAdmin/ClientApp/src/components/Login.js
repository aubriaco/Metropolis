import BaseCom from "./BaseCom";
import FormInput from './FormInput';
import Alert from './Alert';
import L from './Lang';
import { qreq } from "../shared/qrequest";

export default class Login extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: {}
        };
        this.login = this.login.bind(this);
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
                if (this.props.onSuccess)
                    this.props.onSuccess();
                else
                    window.location.reload();
            }
            this.setState({ submitting: false });
        }, () => {
            this.showError('Unknown error ocurred, please try again.');
            this.setState({ submitting: false });
        });
    }

    render() {
        return <>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-5 bg-light p-5 rounded">
            <div className="text-center">
                <h1><L>Login</L></h1>
                {this.props.onSignUp ?
                    <p className="lead"><L>Ready to get started?</L> <a href="/home/signup" onClick={this.props.onSignUp}><L>Create your account!</L></a></p> : ''}
                <hr />
            </div>
            <form onSubmit={this.login}>
                <FormInput model={this.state.info} name="email" label="Email" type="text" required className="mt-2" autoComplete="email" />
                <FormInput model={this.state.info} name="password" label="Password" type="password" required autoComplete="current-password" />
                {this.props.onForgotPassword ? <p className="text-center"><a href="#" onClick={e => { e.preventDefault(); this.props.onForgotPassword(); }}><L>I forgot my password!</L></a></p> : ''}
                <div className="mt-2">
                    <button type="submit" className="btn btn-success btn-lg d-block w-100" disabled={this.state.submitting}><L>Login</L></button>
                </div>
                {this.state.error ? <Alert message={this.state.error} type="danger" className="mt-2" /> : ''}
            </form>
                </div>
            </div>
            </div></>;
    }
}