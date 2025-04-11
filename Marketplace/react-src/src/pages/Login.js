/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import React from 'react';
import BaseComponent from '../components/BaseCom';
import FormInput from '../components/FormInput';
import { withParamsAndNavigate } from '../components/WithParamsAndNavigate';
import configData from '../config.json'
import '../css/style.css';
import Globals from '../shared/Globals';
import { qreq } from '../shared/qrequest';

class Login extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            credentials: {},
            submitting: false
        };
        this.submit = this.submit.bind(this);
        this.setUser = props.setUser;
    }

    submit(e) {
        e.preventDefault();
        this.setState({ submitting: true });
        qreq.post('/api/auth/login', this.state.credentials, j => {
            if (j.errorCode)
                this.alert(j.errorMessage);
            else if (j.item) { 
                Globals.set('user', j.item);
                Globals.set('sid', j.item.sid);
                this.setUser(j.item);
                this.props.navigate('/dashboard');
            }
            this.setState({ submitting: false });
        }, e => {
            this.setState({ submitting: false });
        });
    }

    render() {
        return (
            <div className="c-login">
                <div className="container">
                    <div className="row">
                        <div className="col-md-7">
                            <div className="p-4">
                                <div className="bg-white p-4 rounded-3">
                                    <img src="img/logo-d.png" alt="" className="img-fluid w-50 d-block mx-auto" />
                                    <img src="img/login-pic.png" alt="" className="img-fluid p10-mh90 d-none d-md-block" />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-5">
                            <div className="p-4">
                                <div className="bg-white p-4 rounded-3">
                                    <form onSubmit={this.submit}>
                                        <h1>Login</h1>
                                        <hr />
                                        <FormInput model={this.state.credentials} name="username" label="Email Address" type="text" required={true} labelAsPlaceholder={true} />
                                        <FormInput model={this.state.credentials} name="password" label="Password" type="password" required={true} labelAsPlaceholder={true} />
                                        <div className="d-grid mt-4">
                                            <button type="submit" className="btn btn-primary" disabled={this.state.submitting}>Login</button>
                                        </div>
                                    </form>
                                    {this.state.error ? (<div className="alert alert-danger mt-2">{this.state.error}</div>) : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withParamsAndNavigate(Login);