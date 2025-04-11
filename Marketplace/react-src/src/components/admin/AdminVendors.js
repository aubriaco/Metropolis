/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link } from "react-router-dom";
import { qreq } from "../../shared/qrequest";
import AdminCom from "./AdminCom";
import Alert from "../Alert";
import BaseCom from "../BaseCom";
import LoadingAlert from "../LoadingAlert";
import { withParamsAndNavigate } from "../WithParamsAndNavigate";
import Globals from "../../shared/Globals";

class AdminVendors extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            list: null
        };
    }

    componentDidMount() {
        qreq.get('/api/admin/vendor/list', j => {
            if(j.list)
                this.setState({ list: j.list });
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback)
    }

    render() {
        return <AdminCom subPath={[[false, 'Vendors']]}>
            <div className="container">
            <h3 className="mb-3">Vendors</h3>
            {this.state.list ? this.state.list.length !== 0 ? <div className="list-group">
                {this.state.list.map(i => <Link key={i.id} to={'/admin/vendors/view/' + i.masterID} className="list-group-item list-group-item-action d-flex align-items-center">
                    <div className="fs-5 text-primary flex-fill">{i.name}</div>
                    <span className="text-muted">{Globals.toMDYHMAMPMLocalDateString(i.createdDate)}</span>
                    <span className={'ms-2 badge ' + (i.goodStatus ? 'bg-success' : 'bg-danger')}>{i.status}</span>
                </Link>)}
            </div> : <Alert>No vendors in system.</Alert> : <LoadingAlert />}
            </div>
        </AdminCom>;
    }
}

export default withParamsAndNavigate(AdminVendors);