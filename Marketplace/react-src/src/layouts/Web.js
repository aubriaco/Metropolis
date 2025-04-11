/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import * as React from "react";
import { Outlet, Link, NavLink } from "react-router-dom";
import { getCurrentLangItem, getLang, getLanguages } from "../shared/GLang";
import Globals from "../shared/Globals";
import Dropdown from 'react-bootstrap/Dropdown';
import Auth from "../shared/Auth";
import FormInput from "../components/FormInput";
import CartIcon from "../components/CartIcon";
import { PopModal } from "../components/PopModal";
import SearchBar from "../components/SearchBar";
import { qreq } from "../shared/qrequest";
import BaseCom from "../components/BaseCom";
import { withParamsAndNavigate } from "../components/WithParamsAndNavigate";
import L from "../components/Lang";
import MobileNav from "../components/MobileNav";
import ScrollToTop from "../components/ScrollToTop";

export const WebGlobal = {
    init(setSearchVisible) {
        this.setSearchVisible = setSearchVisible;    
    },

    setSearchVisible(on) {}
};

class Web extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            user: {},
            alert: {
                current: {
                    buttons: []
                },
                list: []
            },
            cart: {
                list: [],
                total: 0
            },
            categories1: [],
            categories2: [],
            newsletter: {},
            showMenuToggle: false,
            pathname: this.props.location.pathname
        };
        this.submitNewsletter = this.submitNewsletter.bind(this);
        this.toggleNav = this.toggleNav.bind(this);
        this.isVendorLocation = this.isVendorLocation.bind(this);
        this.isAdminLocation = this.isAdminLocation.bind(this);
        this.isMenuVisible = this.isMenuVisible.bind(this);
        this.isHeaderVisible = this.isHeaderVisible.bind(this);
        this.setSearchVisible = (on) => {
            this.setState({ searchVisible: on });
        };
        WebGlobal.init(this.setSearchVisible);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            this.setState({ user: u });
        });

        qreq.get('/api/category/list', j => {
            if (j.list) {
                var n = 0;
                var categories1 = [];
                var categories2 = [];
                j.list.forEach(i => {
                    if (n < 10)
                        categories1.push(i);
                    else if (n >= 10 && n < 20)
                        categories2.push(i);
                    n++;
                });
                this.setState({ categories1: categories1, categories2: categories2 });
            }
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);

        qreq.get('/api/content/version', j => {
            if(j.item)
                this.setState({ version: j.item });
            else
                this.setState({ version: 0 });
        });

        /*
        if(!Globals.devMode) {
            this.consentScript = document.createElement('script');
            this.consentScript.src = 'https://app.termly.io/resource-blocker/1c564deb-a1a8-4774-896f-0394474ed1f2?autoBlock=on';
            document.body.appendChild(this.consentScript);
        }
        */
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            window.scrollTo(0, 0);
            this.setState({ pathname: this.props.location.pathname });
        }
        if(prevState.user !== Auth.getUser())
            this.setState({ user: Auth.getUser() });
    }

    componentWillUnmount() {
        if(this.consentScript)
            document.body.removeChild(this.consentScript);
    }

    submitNewsletter(e) {
        if (e) e.preventDefault();
        this.setState({ submittingNewsletter: true });
        qreq.post('/api/newsletter/subscribe', { ...this.state.newsletter }, j => {
            if (j.errorCode === 0) {
                this.setState({ newsletter: {} });
                this.success(getLang('You have subscribed to our newsletter.'));
            }
            else
                this.alert(j.errorMessage);
            this.setState({ submittingNewsletter: false });
        }, () => {
            this.unkownErrorCallback()
            this.setState({ submittingNewsletter: false });
        });
    }

    toggleNav(b) {
        if (b === undefined)
            b = !this.state.showNav;
        this.setState({ showNav: b });
        document.getElementsByTagName('body')[0].classList.toggle('offcanvas-active');
    }

    isAdminLocation() {
        return this.state.pathname.startsWith('/admin');
    }

    isVendorLocation() {
        return this.state.pathname && this.state.pathname.indexOf('/v/') >= 0;
    }

    isHeaderVisible() {
        return !this.isAdminLocation();
    }

    isMenuVisible() {
        return !this.isVendorLocation() || this.state.showMenuToggle;
    }

    render() {
        return (<>
            <div className={'wrapper' + (!this.state.searchVisible ? ' search-hidden' : '') + (this.isAdminLocation() ? ' wrapper-admin' : '')}>
                <ScrollToTop />
                <PopModal />
                <MobileNav isAdmin={this.isAdminLocation()} />

                <div className="header-wrapper">
                    <div className="top-menu">
                        <div className="container">
                            <nav className="navbar navbar-expand">
                                <div className="shiping-title d-none d-sm-flex">{getLang('Welcome to the Metropolis Market!')}</div>
                                <ul className="navbar-nav ms-auto d-none d-lg-flex">
                                    {!this.state.user ? <>
                                        <li ng-show="!User" className="nav-item"><Link className="nav-link" to="/signup">{getLang('Sign Up')}</Link></li>
                                        <li ng-show="!User" className="nav-item"><Link className="nav-link" to="/login">{getLang('Login')}</Link></li>
                                    </> : <>
                                        <li ng-show="User" className="nav-item"><span className="nav-link"> {getLang('Welcome')} <b>{this.state.user.fullName ?? this.state.user.email}</b> {getLang('!')} </span></li>
                                        <li ng-show="User" className="nav-item"><Link className="nav-link" to="/my"><i className="bx bx-user"></i> {getLang('My Account')}</Link></li>
                                        {this.state.user.isVendor ? <li ng-show="User && User.isVendor" className="nav-item"><Link className="nav-link" to="/my/stores"><i className="bx bx-store"></i> {getLang('My Stores')}</Link></li> : ''}
                                        {this.state.user.isAdmin ? <li ng-show="User && User.isAdmin" className="nav-item"><Link className="nav-link" to="/admin"><i className="bx bx-certification"></i> {getLang('Administration')}</Link></li> : ''}
                                        <li ng-show="User" className="nav-item"><Link to="/logout" title="Logout" data-toggle="tooltip" className="nav-link cursor-pointer"><i className="bx bx-log-out"></i></Link></li>
                                    </>}
                                </ul>
                                <ul className="navbar-nav">
                                    <li className="nav-item dropdown">
                                        <Dropdown show={this.state.showLangDropdown} onToggle={() => this.setState({ showLangDropdown: !this.state.showLangDropdown })}>
                                            <Dropdown.Toggle as="span" role="button" className="lang-dropdown nav-link dropdown-toggle dropdown-toggle-nocaret">
                                                <div className="lang d-flex gap-1">
                                                    <div>
                                                        <i className={'flag-icon flag-icon-' + getCurrentLangItem().flag}></i>
                                                    </div>
                                                    <div>
                                                        <span className="text-uppercase">{getCurrentLangItem().ident}</span>
                                                    </div>
                                                </div>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="dropdown-menu dropdown-menu-lg-end">
                                                {getLanguages().map(a => <button key={a.ident} type="button" onClick={() => { this.props.setLang(a); this.setState({ showLangDropdown: false }); }} className="dropdown-item d-flex allign-items-center cursor-pointer">
                                                    <i className={'flag-icon flag-icon-' + a.flag + ' me-2'}></i><span>{a.name}</span>
                                                </button>)}
                                            </Dropdown.Menu>
                                        </Dropdown>

                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                    {this.isHeaderVisible() ? <div className={(this.state.searchVisible ? '' : 'd-none d-lg-block')}>
                        <div className="header-content bg-warning">
                            <div className="container">
                                <div className="row align-items-center gx-4">
                                    <div className="col-auto d-none d-md-block">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="mobile-toggle-menu d-inline d-xl-none" data-bs-toggle="offcanvas"
                                                data-bs-target="#offcanvasNavbar" onClick={() => this.toggleNav(true)}>
                                                <i className="bx bx-menu"></i>
                                            </div>
                                            <div className="logo">
                                                <Link to="/">
                                                    <img src="/img/logo.png" className="logo-icon" alt="" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-xl order-4 order-xl-0">
                                        <SearchBar />
                                    </div>
                                    <div className="col-auto ms-auto">
                                        <div className="top-cart-icons">
                                            <nav className="navbar navbar-expand">
                                                <ul className="navbar-nav">
                                                    <li className="nav-item d-none d-md-block">
                                                        <Link to="/my" className="nav-link cart-link"><i className="bx bx-user"></i></Link>
                                                    </li>
                                                    <li className="nav-item d-none d-md-block">
                                                        <CartIcon />
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={'primary-menu' + (this.isMenuVisible() ? '' : ' d-md-none')}>
                            <nav className="navbar navbar-expand-xl w-100 navbar-dark container mb-0 p-0">
                                <div className={'offcanvas offcanvas-start' + (this.state.showNav ? ' show' : '')} tabIndex="-1" id="offcanvasNavbar">
                                    <div className="offcanvas-header">
                                        <div className="offcanvas-logo">
                                            <img src="/img/logo.png" width="100" alt="" />
                                        </div>
                                        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" onClick={() => this.toggleNav(false)}></button>
                                    </div>
                                    <div className="offcanvas-body primary-menu">
                                        <ul className="navbar-nav justify-content-start flex-grow-1 gap-1">
                                            <li className="nav-item">
                                                <NavLink className="nav-link" to="/" onClick={() => this.toggleNav(false)}> {getLang('Home')} </NavLink>
                                            </li>
                                            {this.state.categories1.length !== 0 ? <Dropdown id="web-dropdown-category" as="li" show={this.state.showCategoryDropdown} onToggle={() => this.setState({ showCategoryDropdown: !this.state.showCategoryDropdown })} onMouseOver={() => { if (this.showCategoryDropdownTimer) clearTimeout(this.showCategoryDropdownTimer); this.setState({ showCategoryDropdown: true }); }} onMouseOut={() => { this.showCategoryDropdownTimer = setTimeout(() => this.setState({ showCategoryDropdown: false }), 500); }}>
                                                <Dropdown.Toggle role="button" as="a" className="nav-link dropdown-toggle dropdown-toggle-nocaret">
                                                    {getLang('Shop Categories')}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className="dropdown-menu dropdown-large-menu">
                                                    <div className="row">
                                                        <div className={'col-12' + (this.state.categories2.length !== 0 ? 'col-xl-6' : '')}>
                                                            <ul className="list-unstyled">
                                                                {this.state.categories1.map(a => <li key={a.id}>
                                                                    <NavLink to={'/c/' + a.ident} onClick={() => this.toggleNav(false)}>{a.name}</NavLink>
                                                                </li>)}
                                                            </ul>
                                                        </div>
                                                        {this.state.categories2.length !== 0 ? <div className="col-12 col-xl-6">
                                                            <ul className="list-unstyled">
                                                                {this.state.categories2.map(a => <li key={a.id}>
                                                                    <NavLink to={'/c/' + a.ident} onClick={() => this.toggleNav(false)}>{a.name}</NavLink>
                                                                </li>)}
                                                            </ul>
                                                        </div> : ''}
                                                        <div className="col-12 col-xl-4 d-none">
                                                            <div className="pramotion-banner1">
                                                                <img src="assets/images/gallery/menu-img.jpg" className="img-fluid" alt="" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                </Dropdown.Menu>
                                            </Dropdown> : ''}

                                            <li className="nav-item">
                                                <NavLink className="nav-link" to="/about" onClick={() => this.toggleNav(false)}> {getLang('About')} </NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink className="nav-link" to="/contact" onClick={() => this.toggleNav(false)}> {getLang('Contact Us')} </NavLink>
                                            </li>
                                            <Dropdown id="web-dropdown-my" as="li" show={this.state.showMyDropdown} onToggle={() => this.setState({ showMyDropdown: !this.state.showMyDropdown })} onMouseOver={() => { if (this.showMyDropdownTimer) clearTimeout(this.showMyDropdownTimer); this.setState({ showMyDropdown: true }); }} onMouseOut={() => { this.showMyDropdownTimer = setTimeout(() => this.setState({ showMyDropdown: false }), 500); }}>
                                                <Dropdown.Toggle role="button" as="a" className="nav-link dropdown-toggle dropdown-toggle-nocaret">
                                                    {getLang('My Account')}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu as="ul" className="dropdown-menu">
                                                    {this.state.user ? <>
                                                        <li>
                                                            <Link className="dropdown-item" to="/my" onClick={() => this.toggleNav(false)}> {getLang('Dashboard')} </Link>
                                                        </li>
                                                        <li>
                                                            <Link className="dropdown-item" to="/my/orders" onClick={() => this.toggleNav(false)}> {getLang('My Orders')} </Link>
                                                        </li>
                                                        <li>
                                                            <Link className="dropdown-item" to="/my/stores" onClick={() => this.toggleNav(false)}> {getLang('My Stores')} </Link>
                                                        </li>
                                                        <li>
                                                            <Link className="dropdown-item" to="/my/profile" onClick={() => this.toggleNav(false)}> {getLang('My Profile')} </Link>
                                                        </li>
                                                        <li>
                                                            <hr className="dropdown-divider" />
                                                        </li>
                                                        <li><Link className="dropdown-item" to="/logout" onClick={() => this.toggleNav(false)}> {getLang('Logout')} </Link></li>
                                                    </> : <>
                                                        <li>
                                                            <Link className="dropdown-item" to="/login" onClick={() => this.toggleNav(false)}> {getLang('Login')} </Link>
                                                        </li>
                                                        <li>
                                                            <Link className="dropdown-item" to="/signup" onClick={() => this.toggleNav(false)}> {getLang('Sign Up')} </Link>
                                                        </li>
                                                    </>}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                            <li className="nav-item">
                                                <NavLink className="nav-link" to="/blog" onClick={() => this.toggleNav(false)}> {getLang('Blog')} </NavLink>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </nav>
                        </div>
                    </div> : ''}
                </div>
                <div className={'view-wrapper' + (this.isMenuVisible() ? '' : ' menu-hidden') + (this.isHeaderVisible() ? '' : ' header-hidden')}>
                    <Outlet />
                </div>
                <footer>
                    <section className="py-5 border-top bg-light d-none d-md-block">
                        <div className="container">
                            <div className="row row-cols-1 row-cols-lg-2 row-cols-xl-4">
                                <div className="col">
                                    <div className="footer-section1">
                                        <h5 className="mb-4 text-uppercase fw-bold"> {getLang('Contact Info')} </h5>
                                        <div className="phone mb-3" ng-show="false">
                                            <h6 className="mb-0 text-uppercase fw-bold"> {getLang('Phone')} </h6>
                                            <p className="mb-0"> {getLang('Support:')} <a href="tel:+17873023141">(787) 302-3141</a> </p>
                                        </div>
                                        <div className="email mb-3">
                                            <h6 className="mb-0 text-uppercase fw-bold"> {getLang('Email')} </h6>
                                            <p className="mb-0"><a href="mailto:support@metropolis.market">support@metropolis.market</a></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="footer-section2">
                                        <h5 className="mb-4 text-uppercase fw-bold"> {getLang('Categories')} </h5>
                                        <ul className="list-unstyled">
                                            {this.state.categories1.map(a => <li key={a.id} className="mb-1">
                                                <Link to={'/c/' + a.ident}><i className="bx bx-chevron-right"></i> {a.name}</Link>
                                            </li>)}
                                        </ul>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="footer-section2">
                                        <h5 className="mb-4 text-uppercase fw-bold">  </h5>
                                        <ul className="list-unstyled">
                                            {this.state.categories2.map(a => <li key={a.id} className="mb-1">
                                                <Link to={'/c/' + a.ident}><i className="bx bx-chevron-right"></i> {a.name}</Link>
                                            </li>)}
                                        </ul>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="footer-section4">
                                        <h5 className="mb-4 text-uppercase fw-bold"> {getLang('Stay informed')} </h5>
                                        <div className="subscribe">
                                            <form onSubmit={this.submitNewsletter}>
                                                <FormInput model={this.state.newsletter} name="email" type="email" label="Enter Your Email" labelAsPlaceholder />
                                                <div className="mt-3 d-grid">
                                                    <button type="submit" className="btn btn-dark btn-ecomm" disabled={this.state.submittingNewsletter}> {getLang('Subscribe')} </button>
                                                </div>
                                                <p className="mt-3 mb-0"> {getLang('Subscribe to our newsletter to receive early discount offers, updates and new products info.')} </p>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="footer-strip text-center py-3 border-top positon-absolute bottom-0">
                        <div className="container">
                            <div className="d-flex flex-column flex-lg-row align-items-center gap-3 justify-content-between">
                                <p className="mb-0">Metropolis Market v{this.state.version} | Copyright &copy; {new Date().getFullYear()} Metropolis Market LLC. <L>All right reserved.</L> | Powered by: <a href="https://www.solusek.com/" target="_blank"> {getLang('Solusek Systems')} </a> <br /> <Link to="/terms-of-service"> {getLang('Terms of Service')} </Link> | <Link to="/privacy-policy"> {getLang('Privacy Policy')} </Link> | <Link to="/return-policy">Return Policy</Link> | <Link to="/cookie-policy">Cookie Policy</Link></p>
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
        </>);
    }
}

export default withParamsAndNavigate(Web);