/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { WebGlobal } from "../layouts/Web";
import BaseCom from "./BaseCom";
import Card from "./Card";
import L from "./Lang";
import SubHeader from "./SubHeader";
import { NavLink } from "react-router-dom";

class MyStoresPortal extends BaseCom {

    componentDidMount() {
        WebGlobal.setSearchVisible(false);
    }

    render() {
        const enableDocuments = false;

        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title={this.props.vendor.name ?? 'Loading...'} titleLink={'/my/stores/manage/' + this.props.vendor.masterID + '/dashboard'} path={[['/my', 'My Account'], ['/my/stores', 'My Stores']]} subPath={this.props.subPath} />
                <div className="nav-mobile nav-mobile-top nav-mobile-manager">
                    <NavLink to={'/my/stores/manage/' + this.props.vendor.masterID + '/dashboard'} className="nav-mobile-item">
                        <i className="bx bx-home"></i>
                        <span><L>Store Dashboard</L></span>
                    </NavLink>
                    <NavLink to={'/my/stores/manage/' + this.props.vendor.masterID + '/orders'} className="nav-mobile-item">
                        <i className="bx bx-cart"></i>
                        <span><L>Orders</L></span>
                    </NavLink>
                    <NavLink to={'/my/stores/manage/' + this.props.vendor.masterID + '/products'} className="nav-mobile-item">
                        <i className="bx bx-box"></i>
                        <span><L>Products</L></span>
                    </NavLink>
                    <NavLink to={'/my/stores/manage/' + this.props.vendor.masterID + '/menu'} className="nav-mobile-item">
                        <i className="bx bx-menu"></i>
                        <span><L>Menu</L></span>
                    </NavLink>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-3 d-none d-lg-block">
                            <ul className="list-group my-5 fs-5 list-menu">
                                {this.props.vendor.masterID ? <>
                                    <li className="list-group-item p-3"><NavLink to={'/my/stores/manage/' + this.props.vendor.masterID + '/dashboard'}><i className="bx bx-home"></i> <L>Store Dashboard</L></NavLink></li>
                                    <li className="list-group-item p-3"><NavLink to={'/my/stores/manage/' + this.props.vendor.masterID + '/orders'}><i className="bx bx-package"></i> <L>Orders</L></NavLink></li>
                                    <li className="list-group-item p-3"><NavLink to={'/my/stores/manage/' + this.props.vendor.masterID + '/products'}><i className="bx bx-box"></i> <L>Products</L></NavLink></li>
                                    <li className="list-group-item p-3"><NavLink to={'/my/stores/manage/' + this.props.vendor.masterID + '/services'}><i className="bx bx-car"></i> <L>Services</L></NavLink></li>
                                    <li className="list-group-item p-3"><NavLink to={'/my/stores/manage/' + this.props.vendor.masterID + '/settings'}><i className="bx bx-cog"></i> <L>Settings</L></NavLink></li>
                                    <li className="list-group-item p-3"><NavLink to={'/my/stores/manage/' + this.props.vendor.masterID + '/payouts'}><i className="bx bx-money"></i> <L>Payouts</L></NavLink></li>
                                    <li className="list-group-item p-3"><NavLink to={'/my/stores/manage/' + this.props.vendor.masterID + '/managers'}><i className="bx bx-user-voice"></i> <L>Managers</L></NavLink></li>
                                    {enableDocuments ? <li className="list-group-item p-3"><NavLink to={'/my/stores/manage/' + this.props.vendor.masterID + '/documents'}><i className="bx bx-file"></i> <L>Documents</L></NavLink></li> : ''}
                                    <li className="list-group-item p-3"><NavLink to={'/my/stores'} end><i className="bx bx-arrow-back"></i> <L>Exit Store View</L></NavLink></li>
                                </> : <>
                                    <li className="list-group-item p-3"><L>Dashboard</L></li>
                                    <li className="list-group-item p-3"><L>Orders</L></li>
                                    <li className="list-group-item p-3"><L>Products</L></li>
                                    <li className="list-group-item p-3"><L>Services</L></li>
                                    <li className="list-group-item p-3"><L>Settings</L></li>
                                    <li className="list-group-item p-3"><L>Payouts</L></li>
                                    <li className="list-group-item p-3"><L>Managers</L></li>
                                    {enableDocuments ? <li className="list-group-item p-3"><L>Documents</L></li> : ''}
                                </>}
                            </ul>
                        </div>
                        <div className="col">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default MyStoresPortal;