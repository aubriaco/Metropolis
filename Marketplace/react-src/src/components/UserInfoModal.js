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
import { v4 as uuidv4 } from 'uuid';
import Auth from '../shared/Auth';
import LoadingAlert from './LoadingAlert';
import Address from './Address';
import Card from './Card';


export default class UserInfoModal extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: {
                address: {}
            },
            days: [],
            months: [],
            years: [],
            loaded: false
        };

        var n;

        for (n = 1; n <= 31; n++)
            this.state.days.push({ id: n, name: n });

        for (n = 1; n <= 12; n++)
            this.state.months.push({ id: n, name: n });

        var y = new Date().getFullYear();

        for (n = y; n >= 1900; n--)
            this.state.years.push({ id: n, name: n });

        this.submit = this.submit.bind(this);

    }

    componentDidMount() {
        if (this.props.show) {
            this.setState({ info: { address: {} }, loaded: false });
            qreq.get('/api/auth/user/full', j => {
                if (j.item) {
                    if (!j.item.address)
                        j.item.address = {};
                    if (j.item.birthDateY === 1) {
                        j.item.birthDateY = 0;
                        j.item.birthDateM = 0;
                        j.item.birthDateD = 0;
                    }
                    if (!j.item.address.country)
                        j.item.address.country = 'USA';
                    if (!j.item.address.state)
                        j.item.address.state = 'PR';
                    this.setState({ info: j.item });
                }
                this.setState({ loaded: true });
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show) {
            this.componentDidMount();
        }
    }


    submit(e) {
        e.preventDefault();
        this.setState({ submitting: true });
        qreq.post('/api/user/info/save', this.state.info, j => {
            if (j.errorCode === 0) {
                this.setState({ success: true });
                Auth.reset();
                Auth.getLogin();
                if (this.props.onSuccess)
                    this.props.onSuccess();
            }
            else {
                this.setState({ error: j.errorMessage });
                setTimeout(() => {
                    this.setState({ error: null });
                }, 3000);
            }
            this.setState({ submitting: false });
        }, () => {
            this.alert('Unknown error.');
            this.setState({ submitting: false });
        });
    }


    render() {
        return <><Modal isOpen={this.props.show} toggle={() => { if (this.props.onToggle) this.props.onToggle() }} size="lg">
            <ModalHeader toggle={() => { if (this.props.onToggle) this.props.onToggle() }}>
                User Information
            </ModalHeader>
            <ModalBody>
                <p><L>To ensure a secure and trustworthy environment, we kindly request your personal information.</L></p>
                {this.state.loaded ?
                    <form onSubmit={this.submit}>
                        <Card title="Information">
                            <div className="row">
                                <div className="col-md">
                                    <FormInput model={this.state.info} name="firstName" label="First Name" type="text" />
                                </div>
                                <div className="col-md">
                                    <FormInput model={this.state.info} name="lastName" label="Last Name" type="text" />
                                </div>
                            </div>
                            <label className="mb-2">Birth Date</label>
                            <div className="row">
                                <div className="col-md">
                                    <FormInput model={this.state.info} name="birthDateM" label="MM" type="select" options={this.state.months} labelAsPlaceholder required />
                                </div>
                                <div className="col-md">
                                    <FormInput model={this.state.info} name="birthDateD" label="DD" type="select" options={this.state.days} labelAsPlaceholder required />
                                </div>
                                <div className="col-md">
                                    <FormInput model={this.state.info} name="birthDateY" label="YYYY" type="select" options={this.state.years} labelAsPlaceholder required />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md">
                                    <FormInput model={this.state.info} name="phone" label="Phone Number" type="text" />
                                </div>
                            </div>
                        </Card>
                        <Address item={this.state.info.address} />

                        <div className="mt-2">
                            <button type="submit" className="btn btn-success btn-lg d-block w-100" disabled={this.state.submitting}>Save and Continue</button>
                        </div>
                        {this.state.error ? <Alert message={this.state.error} type="danger" className="mt-2" /> : ''}
                    </form>
                    : <LoadingAlert />}

            </ModalBody>
        </Modal>
        </>;
    }
}