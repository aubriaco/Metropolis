import BaseCom from './BaseCom';
import L from './Lang';
import Card from './Card';
import { qreq } from '../shared/qrequest';
import { withParamsAndNavigate } from './WithParamsAndNavigate';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import Alert from './Alert';
import Auth from '../shared/Auth';
import AdminNav from './AdminNav';
import Globals from '../shared/Globals';

class AdminApplianceListings extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            loaded: false
        };
        this.approve = this.approve.bind(this);
        this.reject = this.reject.bind(this);
        this.pause = this.pause.bind(this);
        this.unpause = this.unpause.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(j => {
            this.setState({ user: j });
        });
        qreq.get('/api/auction/appliance/admin/list', j => {
            if (j.list)
                this.setState({ list: j.list });
            this.setState({ loaded: true });
        });
    }

    approve(obj) {
        qreq.post('/api/auction/appliance/admin/approve', obj, j => {
            if (j.errorCode === 0) {
                Globals.deepCopy(j.item, obj);
                this.setState({ list: this.state.list });
            }
            else
                this.alert(j.errorMessage);
        });
    }

    reject(obj) {
        qreq.post('/api/auction/appliance/admin/reject', obj, j => {
            if (j.errorCode === 0) {
                Globals.deepCopy(j.item, obj);
                this.setState({ list: this.state.list });
            }
            else
                this.alert(j.errorMessage);
        });
    }

    pause(obj) {
        qreq.post('/api/auction/appliance/admin/pause', obj, j => {
            if (j.errorCode === 0) {
                Globals.deepCopy(j.item, obj);
                this.setState({ list: this.state.list });
            }
            else
                this.alert(j.errorMessage);
        });
    }

    unpause(obj) {
        qreq.post('/api/auction/appliance/admin/unpause', obj, j => {
            if (j.errorCode === 0) {
                Globals.deepCopy(j.item, obj);
                this.setState({ list: this.state.list });
            }
            else
                this.alert(j.errorMessage);
        });
    }

    render() {
        if (!this.state.user)
            return <></>;
        return <div className="container">
            <AdminNav />
            <h1 className="mb-5"><L>Administration: Appliance Listings</L></h1>
            {this.state.loaded ?
                <div className="listings">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Sel. Start Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.list.map(i => <tr key={i.id}>
                                <td><Link to={'/admin/listings/appliance/item/' + i.id}>{i.name}</Link></td>
                                <td>{i.selectedStart ? Globals.toMDYHMAMPMLocalDateString(i.selectedStartDate) : 'None'}</td>
                                <td>{i.status}</td>
                                <td>
                                    {i.ended ? <>Ended</> : (!i.started ?
                                        <><button onClick={() => this.approve(i)} type="button" className="btn btn-success" title="Approve"><FontAwesomeIcon icon={fa.faCheck} /></button><button onClick={() => this.reject(i)} type="button" className="btn btn-danger ms-2" title="Reject"><FontAwesomeIcon icon={fa.faTrash} /></button></> :
                                        (i.paused ? <button onClick={() => this.unpause(i)} type="button" className="btn btn-success" title="Unpause"><FontAwesomeIcon icon={fa.faArrowRight} /></button> : <button onClick={() => this.pause(i)} type="button" className="btn btn-warning" title="Pause"><FontAwesomeIcon icon={fa.faPause} /></button>))}

                                </td>
                            </tr>
                            )}
                        </tbody>
                    </table>
                </div> : <Alert message="Loading..." />}
        </div>;
    }
}

export default withParamsAndNavigate(AdminApplianceListings);