import { Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import BaseCom from "./BaseCom";
import FormInput from './FormInput';
import L from './Lang';
import { qreq } from '../shared/qrequest';
import Alert from './Alert';
import { v4 as uuidv4 } from 'uuid';
import Auth from '../shared/Auth';


export default class SelectVendorModal extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return <>
            <Modal isOpen={this.props.show} toggle={() => { if (this.props.onToggle) this.props.onToggle(); }}>
                <ModalHeader>
                    <L>Select Organization</L>
                </ModalHeader>
                <ModalBody>
                    <div className="list-group">
                        {this.props.vendors.map(i => <div key={i.id} className={'list-group-item' + (this.props.activeVendor.id === i.id ? ' active' : '')} onClick={() => this.props.setActiveVendor(i)} role="button">
                            {i.name}
                        </div>)}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button className="btn btn-secondary btn-lg" onClick={() => { if (this.props.onToggle) this.props.onToggle(); }}><L>Close</L></button>
                </ModalFooter>
            </Modal>
        </>;
    }
}