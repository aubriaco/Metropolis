/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import Card from "./Card";
import { Link } from "react-router-dom";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import Icon from "./Icon";
import SubHeader from "./SubHeader";
import { qreq } from "../shared/qrequest";
import LoadingAlert from "./LoadingAlert";
import L from "./Lang";
import Alert from "./Alert";
import Globals from "../shared/Globals";
import { WebGlobal } from "../layouts/Web";

class MyStores extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: []
        };
    }

    componentDidMount() {
        WebGlobal.setSearchVisible(false);
        qreq.get('/api/vendor/list', j => {
            if (j.list) {
                this.setState({ list: j.list });
                if(j.list.length === 1)
                    this.props.navigate('/my/stores/manage/' + j.list[0].masterID + '/dashboard');
            }
            else
                this.toast().error(j.errorMessage);
            this.setState({ loaded: true });
        }, this.unkownErrorCallback);
    }

    render() {
        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title="My Stores" path={[['/my', 'My Account']]} />
                <div className="MyStores container">
                    <Card title="My Stores" headerButtons={<Link to="/my/stores/new" role="button" className="btn btn-primary btn-lg">
                        <Icon icon="faPlus" /> <span className="d-none d-md-inline"><L>Create New Store</L></span>
                    </Link>}>

                        {!this.state.loaded ? <LoadingAlert /> : this.state.list.length === 0 ? <Alert><L>You have not registered any stores.</L></Alert> :
                            <ul className="list-group">
                                {this.state.list.map(i => <li key={i.id} className="list-group-item">
                                    <Link to={'/my/stores/manage/' + i.masterID + '/dashboard'} className="font-20 text-uppercase">
                                        {i.name}
                                    </Link>
                                    <p className="lead"><L>Status</L>: <span className={i.goodStatus ? 'text-success' : 'text-danger'}><L>{i.status}</L></span></p>
                                    <hr />
                                    <div className="row">
                                        <div className="col-lg-2 col-md-3 col-4">
                                            <img src={Globals.imageUrl(i.imageUrl ? i.imageUrl : '/img/noimage.png')} alt="" className="img-fluid" />
                                        </div>
                                        <div className="col">
                                            <table className="table fs-5">
                                                <tbody>
                                                    <tr><td><L>Pending</L></td><td>{i.pendingCount}</td></tr>
                                                    <tr><td><L>Processed</L></td><td>{i.processedCount}</td></tr>
                                                    <tr><td><L>Confirmed</L></td><td>{i.confirmedCount}</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </li>)}
                            </ul>}
                    </Card>
                </div>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(MyStores);