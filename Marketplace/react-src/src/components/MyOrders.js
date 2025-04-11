/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link } from "react-router-dom";
import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import LoadingAlert from "./LoadingAlert";
import Alert from "./Alert";
import { WebGlobal } from "../layouts/Web";

class MyOrders extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            list: null
        };
    }

    componentDidMount() {
        WebGlobal.setSearchVisible(false);
        qreq.get('/api/order/list', j => {
            if (j.list)
                this.setState({ list: j.list, loaded: true });
            else if (j.errorCode === 1)
                this.noAccess();
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    render() {
        if(!this.state.loaded)
            return null;
        return <>
            <div className="page-wrapper">
                <div className="page-content">
                    <SubHeader title="My Orders" path={[['/my', 'My Account']]} />
                    <div className="container py-5">
                        <div className="d-block">
                            <ul className="list-group">
                                {!this.state.list ? <LoadingAlert /> : this.state.list.length === 0 ? <Alert type="success">You have no orders.</Alert> : this.state.list.map(i => <li className="list-group-item">
                                    <Link to={'/my/orders/' + i.masterID} className="d-flex align-items-center">
                                        <div className="flex-fill">
                                            <strong className="d-block text-primary">{Globals.toLocaleDateString(i.createdDate)}</strong>
                                            <div>{i.productCount} items</div>
                                            <small className="d-block text-muted">ID: {i.masterID}</small>
                                            <div className="py-2">
                                                {i.trackingList.map(j => <span key={j.id} className={'badge rounded-pill bg-primary d-inline-block me-1'}>{j.status}</span>)}
                                            </div>
                                        </div>
                                        <div className="fs-5">
                                            Paid: {Globals.formatter.format(i.paid)}
                                        </div>
                                    </Link>
                                </li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>;
    }
}

export default withParamsAndNavigate(MyOrders);