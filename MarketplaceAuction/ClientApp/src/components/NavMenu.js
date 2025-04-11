import React, { Component } from 'react';
import { Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink, Spinner } from 'reactstrap';
import { Link, NavLink as DomNavLink } from 'react-router-dom';
import './NavMenu.css';
import L from './Lang';
import SearchForm from './SearchForm';
import SignupModal from './SignupModal';
import Auth from '../shared/Auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import LoginModal from './LoginModal';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import Globals from '../shared/Globals';
import Logo from './Logo';
import ForgotPasswordModal from './ForgotPasswordModal';
import { qreq } from '../shared/qrequest';
import Icon from './Icon';

export class NavMenu extends Component {

    constructor(props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true,
            currentLang: Globals.currentLang ?? 'en',
            loaded: false,
            hasActive: true,
            hasActiveAppliances: false,
            mobileView: Globals.mobileView
        };

        this.setLang = this.setLang.bind(this);
        this.pullActiveCount = this.pullActiveCount.bind(this);
        this.onNav = this.onNav.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(j => {
            this.setState({ user: j, loaded: true });
        });
        this.pullActiveCount();
        this.interval = setInterval(() => this.pullActiveCount(), 15000);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.currentLang !== Globals.currentLang)
            this.setState({ currentLang: Globals.currentLang });
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    setLang(lang) {
        Globals.setLang(lang);
        this.setState({ currentLang: lang, langDropdownOpen: false });
        this.props.onLangChange(lang);
    }

    pullActiveCount() {
        qreq.get('/api/vehicle/active/count', j => {
            if (j.item)
                this.setState({ hasActive: true });
            else
                this.setState({ hasActive: false });
        });
        qreq.get('/api/auction/appliance/active/count', j => {
            if (j.item)
                this.setState({ hasActiveAppliances: true });
            else
                this.setState({ hasActiveAppliances: false });
        });
    }

    onNav() {
        this.setState({ collapsed: true });
    }

    render() {
        return (
            <>
                <LoginModal show={this.state.showLoginModal} onToggle={() => { this.setState({ showLoginModal: false }); }} onSignUp={(e) => { e.preventDefault(); this.setState({ showSignupModal: true, showLoginModal: false }); }} onForgotPassword={() => this.setState({ showForgotPasswordModal: true, showLoginModal: false })} />
                <SignupModal show={this.state.showSignupModal} onToggle={() => this.setState({ showSignupModal: false })} onLogin={(e) => { e.preventDefault(); this.setState({ showSignupModal: false, showLoginModal: true }); }} />
                <ForgotPasswordModal show={this.state.showForgotPasswordModal} onToggle={() => this.setState({ showForgotPasswordModal: false })} onLogin={() => this.setState({ showForgotPasswordModal: false, showLoginModal: true })} />
                <header>
                    {this.state.mobileView ? <>
                    <div className="NavMenu native-header">
                        <img src="/img/icon.png" className="logo img-fluid" alt="" />
                    </div>
                    <div className="NavMenu native">
                        <div className="row text-center">
                            <DomNavLink to="/" className={'col' + (this.state.hasActiveAppliances ? '' : ' disabled')} onClick={e => { if(!this.state.hasActiveAppliances) e.preventDefault(); }}>
                                <Icon icon="faGavel" />
                                <span><L>Articles</L></span>
                            </DomNavLink>
                            <DomNavLink to="/vehicles" className={'col' + (this.state.hasActive ? '' : ' disabled')} onClick={e => { if(!this.state.hasActive) e.preventDefault(); }}>
                                <Icon icon="faCar" />
                                <span><L>Vehicles</L></span>
                            </DomNavLink>
                            <DomNavLink to="/sell" className="col">
                                <Icon icon="faDollarSign" />
                                <span><L>Sell</L></span>
                            </DomNavLink>
                            {this.state.user ? <DomNavLink to="/my" className="col">
                                <Icon icon="faUser" />
                                <span><L>My Account</L></span>
                            </DomNavLink>
                            : <DomNavLink to="/login" className="col">
                                <Icon icon="faUser" />
                                <span><L>Login</L></span>
                            </DomNavLink>}
                        </div>
                    </div></> :
                    <div className="container">
                        <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow" container light>
                            <NavbarBrand tag={Link} to="/"><Logo /></NavbarBrand>
                            <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                            <Collapse className="d-sm-inline-flex" isOpen={!this.state.collapsed} navbar>
                                <ul className="navbar-nav flex-grow mb-3 mb-md-0">
                                    {this.state.hasActiveAppliances ?
                                        <NavItem>
                                            <NavLink tag={DomNavLink} to="/articles" className="rounded-md ps-md-3 pe-md-3" onClick={this.onNav}><L>Articles</L></NavLink>
                                        </NavItem> : ''}
                                    {this.state.hasActive ?
                                        <NavItem>
                                            <NavLink tag={DomNavLink} to="/vehicles" className="rounded-md ps-md-3 pe-md-3" onClick={this.onNav}><L>Vehicles</L></NavLink>
                                        </NavItem> : ''}
                                    <NavItem>
                                        <NavLink tag={DomNavLink} to="/sell" className="rounded-md ps-md-3 pe-md-3" onClick={this.onNav}><L>Sell</L></NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink tag={DomNavLink} to="/about" className="rounded-md ps-md-3 pe-md-3" onClick={this.onNav}><L>About Us</L></NavLink>
                                    </NavItem>
                                </ul>
                                <div className="search d-none d-lg-block">
                                    <SearchForm />
                                </div>
                                <div className="ms-auto ms-lg-3 user-nav">
                                    <Dropdown tag="span" isOpen={this.state.langDropdownOpen} toggle={() => this.setState({ langDropdownOpen: !this.state.langDropdownOpen })} direction="start" flip="true" >
                                        <DropdownToggle title="Language" tag="a" data-toggle="dropdown" className="pointer" style={{ textDecoration: 'none' }}><img src={'/img/lang/' + this.state.currentLang + '.png'} alt="" style={{ height: '18px', marginTop: '-4px' }} /> {this.state.currentLang.toUpperCase()}</DropdownToggle>
                                        <DropdownMenu style={{ marginTop: '50px' }}>
                                            <DropdownItem className={this.state.currentLang === 'en' ? 'active' : ''} onClick={() => this.setLang('en')}>English</DropdownItem>
                                            <DropdownItem className={this.state.currentLang === 'es' ? 'active' : ''} onClick={() => this.setLang('es')}>Espa&ntilde;ol</DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                    {this.state.loaded ?
                                        (this.state.user ? <>
                                            <Dropdown tag="span" isOpen={this.state.myDropdownOpen} toggle={() => this.setState({ myDropdownOpen: !this.state.myDropdownOpen })} direction="start" flip="true" >
                                                <DropdownToggle title="My Account" tag="a" data-toggle="dropdown" className="pointer" style={{ textDecoration: 'none' }}><FontAwesomeIcon icon={fa.faUser} /> <span className="d-inline d-sm-none fs-14">{this.state.user.username}</span></DropdownToggle>
                                                <DropdownMenu style={{ marginTop: '50px' }}>
                                                    {this.state.user.isAdmin ? <><DropdownItem><DomNavLink to="/admin/listings/vehicle"><L>Administration</L></DomNavLink></DropdownItem></> : ''}
                                                    <DropdownItem><DomNavLink to="/my/profile" onClick={this.onNav}><L>My Account</L></DomNavLink></DropdownItem>
                                                    <DropdownItem><DomNavLink to="/my/listings" onClick={this.onNav}><L>My Listings</L></DomNavLink></DropdownItem>
                                                    <DropdownItem><DomNavLink to="/my/wallet" onClick={this.onNav}><L>Payment Methods</L></DomNavLink></DropdownItem>
                                                    <DropdownItem><DomNavLink to="/logout" onClick={this.onNav}><L>Logout</L></DomNavLink></DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </> :
                                            <button type="submit" className="btn btn-success signup" onClick={() => this.setState({ showLoginModal: true })}><L>Sign In</L></button>) : <Spinner />}
                                </div>
                            </Collapse>
                        </Navbar>
                    </div>}
                </header>
            </>
        );
    }
}
