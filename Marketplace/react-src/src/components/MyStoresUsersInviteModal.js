/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import { Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import L from "./Lang";
import FormInput from "./FormInput";
import { qreq } from "../shared/qrequest";

class MyStoresUsersInviteModal extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            info: {}
        };
        this.submitAdd = this.submitAdd.bind(this);
    }

    submitAdd(e) {
        if (e) e.preventDefault();
        this.setState({ submitting: true });
        qreq.post('/api/vendor/user/invite', { ...this.state.info, vendorID: this.props.vendor.id }, j => {
            if (j.errorCode === 0) {
                this.props.onHide();
                this.success('Invite successfully sent!');
                this.setState({ info : {}});
            }
            else
                this.alert(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.unkownErrorCallback();
            this.setState({ submitting: false });
        });
    }

    render() {
        return <Modal isOpen={this.props.show} toggle={this.props.onHide}>
            <ModalHeader>
                <L>Add Manager</L>
            </ModalHeader>
            <form onSubmit={this.submitAdd}>
                <ModalBody>
                    <FormInput model={this.state.info} name="email" label="Email Address to invite as manager" type="email" placeholder="email@provider.com" required />
                </ModalBody>
                <ModalFooter>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={this.state.submitting}><L>Send Invitation</L></button>
                    <button type="button" onClick={this.props.onHide} disabled={this.state.submitting} className="btn btn-secndary btn-lg"><L>Cancel</L></button>
                </ModalFooter>
            </form>
        </Modal>;
    }
}

export default MyStoresUsersInviteModal;