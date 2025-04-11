import Auth from '../shared/Auth';
import Globals from '../shared/Globals';
import BaseCom from './BaseCom';
import L from './Lang';
import { withParamsAndNavigate } from './WithParamsAndNavigate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import EditProfileModal from './EditProfileModal';
import { Modal, ModalBody } from 'reactstrap';
import UserInfoModal from './UserInfoModal';
import { qreq } from '../shared/qrequest';
import Icon from './Icon';
import NativeNav from './NativeNav';

class MyProfile extends BaseCom {

    constructor(props) {
        super(props);
        this.load = this.load.bind(this);
        this.reload = this.reload.bind(this);
    }

    componentDidMount() {
        this.load();
    }

    load() {
        Auth.getLogin(j => {
            this.setState({ user: j, loaded: true });
            if (j) {
                qreq.get('/api/profile/get/' + j.username, k => {
                    if (k.item)
                        this.setState({ user: { ...j, bio: k.bio } });
                });
            }
            else
                this.props.navigate('/home/login');
            this.setState({ showReloadingModal: false });
        });
    }

    reload() {
        this.setState({ showReloadingModal: true });
        Auth.reset();
        this.load();
    }

    render() {
        if (!this.state.loaded || !this.state.user)
            return <></>;
        return <>
            <NativeNav show={Globals.mobileView} />
            <EditProfileModal show={this.state.showEdit} onToggle={() => this.setState({ showEdit: false })} onSave={() => { this.setState({ showEdit: false }); this.reload(); }} info={this.state.user} />
            <UserInfoModal show={this.state.showUserInfoModal} onToggle={() => { this.setState({ showUserInfoModal: false }); if (this.props.onToggle) this.props.onToggle(); }} onSuccess={() => { this.setState({ showUserInfoModal: false }); this.reload(); }} />
            <Modal isOpen={this.state.showReloadingModal}>
                <ModalBody>
                    <div className="p-5">
                        <div className="text-center">
                            <h1><L>Reloading profile</L></h1>
                            <p><L>Please wait....</L></p>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
            <div className="container-narrow">
                <div className="row align-items-center">
                    <div className="col-2">
                        <img src="/img/profile-default.svg" alt="" className="img-fluid profile-avatar w-100" />
                    </div>
                    <div className="col-10">
                        <div className="float-end mb-2">
                            <button type="button" className="btn btn-secondary" onClick={() => this.setState({ showEdit: true })}><FontAwesomeIcon icon={fa.faUser} /> {Globals.mobileView ? '' : <L>Edit Profile</L>}</button>
                            <button type="button" className="btn btn-secondary ms-2" onClick={() => this.setState({ showUserInfoModal: true })}><FontAwesomeIcon icon={fa.faGear} /> {Globals.mobileView ? '' : <L>Edit Personal Info</L>}</button>
                        </div>
                        <h1><L>{this.state.user.username}</L></h1>
                        <p className="lead">Joined: {Globals.toMDYHMAMPMLocalDateString(this.state.user.createdDate)}</p>
                    </div>
                </div>
            </div></>
    }
}

export default withParamsAndNavigate(MyProfile);