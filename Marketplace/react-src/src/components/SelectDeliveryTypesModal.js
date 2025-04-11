/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import BaseCom from "./BaseCom";
import SelectDeliveryTypes from "./SelectDeliveryTypes";
import { qreq } from "../shared/qrequest";
import L from "./Lang";

class SelectDeliveryTypesModal extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            info: {}
        };
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        if (this.props.autoShow) {
            console.log('autoshow', this.props.vendor);
            qreq.get('/api/vendor/get?masterID=' + this.props.vendor.masterID, j => {
                if (j.item) {
                    if (!j.item.deliverySettingsJsonData)
                        this.setState({ show: true });
                }
            });
        }
    }

    submit(e) {
        if (e) e.preventDefault();
        this.setState({ saving: true });
        qreq.post('/api/vendor/settings/save', { deliverySettingsJsonData: this.state.info.deliverySettingsJsonData, name: this.props.vendor.name, id: this.props.vendor.id }, j => {
            if(j.item)
                this.setState({ show: false });
            else
                this.alert(j.errorMessage);
            this.setState({ saving: false });
        }, () => {
            this.unkownErrorCallback();
            this.setState({ saving: false });
        });
    }

    render() {
        return <Modal isOpen={this.state.show} toggle={() => { this.setState({ show: false }); if (this.props.onToggle) this.props.onToggle(); }}>
            <ModalHeader toggle={() => { this.setState({ show: false }); if (this.props.onToggle) this.props.onToggle(); }}>
                <L>Delivery Settings</L>
            </ModalHeader>
            <form onSubmit={this.submit}>
                <ModalBody>
                    <SelectDeliveryTypes onChange={v => this.setState({ info: {...this.state.info, deliverySettingsJsonData: v }})} />
                </ModalBody>
                <ModalFooter>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={this.saving}>Save</button>
                    <button type="button" className="btn btn-secondary btn-lg" disabled={this.saving} onClick={() => this.setState({ show: false })}>Skip</button>
                </ModalFooter>
            </form>
        </Modal>;
    }
}

export default SelectDeliveryTypesModal;