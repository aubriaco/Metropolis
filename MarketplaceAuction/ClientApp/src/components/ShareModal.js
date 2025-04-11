import { Modal, ModalBody } from 'reactstrap';
import Globals from '../shared/Globals';
import BaseCom from "./BaseCom";
import L from './Lang';
import { withParamsAndNavigate } from './WithParamsAndNavigate';
import { Link } from 'react-router-dom';

class ShareModal extends BaseCom {


    render() {
        var item = this.props.item;
        return <><Modal isOpen={this.props.show} toggle={() => { if (this.props.onToggle) this.props.onToggle() }}>
            <ModalBody>
                <div className="p-5">
                    <div className="text-center">
                        <h1><L>Share this auction!</L></h1>
                        <hr />
                        <button onClick={() => { navigator.clipboard.writeText(document.location.href); }} type="button" className="btn btn-success btn-lg d-block w-100 mb-3"><L>Copy Link</L></button>
                        <button onClick={() => { window.open('http://www.facebook.com/share.php?u=' + encodeURIComponent(document.location.href)) }} type="button" className="btn btn-success btn-lg d-block w-100 mb-3"><L>Facebook</L></button>
                        <Link to={'mailto:?subject=' + encodeURIComponent(item.year + ' ' + item.make + ' ' + item.model) + '&body=' + encodeURIComponent(document.location.href)} role="button" className="btn btn-success btn-lg d-block w-100 mb-3"><L>Email</L></Link>
                    </div>
                </div>
            </ModalBody>
        </Modal></>;
    }
}

export default withParamsAndNavigate(ShareModal);