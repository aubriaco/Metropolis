import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { Link } from 'react-router-dom';
import BaseCom from "./BaseCom";
import FormInput from './FormInput';
import L from './Lang';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import { qreq } from '../shared/qrequest';
import Globals from '../shared/Globals';
import Alert from './Alert';

export default class ForgotPasswordModal extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: { ...props.info }
        };
        this.submit = this.submit.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show)
            this.setState({ info: { ...this.props.info } });
        if (prevProps.info !== this.props.info)
            this.setState({ info: { ...this.props.info } })
    }

    submit(e) {
        e.preventDefault();
        this.setState({ submitting: true });
        qreq.post('/api/auth/forgot-password', this.state.info, j => {
            if (j.errorCode === 0)
                this.setState({ success: true });
            else
                this.showError(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.showError(<L>Unknown error ocurred, please try again.</L>);
            this.setState({ submitting: false });
        });
    }

    render() {
        return <><Modal isOpen={this.props.show} toggle={() => { if (this.props.onToggle) this.props.onToggle() }}>
            <ModalBody>
                <div className="p-5 pt-2">
                    <div className="text-center">
                    <h1><L>Forgot Password?</L></h1>
                    {this.props.onLogin ?
                        <p className="lead"><a href="/home/signup" onClick={e => { e.preventDefault(); this.props.onLogin(); }}><L>Go back to login.</L></a></p> : ''}
                    <hr />
                    </div>
                    {this.state.success ? <>
                        <p><L>An email has been sent to</L> <strong>{this.state.info.email}</strong> <L>with further instructions.</L></p>
                    </> :
                        <form onSubmit={this.submit}>
                            <FormInput model={this.state.info} name="email" label="Email" type="email" required className="mt-2" autoComplete="email" />
                            <div className="mt-2">
                                <button type="submit" className="btn btn-success btn-lg d-block w-100" disabled={this.state.submitting}><L>Request</L></button>
                            </div>
                            {this.state.error ? <Alert message={this.state.error} type="danger" className="mt-2" /> : ''}
                        </form>}
                </div>
            </ModalBody>
        </Modal></>;
    }
}