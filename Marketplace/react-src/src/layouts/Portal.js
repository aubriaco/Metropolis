/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import * as React from "react";
import { Outlet } from "react-router-dom";
import { withParamsAndNavigate } from "../components/WithParamsAndNavigate";
import { getLang, getCurrentLangItem } from "../shared/GLang";
import { NavLink } from "react-router-dom";

class Portal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            version: 0
        };
    }

    componentDidUpdate(prevProps) {
        if(this.props.location.pathname !== prevProps.locaton.pathname)
            window.scrollTo(0, 0);
    }

    render() {
        return <><div className="wrapper">
            <div className="header-wrapper">
                <div className="top-menu">
                    <div className="container">
                        <nav className="navbar navbar-expand">
                            <div className="shiping-title d-none d-sm-flex">{getLang('Welcome to the Metropolis Market vendor management dashboard.')}</div>
                            <ul className="navbar-nav ms-auto d-none d-lg-flex">

                               
                                {this.state.user ? <>
                                    <li className="nav-item"><NavLink className="nav-link"> {getLang('Welcome')} <b>{this.state.user.name}</b> {getLang('!')} </NavLink></li>
                                    <li className="nav-item"><NavLink className="nav-link" to="/my"><i className="bx bx-user"></i> {getLang('My Account')}</NavLink></li>
                                    {this.state.user.isVendor ?
                                        <li className="nav-item"><NavLink className="nav-link" to="/my/vendors"><i className="bx bx-store"></i> {getLang('My Stores')}</NavLink></li> : ''}
                                    {this.state.user.isAdmin ?
                                        <li className="nav-item"><NavLink className="nav-link" to="/admin"><i className="bx bx-certification"></i> {getLang('Administration')}</NavLink></li> : ''}
                                    <li className="nav-item"><NavLink ng-click="logout()" title="Logout" data-toggle="tooltip" className="nav-link cursor-pointer"><i className="bx bx-log-out"></i></NavLink></li></>
                                    :
                                    <><li className="nav-item"><NavLink className="nav-link" to="/signup">{getLang('Sign Up')}</NavLink></li>
                                        <li className="nav-item"><NavLink className="nav-link" to="/login">{getLang('Login')}</NavLink></li></>}
                            </ul>
                            <ul className="navbar-nav">
                                {this.state.user ?
                                    <li className="nav-item hide-on-web text-uppercase">
                                        <NavLink to="/my/vendors" className="nav-link">
                                            <i className="bx bx-arrow-back"></i>
                                            {getLang('My Stores')}
                                        </NavLink>
                                    </li> : ''}
                                <li className="nav-item dropdown ms-0 ms-sm-2">
                                    <span role="button" className="nav-link dropdown-toggle dropdown-toggle-nocaret">
                                        <div className="lang d-flex gap-1">
                                            <div>
                                                <i className="flag-icon flag-icon-{getCurrentLangItem().flag}"></i>
                                            </div>
                                            <div>
                                                <span className="text-uppercase">{getCurrentLangItem().ident}</span>
                                            </div>
                                        </div>
                                    </span>
                                    <div className="dropdown-menu dropdown-menu-lg-end">
                                        <span role="button" className="dropdown-item d-flex allign-items-center cursor-pointer">
                                            <i className={'flag-icon flag-icon-' + getCurrentLangItem().flag + ' me-2'}></i><span>{getCurrentLangItem().name}</span>
                                        </span>
                                    </div>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
            <div className="container">
                <Outlet />
            </div>
            <footer>

                <section className="footer-strip text-center py-3 border-top positon-absolute bottom-0">
                    <div className="container">
                        <div className="d-flex flex-column flex-lg-row align-items-center gap-3 justify-content-between">
                            <p className="mb-0">Metropolis Market v{this.state.version} | Copyright &copy; 2023 Metropolis Market LLC. All right reserved. | Powered by: <a href="https://www.solusek.com/" target="_blank"> {getLang('Solusek LLC')} </a> {getLang('|')} <a href="/terms-of-service"> {getLang('Terms of Service')} </a> {getLang('|')} <a href="/privacy-policy"> {getLang('Privacy Policy')} </a></p>
                            <div className="payment-icon">
                                <div className="row row-cols-auto g-2 justify-content-end">
                                    <div className="col">
                                        <img src="/assets/images/icons/visa.png" alt="" />
                                    </div>
                                    <div className="col">
                                        <img src="/assets/images/icons/mastercard.png" alt="" />
                                    </div>
                                    <div className="col">
                                        <img src="/assets/images/icons/american-express.png" alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </footer>

        </div>
</>
    }

    /*
    render() {
        return (<>
            <main>
                <div className="c-page-wrapper">
                    <Outlet />
                </div>
            </main>
        </>);
    }*/
}

export default withParamsAndNavigate(Portal);