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
import Auth from '../shared/Auth';
import { withParamsAndNavigate } from './WithParamsAndNavigate';
import Card from './Card';

class SetPassword extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: {}
        };
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if (u)
                this.props.navigate('/');
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show)
            this.setState({ info: {} });
        if (prevProps.info !== this.props.info)
            this.setState({ info: {} })
    }

    submit(e) {
        e.preventDefault();
        this.setState({ submitting: true });
        qreq.post('/api/auth/reset-password', { ...this.state.info, confirmPassword: this.state.info.password, code: this.props.params.code }, j => {
            if (j.errorCode === 0) {
                this.setState({ success: true, info: {} });
            }
            else
                this.showError(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.showError(<L>Unknown error ocurred, please try again.</L>);
            this.setState({ submitting: false });
        });
    }

    render() {
        return <>
                <div className="container SetPassword">
                    <Card title="Change Password">
                    {this.state.success ? <>
                        <p><L>Your password has been changed.</L></p>
                        <div className="mt-2">
                            <button type="button" className="btn btn-secondary btn-lg d-block w-100" onClick={() => { if (this.state.success) document.location.replace('/'); if (this.props.onToggle) this.props.onToggle(); }}><L>Continue</L></button>
                        </div>
                    </> :
                        <form onSubmit={this.submit}>
                            <FormInput model={this.state.info} name="password" label="New Password" type="password" required className="mt-2" autoComplete="password" />
                            <div className="mt-2">
                                <button type="submit" className="btn btn-success btn-lg d-block w-100" disabled={this.state.submitting}><L>Change password</L></button>
                            </div>
                            {this.state.error ? <Alert message={this.state.error} type="danger" className="mt-2" /> : ''}
                        </form>}
                </Card>
            </div>
         </>;
    }
}

export default withParamsAndNavigate(SetPassword);