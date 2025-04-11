import { Modal, ModalBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import BaseCom from "./BaseCom";
import FormInput from './FormInput';
import L from './Lang';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import { qreq } from '../shared/qrequest';
import Globals from '../shared/Globals';
import Alert from './Alert';

export default class DevModeModal extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            show: Globals.devMode
        };
    }

    render() {
        return <><Modal isOpen={this.state.show} toggle={() => { if (this.props.onToggle) this.props.onToggle(); }} size="xl">
            <ModalBody>
                <div className="p-5">
                    <div className="text-center">
                        <h1><L>Development Mode</L></h1>
                        <hr />
                    </div>
                    <div className="mt-2">
                        <p><L>This platform is currently running on</L> <strong><L>development mode.</L></strong></p>
                        <p><L>None of the items or transactions are real.</L></p>
                    </div>
                    <div className="mt-2 text-center">
                        <button type="button" className="btn btn-success btn-lg" onClick={() => this.setState({ show: false })}>Continue</button>
                    </div>
                    {this.state.error ? <Alert message={this.state.error} type="danger" className="mt-2" /> : ''}
                </div>
            </ModalBody>
        </Modal></>;
    }
}