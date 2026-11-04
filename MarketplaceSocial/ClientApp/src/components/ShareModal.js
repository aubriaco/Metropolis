import { Modal, ModalBody } from 'reactstrap';
import BaseCom from "./BaseCom";
import L from './Lang';
import { withParamsAndNavigate } from './WithParamsAndNavigate';
import { Link } from 'react-router-dom';

class ShareModal extends BaseCom {


    render() {
        var loc = document.location.href;
        if (this.props.location) {
            var base = document.querySelector('base');
            var baseUrl = base ? (base.href ?? '') : '';
            loc = baseUrl + this.props.location;
        }
        var title = this.props.title ?? document.title;
        return <><Modal isOpen={this.props.show} toggle={() => { if (this.props.onToggle) this.props.onToggle() }}>
            <ModalBody>
                <div className="p-5">
                    <div className="text-center">
                        <h1><L>Share this page!</L></h1>
                        <hr />
                        <button onClick={() => { navigator.clipboard.writeText(loc); }} type="button" className="btn btn-success btn-lg d-block w-100 mb-3"><L>Copy Link</L></button>
                        <button onClick={() => { window.open('http://www.facebook.com/share.php?u=' + encodeURIComponent(loc)) }} type="button" className="btn btn-success btn-lg d-block w-100 mb-3"><L>Facebook</L></button>
                        <Link to={'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(loc)} role="button" className="btn btn-success btn-lg d-block w-100 mb-3"><L>Email</L></Link>
                    </div>
                </div>
            </ModalBody>
        </Modal></>;
    }
}

export default withParamsAndNavigate(ShareModal);