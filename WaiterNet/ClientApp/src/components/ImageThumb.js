import BaseCom from "./BaseCom";
import Globals from "../shared/Globals";
import { Modal, ModalBody } from 'reactstrap';

export default class ImageThumb extends BaseCom {
    render() {
        return <><Modal isOpen={this.state.showModal} toggle={() => this.setState({ showModal: false })} size="xl">
            <ModalBody onClick={() => this.setState({ showModal: false })}>
                <img src={Globals.serverUrl + this.props.item.url} alt="" className="d-block img-fluid mx-auto" />
            </ModalBody>
        </Modal>
            <img src={Globals.serverUrl + this.props.item.thumbUrl} alt="" className="img-thumb img-fluid" role="button" onClick={() => this.setState({ showModal: true })} />
        </>
    }
}