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
import Icon from './Icon';

export default class WritePostModal extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: {}
        };
        this.submit = this.submit.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show) {
            if (this.props.show) {
                setTimeout(() => {
                    var ele = document.querySelector('.WritePostModal textarea');
                    if (ele)
                        ele.focus();
                }, 100);
            }
               
        }
    }

    submit(e) {
        if(e)
            e.preventDefault();

        this.setState({ submitting: true });

        var info = { ...this.state.info };
        if (info.photos) {
            info.photos.forEach(i => {
                i.base64Encoded = null;
            });
        }

        if (this.props.replyTo) {
            info.replyToTimelinePostID = this.props.replyTo.id;
        }

        qreq.post('/api/timeline/post', info, j => {
            if (j.errorCode === 0) {
                this.setState({ info: {} });
                if (this.props.onChange)
                    this.props.onChange({});
                if (this.props.onToggle)
                    this.props.onToggle();
                if (this.props.onSave)
                    this.props.onSave(j.item, this.props.replyTo);
            }
            else
                this.showError(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.setState({ submitting: false });
        });
    }

    render() {
        return <><Modal isOpen={this.props.show} toggle={() => { if (this.props.onToggle) this.props.onToggle(); }} size="lg">
            <ModalHeader toggle={() => { if (this.props.onToggle) this.props.onToggle(); }}>
                <div className="text-center">
                    <L>Create post</L>
                </div>
            </ModalHeader>
            <ModalBody>
                <div className="p-5 WritePostModal">
                    <form onSubmit={this.submit}>
                        <FormInput model={this.state.info} name="message" label="Message" type="textarea" required className="mt-2" labelAsPlaceholder inputStyle={{ height: '100px' }} autoFocus onChange={() => { if (this.props.onChange) this.props.onChange(this.state.info); }} />
                        <div className="bg-light p-3 mb-2 d-flex justify-content-between align-items-center">
                            <div><L>Add to your post:</L></div>
                            <div className="fs-4">
                                <Icon icon="faImage" role="button" onClick={() => this.setState({ showUploadImages: !this.state.showUploadImages })} className={this.state.showUploadImages ? 'text-primary' : 'text-secondary'} />
                            </div>
                        </div>
                        {this.state.showUploadImages ?
                            <UploadPad item={this.state.info} name="photos" onUploadBegin={() => this.setState({ uploading: true })} onUploadEnd={() => this.setState({ uploading: false })} /> : ''}
                        <div className="mt-2">
                            <button type="submit" className="btn btn-success btn-lg d-block w-100" disabled={this.state.submitting || this.state.uploading}><L>Post</L></button>
                        </div>
                        {this.state.uploading ? <p><L>Uploading please wait...</L></p> : ''}
                        {this.state.error ? <Alert message={this.state.error} type="danger" className="mt-2" /> : ''}
                    </form>
                </div>
            </ModalBody>
        </Modal></>;
    }
}