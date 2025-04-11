/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Alert } from "reactstrap";
import { qreq } from "../shared/qrequest";
import Card from "./Card";
import Icon from "./Icon";
import L from "./Lang";
import LoadingAlert from "./LoadingAlert";
import MyStoresCom from "./MyStoresCom";
import MyStoresPortal from "./MyStoresPortal";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Pop } from "./PopModal";
import MyStoresUsersInviteModal from "./MyStoresUsersInviteModal";
import Globals from "../shared/Globals";
import Auth from "../shared/Auth";

class MyStoresUsers extends MyStoresCom {
    constructor(props) {
        super(props);
        this.init();
        this.state.list = [];
        this.state.inviteList = [];
        this.load = this.load.bind(this);
        this.loadInvites = this.loadInvites.bind(this);
        this.remove = this.remove.bind(this);
        this.removeInvite = this.removeInvite.bind(this);
    }


    componentDidMount() {
        Auth.getLogin(u => {
            if (u) {
                this.setState({ user: u });
                this.pullVendor(v => {
                    this.load(v);
                });
            }
        });
    }

    load(v) {
        if (!v) v = this.state.vendor;
        qreq.get('/api/vendor/user/list?masterID=' + v.masterID, j => {
            if (j.list) {
                this.setState({ list: j.list, loaded: true });
                this.loadInvites();
            }
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    loadInvites(v) {
        if (!v) v = this.state.vendor;
        qreq.get('/api/vendor/user/invite/list?masterID=' + v.masterID, j => {
            if (j.list)
                this.setState({ inviteList: j.list });
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    remove(item) {
        Pop.showConfirm(<><L>Are you sure you want to remove access for</L> {item.name} ({item.email})?</>, <L>Remove Manager</L>, () => {
            qreq.post('/api/vendor/user/remove', { vendorID: this.state.vendor.id, userID: item.id }, j => {
                if (j.errorCode === 0) {
                    var list = [...this.state.list];
                    list.splice(this.state.list.indexOf(item), 1);
                    this.setState({ list: list });
                    this.success('Removed manager.');
                }
                else
                    this.alert(j.errorMessage);
            }, this.unkownErrorCallback)
        });
    }

    removeInvite(item) {
        Pop.showConfirm(<><L>Are you sure you want to cancel invite</L> {item.email}?</>, <L>Remove Manager</L>, () => {
            qreq.post('/api/vendor/user/invite/remove', item, j => {
                if (j.errorCode === 0) {
                    var list = [...this.state.inviteList];
                    list.splice(this.state.inviteList.indexOf(item), 1);
                    this.setState({ inviteList: list });
                    this.success('Removed invite.');
                }
                else
                    this.alert(j.errorMessage);
            }, this.unkownErrorCallback)
        });
    }

    render() {
        return <>
            <MyStoresUsersInviteModal vendor={this.state.vendor} show={this.state.showAdd} onHide={() => { this.setState({ showAdd: false }); this.load(); }} />
            <MyStoresPortal vendor={this.state.vendor} subPath={[[false, 'Managers']]}>
                {this.state.loaded ?
                    <form onSubmit={this.submit}>
                        <Card title="Managers" headerButtons={<div className="app-actions"><button type="button" onClick={() => this.setState({ showAdd: true })} className="btn btn-primary btn-lg"><Icon icon="faPlus" /> <span className="d-none d-md-inline-block"><L>Add Manager</L></span></button></div>}>
                            {!this.state.loaded ? <LoadingAlert /> : <>
                                {this.state.list.length === 0 ? <Alert><L>No managers.</L></Alert> :
                                    <>
                                        <h6 className="my-3"><L>Managers</L></h6>
                                        <ul className="list-group">
                                            {this.state.list.map(i => <li key={i.id} className="list-group-item">
                                                <div className="d-flex align-items-center">
                                                    <div className="d-flex align-items-center flex-fill">
                                                        <div><Icon icon="faUser" /></div>
                                                        <div className="ms-3">{i.firstName || i.lastName ? i.name : i.username}</div>
                                                        <div className="ms-3 text-secondary">{i.email}</div>
                                                    </div>
                                                    {i.id !== this.state.user.id ? <div><button type="button" onClick={() => this.remove(i)} className="btn btn-danger"><Icon icon="faTrash" /> <span className="d-none d-md-inline">Remove</span></button></div> : ''}
                                                </div>
                                            </li>)}
                                        </ul>
                                        {this.state.inviteList.length !== 0 ? <>
                                            <h6 className="my-3"><L>Pending Invites</L></h6>
                                            <ul className="list-group">
                                                {this.state.inviteList.map(i => <li key={i.id} className="list-group-item">
                                                    <div className="d-flex align-items-center">
                                                        <div className="d-flex align-items-center flex-fill">
                                                            <div><Icon icon="faEnvelope" /></div>
                                                            <div className="ms-3 text-secondary">{i.email}</div>
                                                            <div className="ms-3 text-muted">{Globals.toMDYHMLocalDateString(i.expiresDate)}</div>
                                                        </div>
                                                        <div><button type="button" onClick={() => this.removeInvite(i)} className="btn btn-danger"><Icon icon="faTrash" /> <span className="d-none d-md-inline">Cancel</span></button></div>
                                                    </div>
                                                </li>)}
                                            </ul>
                                        </> : ''}
                                    </>}
                            </>}
                        </Card>
                    </form>
                    : <LoadingAlert />}
            </MyStoresPortal>
        </>;
    }
}

export default withParamsAndNavigate(MyStoresUsers);