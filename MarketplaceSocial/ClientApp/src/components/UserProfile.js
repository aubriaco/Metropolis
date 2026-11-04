import BaseCom from './BaseCom';
import Timeline from './Timeline';
import L from './Lang';
import { withParamsAndNavigate } from './WithParamsAndNavigate';
import { qreq } from '../shared/qrequest';
import Auth from '../shared/Auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import EditProfileModal from './EditProfileModal';
import { Modal, ModalBody } from 'reactstrap';
import UserInfoModal from './UserInfoModal';
import { Link } from 'react-router-dom';
import Globals from '../shared/Globals';
import { Helmet } from 'react-helmet';
import ShareModal from './ShareModal';
import Icon from './Icon';

class UserProfile extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            profile: {},
            garageList: []
        };
        this.load = this.load.bind(this);
        this.reload = this.reload.bind(this);
    }

    componentDidMount() {
        this.load();
    }

    load() {
        Auth.getLogin(j => {
            this.setState({ user: j, showReloadingModal: false });
            qreq.get('/api/profile/get/' + (this.props.my ? j.username : this.props.params.username), k => {
                if (k.item) {
                    this.setState({ profile: k.item, loaded: true });
                    qreq.get('/api/garage/list?userID=' + k.item.userID, jj => {
                        if (jj.list)
                            this.setState({ garageList: jj.list });
                    });
                }
            });
        });

    }

    reload() {
        this.setState({ showReloadingModal: true });
        Auth.reset();
        this.load();
    }

    render() {
        if (!this.state.loaded || !this.state.profile)
            return <></>;

        return <>
            <Helmet>
                <title>{Globals.appName + ' | ' + this.state.profile.username}</title>
            </Helmet>
            <EditProfileModal show={this.state.showEdit} onToggle={() => this.setState({ showEdit: false })} onSave={obj => { this.setState({ showEdit: false }); this.reload(); this.props.navigate('/u/' + obj.username) }} info={this.state.profile} />
            <UserInfoModal show={this.state.showUserInfoModal} onToggle={() => { this.setState({ showUserInfoModal: false }); if (this.props.onToggle) this.props.onToggle(); }} onSuccess={() => { this.setState({ showUserInfoModal: false }); this.reload(); }} />
            <ShareModal location={'u/' + this.state.profile.username} show={this.state.showShareModal} onToggle={() => this.setState({ showShareModal: false })} />
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
            <div className="container">
                <div className="row align-items-center mb-3">
                    <div className="col-md-2 p-5 p-md-2">
                        <img src={this.state.profile.displayPhoto && this.state.profile.displayPhoto.id ? Globals.serverUrl + this.state.profile.displayPhoto.thumbUrl : '/img/profile-default.svg'} alt="" className="img-fluid profile-avatar w-100" />
                    </div>
                    <div className="col-md-10 text-center text-md-start">
                        {this.state.user && this.state.profile.username === this.state.user.username ? <div className="float-none float-md-end mb-4 text-center text-md-end">
                            <button type="button" className="btn btn-lg btn-primary mt-2" onClick={() => this.setState({ showShareModal: true })}><Icon icon="faShareFromSquare" /> <L>Share</L></button>
                            <button type="button" className="btn btn-lg btn-secondary ms-2 mt-2" onClick={() => this.setState({ showEdit: true })}><FontAwesomeIcon icon={fa.faUser} /> <L>Edit Profile</L></button>
                            <button type="button" className="btn btn-lg btn-secondary ms-2 mt-2" onClick={() => this.setState({ showUserInfoModal: true })}><FontAwesomeIcon icon={fa.faGear} /> <L>Edit Personal Info</L></button>
                        </div> : ''}
                        <h1><L>{this.state.profile.username}</L></h1>
                        <h5><L>Bio</L></h5>
                        <div className="mt-2">{this.state.profile.bio}</div>
                    </div>
                </div>
                {this.state.garageList && this.state.garageList.length > 0 ?
                    <><h1 className="mt-2"><L>Garage</L></h1>
                        <section>
                            <div className="container my-garage p-3">
                                <div className="row">
                                    {this.state.garageList.map(i => <div key={i.id} className="col-md-6 mb-3">
                                        <div className="p-2 text-center text-light bg-dark rounded box-shadow">
                                            <div className="car" style={{ backgroundImage: 'url(\'' + Globals.serverUrl + i.displayPhoto.url + '\')' }} onMouseEnter={() => { i.hover = true; this.setState({ list: this.state.list }); }} onMouseLeave={() => { i.hover = false; this.setState({ list: this.state.list }); }}>
                                                <div className={'overlay' + (i.hover ? ' show' : '')}>
                                                    <Link to={'/garage/' + this.state.user.username + '/' + i.masterID} title="View Vehicle" type="button" className="btn btn-lg btn-primary tt-view"><FontAwesomeIcon icon={fa.faCar} /></Link>
                                                </div>
                                            </div>
                                            {i.year} {i.make} {i.model}
                                        </div>
                                    </div>)}
                                </div>
                            </div>
                        </section></> : ''}
                <h1 className="mt-2"><L>Posts</L></h1>
                <section>
                    <div className="container">
                        <div className="pt-3 pb-1">
                            <Timeline profileUsername={this.state.profile.username} />
                        </div>
                    </div>
                </section>
            </div></>
    }
}

export default withParamsAndNavigate(UserProfile);