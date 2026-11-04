import BaseCom from "./BaseCom";
import L from "./Lang";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as fa from '@fortawesome/free-solid-svg-icons';
import Auth from "../shared/Auth";
import { withParamsAndNavigate } from './WithParamsAndNavigate';
import Alert from "./Alert";
import LoadingAlert from "./LoadingAlert";
import AddCarModal from "./AddCarModal";
import { qreq } from "../shared/qrequest";
import './MyGarage.css';
import Globals from "../shared/Globals";
import { Tooltip } from 'react-tooltip';
import { toast } from 'react-toastify';
import ConfirmModal from "./ConfirmModal";
import { Link } from 'react-router-dom';

class MyGarage extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: []
        };
        this.load = this.load.bind(this);
        this.remove = this.remove.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(j => {
            this.setState({ user: j });
            if (j)
                this.load();
            else
                this.props.navigate('/');
        });
    }

    load() {
        qreq.get('/api/garage/list', j => {
            if (j.list)
                this.setState({ list: j.list });
            this.setState({ loaded: true });
        });
    }

    remove(obj) {
        obj.showRemove = false;
        this.setState({ list: this.state.list });  
        qreq.post('/api/garage/remove', obj, j => {
            if (j.errorCode === 0) {
                var list = [ ...this.state.list ];
                list.splice(this.state.list.indexOf(obj), 1);
                this.setState({ list: list });
            }
            else
                this.alert(j.errorMessage);
        }, () => {
            this.alert('Unknown error. Please try again.');
        });
    }

    render() {
        if (!this.state.user)
            return <></>;
        return <div className="my-garage container">
            <Tooltip anchorSelect={'.tt-view'} place="top" style={{ zIndex: 999 }}>View Vehicle</Tooltip>
            <Tooltip anchorSelect={'.tt-remove'} place="top" style={{ zIndex: 999 }}>Remove Vehicle</Tooltip>
            <AddCarModal show={this.state.showAddCarModal} onToggle={() => this.setState({ showAddCarModal: false })} onSave={() => { this.setState({ showAddCarModal: false }); this.load(); }} />
            <h1 className="mb-3"><L>My Garage</L></h1>
            <section>
                <div className="container p-2">
                    <div className="btn-group mb-3">
                        <button className="btn btn-lg btn-primary" onClick={() => this.setState({ showAddCarModal: true })}><FontAwesomeIcon icon={fa.faPlus} /> Add Vehicle</button>
                    </div>
                    {!this.state.loaded ? <LoadingAlert /> : <>
                        <div className="row">
                            {this.state.list.map(i => <div key={i.id} className="col-md-6 mb-3">
                                <ConfirmModal show={i.showRemove} title="Remove Vehicle" onConfirm={() => this.remove(i)} onToggle={() => { i.showRemove = false; this.setState({ list: this.state.list }); }}><L>Are you sure you want to remove</L> {i.year} {i.make} {i.model}?</ConfirmModal>
                                <div className="p-2 text-center text-light bg-dark rounded box-shadow">
                                    <div className="car" style={{ backgroundImage: 'url(\'' + Globals.serverUrl + i.displayPhoto.url + '\')' }} onMouseEnter={() => { i.hover = true; this.setState({ list: this.state.list }); }} onMouseLeave={() => { i.hover = false; this.setState({ list: this.state.list }); }}>
                                        <div className={'overlay' + (i.hover ? ' show' : '')}>
                                            <Link to={'/garage/' + this.state.user.username + '/' + i.masterID} title="View Vehicle" type="button" className="btn btn-lg btn-primary tt-view"><FontAwesomeIcon icon={fa.faCar} /></Link>
                                            <button title="Remove Vehicle" type="button" className="btn btn-lg btn-danger ms-2 tt-remove" onClick={() => { i.showRemove = true; this.setState({ list: this.state.list }); }}><FontAwesomeIcon icon={fa.faTrash} /></button>
                                        </div>
                                    </div>
                                    {i.year} {i.make} {i.model}
                                </div>
                            </div>)}
                        </div>
                        {this.state.list.length === 0 ? <Alert><L>You have no vehicles in your garage.</L></Alert> : ''}
                    </>}
                </div>
            </section>
        </div>;
    }
}

export default withParamsAndNavigate(MyGarage);