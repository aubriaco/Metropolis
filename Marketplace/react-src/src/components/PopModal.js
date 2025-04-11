/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import BaseCom from './BaseCom';
import L from './Lang';

export const Pop = {

    init(showFunction, hideFunction, confirmFunction) {
        this.show = showFunction;
        this.hide = hideFunction;
        this.showConfirm = confirmFunction;
    },

    show(children, title, noFooter) {
        //overriden on init
    },

    showConfirm(children, title, callback) {
        //overriden on init
    },

    hide() {
        //overriden on init
    }
};

export class PopModal extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            show: false
        }
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.showConfirm = this.showConfirm.bind(this);
        Pop.init(this.showModal, this.hideModal, this.showConfirm);
    }

    showModal(children, title, noFooter) {
        this.setState({ children: children, title: title, show: true, noFooter: noFooter });
    }

    hideModal() {
        this.setState({ children: null, title: null, show: false });
    }

    showConfirm(children, title, callback) {
        this.setState({ children: children, title: title, show: true, onConfirm: callback });        
    }

    render() {
        return <div className="PopModal">
            <Modal isOpen={this.state.show} toggle={() => { this.setState({ show: false }); if (this.state.onToggle) this.state.onToggle(); }}>
                {this.state.title ? <ModalHeader>
                    {this.state.title}
                </ModalHeader> : ''}
                <ModalBody>
                    {this.state.children}
                </ModalBody>
                {!this.state.noFooter ? <ModalFooter>
                    {!this.state.onConfirm ? <button className="btn btn-secondary btn-lg" onClick={() => { this.setState({ show: false }); if (this.state.onToggle) this.state.onToggle(); }}><L>Close</L></button> : ''}
                    {this.state.onConfirm ? <button className="btn btn-secondary" onClick={() => { this.setState({ show: false }); if (this.state.onToggle) this.state.onToggle(); }}>
                        <L>Cancel</L>
                    </button> : ''}
                    {this.state.onConfirm ? <button className="btn btn-primary" onClick={() => { this.state.onConfirm(); this.setState({ show: false }); if (this.state.onToggle) this.state.onToggle(); }}>
                        <L>Confirm</L>
                    </button> : ''}
                </ModalFooter> : ''}
            </Modal>
        </div>;
    }
}