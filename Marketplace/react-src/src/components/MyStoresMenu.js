/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { qreq } from "../shared/qrequest";
import Card from "./Card";
import L from "./Lang";
import LoadingAlert from "./LoadingAlert";
import MyStoresCom from "./MyStoresCom";
import MyStoresPortal from "./MyStoresPortal";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import SelectDeliveryTypesModal from "./SelectDeliveryTypesModal";
import { NavLink } from "react-router-dom";

class MyStoresMenu extends MyStoresCom {

    constructor(props) {
        super(props);
        this.init();
    }

    componentDidMount() {
        this.pullVendor();
    }

    render() {
        const enableDocuments = false;

        if (!this.state.vendor?.id)
            return <></>;
        return <MyStoresPortal vendor={this.state.vendor} subPath={[[false, 'Dashboard']]}>
            <div className="list-group mt-3 list-menu">
                <li className="list-group-item p-3"><NavLink to={'/my/stores/manage/' + this.state.vendor.masterID + '/dashboard'}><i className="bx bx-home"></i> <L>Store Dashboard</L></NavLink></li>
                <li className="list-group-item p-3"><NavLink to={'/my/stores/manage/' + this.state.vendor.masterID + '/orders'}><i className="bx bx-package"></i> <L>Orders</L></NavLink></li>
                <li className="list-group-item p-3"><NavLink to={'/my/stores/manage/' + this.state.vendor.masterID + '/products'}><i className="bx bx-box"></i> <L>Products</L></NavLink></li>
                <li className="list-group-item p-3"><NavLink to={'/my/stores/manage/' + this.state.vendor.masterID + '/services'}><i className="bx bx-car"></i> <L>Services</L></NavLink></li>
                <li className="list-group-item p-3"><NavLink to={'/my/stores/manage/' + this.state.vendor.masterID + '/settings'}><i className="bx bx-cog"></i> <L>Settings</L></NavLink></li>
                <li className="list-group-item p-3"><NavLink to={'/my/stores/manage/' + this.state.vendor.masterID + '/payouts'}><i className="bx bx-money"></i> <L>Payouts</L></NavLink></li>
                <li className="list-group-item p-3"><NavLink to={'/my/stores/manage/' + this.state.vendor.masterID + '/managers'}><i className="bx bx-user-voice"></i> <L>Managers</L></NavLink></li>
                {enableDocuments ? <li className="list-group-item p-3"><NavLink to={'/my/stores/manage/' + this.state.vendor.masterID + '/documents'}><i className="bx bx-file"></i> <L>Documents</L></NavLink></li> : ''}
                <li className="list-group-item p-3"><NavLink to={'/my/stores'} end><i className="bx bx-arrow-back"></i> <L>Exit Store View</L></NavLink></li>
            </div>
        </MyStoresPortal>;
    }
}

export default withParamsAndNavigate(MyStoresMenu);