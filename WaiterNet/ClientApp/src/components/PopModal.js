import { Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import BaseCom from './BaseCom';
import L from './Lang';
import './PopModal.css';

export const Pop = {

    init(showFunction) {
        this.show = showFunction;
    },

    show(children, title) {

    }
};

export class PopModal extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            show: false
        }
        this.showModal = this.showModal.bind(this);
        Pop.init(this.showModal);
    }

    showModal(children, title) {
        this.setState({ children: children, title: title, show: true });
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
                <ModalFooter>
                    <button className="btn btn-secondary btn-lg" onClick={() => { this.setState({ show: false }); if (this.state.onToggle) this.state.onToggle(); }}><L>Close</L></button>
                    {this.state.onToggle ? <button className="btn btn-secondary" onClick={() => this.state.onToggle()}>
                        <L>Cancel</L>
                    </button> : ''}
                    {this.state.onConfirm ? <button className="btn btn-primary" onClick={() => this.state.onConfirm()}>
                        <L>Confirm</L>
                    </button> : ''}
                </ModalFooter>
            </Modal>
        </div>;
    }
}