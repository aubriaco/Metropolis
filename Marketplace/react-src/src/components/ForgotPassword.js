/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
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
import SubHeader from './SubHeader';

class ForgotPassword extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: { ...props.info }
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
                this.alert(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.alert(<L>Unknown error ocurred, please try again.</L>);
            this.setState({ submitting: false });
        });
    }

    render() {
        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title="Forgot Password" path={[['/login', <L>Login</L>]]} />
                <div className="container ForgotPassword">
                    <div className="row justify-content-center">
                        <div className="col-md-4">
                            <Card title="Forgot Password?">
                                {this.state.success ? <>
                                    <p><L>An email has been sent to</L> <strong>{this.state.info.email}</strong> <L>with further instructions.</L></p>
                                </> :
                                    <form onSubmit={this.submit}>
                                        <FormInput model={this.state.info} name="email" label="Email" type="email" required className="mt-2" autoComplete="email" placeholder="myemailaddress@myprovider.com" autoFocus />
                                        <div className="mt-2 d-grid">
                                            <button type="submit" className="btn btn-success btn-lg" disabled={this.state.submitting}><L>Request</L></button>
                                        </div>
                                        {this.state.error ? <Alert message={this.state.error} type="danger" className="mt-2" /> : ''}
                                    </form>}
                                <div className="text-center mt-3">
                                    <Link to="/login"><L>Back to Login</L></Link>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(ForgotPassword);