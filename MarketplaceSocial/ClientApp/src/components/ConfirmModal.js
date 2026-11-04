import { Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import * as React from 'react';

export default class ConfirmModal extends React.Component {


    componentDidUpdate(prevProps) {
        if (prevProps.children !== this.props.children) {
            this.setState({ });
        }
    }

    render() {
        return <Modal isOpen={this.props.show} toggle={() => { if (this.props.onToggle) this.props.onToggle(); }}>
            <ModalHeader>
                {this.props.title}
            </ModalHeader>
            <ModalBody>
                {this.props.children}
            </ModalBody>
            <ModalFooter>
                {this.props.onToggle ? <button className="btn btn-secondary" onClick={() => this.props.onToggle()}>
                    Cancel
                </button> : ''}
                {this.props.onConfirm ? <button className="btn btn-primary" onClick={() => this.props.onConfirm()}>
                    Confirm
                </button> : ''}
            </ModalFooter>
        </Modal>;
    }
}