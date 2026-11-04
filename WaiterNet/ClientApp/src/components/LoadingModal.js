import { Modal, ModalBody } from 'reactstrap';
import BaseCom from "./BaseCom";
import { Spinner } from 'reactstrap';
import Logo from './Logo';
import L from './Lang';

export default class LoadingModal extends BaseCom {

    render() {
        return <><Modal isOpen={this.props.show} toggle={() => { if (this.props.onToggle) this.props.onToggle() }}>
            <ModalBody>
                <div className="p-5">
                    <div className="text-center">
                        <h1><Logo inverse /></h1>
                        <hr />
                    </div>
                    <div className="mt-2 text-center">
                        <p className="lead">{this.props.message ?? <L>Application is loading...</L>}</p>
                        <Spinner />
                    </div>
                </div>
            </ModalBody>
        </Modal></>;
    }
}