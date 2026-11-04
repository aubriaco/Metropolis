import { Modal, ModalBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import BaseCom from "./BaseCom";
import FormInput from './FormInput';
import L from './Lang';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import { qreq } from '../shared/qrequest';
import Globals from '../shared/Globals';
import Alert from './Alert';

export default class LoginModal extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: {}
        };
        this.login = this.login.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show)
            this.setState({ info: {} });
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
        return <><Modal isOpen={this.props.show} toggle={() => { if (this.props.onToggle) this.props.onToggle() }}>
            <ModalBody>
                <div className="p-5">
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
            </ModalBody>
        </Modal></>;
    }
}