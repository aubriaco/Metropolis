import Globals from "../shared/Globals";
import BaseCom from "./BaseCom";
import { Modal, ModalBody } from 'reactstrap';
import "./ImageGallery.css";

export default class ImageGallery extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            selectedImage: null
        };
    }

    render() {
        return <>
            <Modal isOpen={this.state.selectedImage ? true : false} toggle={() => this.setState({ selectedImage: null })} size="xl">
                <ModalBody onClick={() => this.setState({ selectedImage: null })}>
                    {this.state.selectedImage ?
                        <img src={Globals.serverUrl + this.state.selectedImage.url} alt="" className="d-block img-fluid mx-auto" /> : ''}
                </ModalBody>
            </Modal>
            <div className="ImageGallery">
                <div className="row">
                    {this.props.list.map(i => <div key={i.id} className="col-6 col-md-4 mt-3">
                        <div role="button" className="position-relative o-img" style={{ backgroundImage: 'url(\'' + Globals.serverUrl + i.thumbUrl + '\')' }} onClick={() => this.setState({ selectedImage: i })}></div>
                    </div>)}
                </div>
            </div>
        </>;
    }
}