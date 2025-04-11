/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link } from "react-router-dom";
import { qreq } from "../shared/qrequest";
import Alert from "./Alert";
import BaseCom from "./BaseCom";
import Card from "./Card";
import L from "./Lang";
import LoadingAlert from "./LoadingAlert";
import MyStoresCom from "./MyStoresCom";
import MyStoresPortal from "./MyStoresPortal";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import Globals from "../shared/Globals";

class MyStoresOrders extends MyStoresCom {

    constructor(props) {
        super(props);
        this.init();
        this.state.list = [];
        this.state.loaded = false;
    }

    componentDidMount() {
        this.pullVendor(v => {
            this.setState({ vendor: v });
            qreq.get('/api/order/vendor/list?vendorID=' + v.id, j => {
                if (j.list)
                    this.setState({ list: j.list, loaded: true });
                else
                    this.alert(j.errorMessage);
            }, this.unkownErrorCallback);
        });
    }

    render() {
        return <MyStoresPortal vendor={this.state.vendor} subPath={[[false, 'Orders']]}>
            <div className="container">

                <Card title="Orders">
                    {this.state.loaded ? this.state.list.length === 0 ? <Alert><L>There are no orders for this store.</L></Alert> : <> <div className="card shadow-none mb-0">
                        <ul className="list-group">
                            {this.state.list.map(i => <li key={i.id} className="list-group-item">
                                <Link to={'/my/stores/manage/' + this.state.vendor.masterID + '/orders/' + i.masterID} className="d-flex">
                                    <div className="flex-fill">
                                        <strong className="d-block text-primary">{Globals.toLocaleDateString(i.createdDate)}</strong>
                                        <div>{i.productCount} items</div>
                                        <small className="d-block text-muted">ID: {i.ident ?? i.masterID}</small>
                                        <div className={'badge rounded-pill ' + (i.isVendorCanceled ? 'bg-danger' : i.isVendorConfirmed ? 'bg-primary' : 'bg-warning')}>{i.statusHigh}</div>
                                    </div>
                                    <div className="fs-5">
                                        Total: {Globals.formatter.format(i.paid)}
                                    </div>
                                </Link>
                            </li>)}
                        </ul>
                    </div>
                    </> : <LoadingAlert />}

                </Card>
            </div>
        </MyStoresPortal>;
    }
}

export default withParamsAndNavigate(MyStoresOrders);