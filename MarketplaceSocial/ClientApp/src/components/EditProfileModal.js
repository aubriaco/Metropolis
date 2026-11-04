import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { Link } from 'react-router-dom';
import BaseCom from "./BaseCom";
import FormInput from './FormInput';
import L from './Lang';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import { qreq } from '../shared/qrequest';
import Globals from '../shared/Globals';
import Alert from './Alert';
import UploadPad from './UploadPad';

export default class EditProfileModal extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: { ...props.info },
            uploads: []
        };
        this.submit = this.submit.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show)
            this.setState({ info: { ...this.props.info } });
        if (prevProps.info !== this.props.info)
            this.setState({ info: { ...this.props.info } })
    }

    submit(e) {
        e.preventDefault();
        this.setState({ submitting: true });
        qreq.post('/api/profile/save', { username: this.state.info.username, bio: this.state.info.bio, displayPhotoID: this.state.info.displayPhoto ? this.state.info.displayPhoto.id : 0 }, j => {
            if (j.errorCode === 0)
                this.props.onSave({...this.state.info});
            else
                this.showError(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.showError('Unknown error ocurred. Please try again.');
            this.setState({ submitting: false });
        });
    }

    render() {
        return <><Modal isOpen={this.props.show} toggle={() => { if (this.props.onToggle) this.props.onToggle(); }} size="lg">
            <ModalHeader toggle={() => { if (this.props.onToggle) this.props.onToggle(); }}>
                <div className="text-center">
                    <L>Edit Profile</L>
                </div>
            </ModalHeader>
            <ModalBody>
                <form onSubmit={this.submit}>
                    <div className="row align-items-center">
                        <div className="col-md-4 p-5 text-center">
                            <img src={this.state.info.displayPhoto && this.state.info.displayPhoto.id ? Globals.serverUrl + this.state.info.displayPhoto.thumbUrl : '/img/profile-default.svg'} alt="" className="img-fluid profile-avatar w-100" />

                            <div className={(this.state.hideUploader > 0 ? 'd-none' : 'd-block') + ' mt-2'}>
                                <UploadPad item={this.state.uploads} onUploadBegin={() => { this.setState({ hideUploader: true }); }} onUploadEnd={obj => { var info = this.state.info; info.displayPhoto = obj; this.setState({ info: info, uploads: [], hideUploader: false }); }} />
                            </div>
                            {this.state.hideUploader ? <Alert><L>Uploading...</L></Alert> : ''}
                        </div>
                        <div className="col-md-8">
                            <FormInput model={this.state.info} name="username" label="Username" type="text" required className="mt-2" autoComplete="email" />
                            <FormInput model={this.state.info} name="bio" label="Bio" type="textarea" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <button type="submit" className="btn btn-success btn-lg d-block w-100" disabled={this.state.submitting || this.state.hideUploader}><L>Save</L></button>
                    </div>
                    {this.state.error ? <Alert message={this.state.error} type="danger" className="mt-2" /> : ''}
                </form>
            </ModalBody>
        </Modal></>;
    }
}