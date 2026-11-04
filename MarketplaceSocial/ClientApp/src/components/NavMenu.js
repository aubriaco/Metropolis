import React, { Component } from 'react';
import { Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink, Spinner } from 'reactstrap';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Link, NavLink as DomNavLink } from 'react-router-dom';
import './NavMenu.css';
import BaseCom from './BaseCom';
import Globals from '../shared/Globals';
import Auth from '../shared/Auth';
import L from './Lang';
import Logo from './Logo';
import FormInput from './FormInput';
import SearchForm from './SearchForm';


export class NavMenuList extends BaseCom {

    constructor(props) {
        super(props);

        this.state = {
            collapsed: true,
            currentLang: Globals.currentLang ?? 'en',
            loaded: false,
            hasActive: true
        };

        this.setLang = this.setLang.bind(this);

    }

    componentDidMount() {
        Auth.getLogin(j => {
            this.setState({ user: j, loaded: true });
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.currentLang !== Globals.currentLang)
            this.setState({ currentLang: Globals.currentLang });
    }

    setLang(lang) {
        Globals.setLang(lang);
        this.setState({ currentLang: lang, langDropdownOpen: false });
        this.props.onLangChange(lang);
    }

    render() {

        var onNav = this.props.onNav ?? function () { };

        return <ul className="navbar-nav flex-grow">
            <NavItem>
                <DomNavLink className="nav-link text-light" to="/" onClick={onNav}><L>Home</L></DomNavLink>
        </NavItem>
            {this.state.loaded ? this.state.user ? <>
                <NavItem>
                    <DomNavLink className="nav-link text-light" to="/my/garage" onClick={onNav}><L>My Garage</L></DomNavLink>
                </NavItem>
                <NavItem className="d-none">
                    <DomNavLink className="nav-link text-light" to="/my/laps" onClick={onNav}><L>My Laps</L></DomNavLink>
                </NavItem>
                <NavItem className="d-none">
                    <DomNavLink className="nav-link text-light" to="/groups" onClick={onNav}><L>Groups</L></DomNavLink>
                </NavItem>
                <NavItem>
                    <DomNavLink className="nav-link text-light" to="/race-tracks" onClick={onNav}><L>Race Tracks</L></DomNavLink>
                </NavItem>
                <NavItem className="d-block d-md-none">
                    <DomNavLink className="nav-link text-light" to="/my/profile" onClick={onNav}><L>My Profile</L></DomNavLink>
                </NavItem>
                <NavItem className="ms-0 ms-sm-3 mt-2 mt-sm-0 d-none d-md-block">
                    <Dropdown isOpen={this.state.langDropdownOpen} toggle={() => this.setState({ langDropdownOpen: !this.state.langDropdownOpen })}>
                        <DropdownToggle title="Language" role="button" data-toggle="dropdown" className="nav-link bg-dark text-light" style={{ textDecoration: 'none' }}><img src={'/img/lang/' + this.state.currentLang + '.png'} alt="" style={{ height: '18px', marginTop: '-4px' }} /> {this.state.currentLang.toUpperCase()}</DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem className={this.state.currentLang === 'en' ? 'active' : ''} onClick={() => this.setLang('en')}>English</DropdownItem>
                            <DropdownItem className={this.state.currentLang === 'es' ? 'active' : ''} onClick={() => this.setLang('es')}>Espa&ntilde;ol</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </NavItem>
                <NavItem className="ms-0 ms-sm-3 mt-2 mt-sm-0 d-none d-md-block">
                    <Dropdown isOpen={this.state.userDropdownOpen} toggle={() => this.setState({ userDropdownOpen: !this.state.userDropdownOpen })}>
                        <DropdownToggle title="User" role="button" data-toggle="dropdown" className="nav-link text-light bg-danger p-2 ps-3 pe-3 rounded" style={{ textDecoration: 'none' }}>{this.state.user.username}</DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem><DomNavLink to="/my/profile" onClick={onNav}><L>My Profile</L></DomNavLink></DropdownItem>
                            <DropdownItem><DomNavLink to="/logout" onClick={onNav}><L>Logout</L></DomNavLink></DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </NavItem>
                <NavItem className="d-block d-md-none mt-3">
                    <Dropdown isOpen={this.state.langDropdownOpen2} toggle={() => this.setState({ langDropdownOpen2: !this.state.langDropdownOpen2 })} tag="span" className="float-start">
                        <DropdownToggle title="Language" role="button" data-toggle="dropdown" className="p-2 ps-3 pe-3 bg-dark text-light fs-2" style={{ textDecoration: 'none' }}><img src={'/img/lang/' + this.state.currentLang + '.png'} alt="" style={{ height: '18px', marginTop: '-4px' }} /> {this.state.currentLang.toUpperCase()}</DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem className={this.state.currentLang === 'en' ? 'active' : ''} onClick={() => this.setLang('en')}>English</DropdownItem>
                            <DropdownItem className={this.state.currentLang === 'es' ? 'active' : ''} onClick={() => this.setLang('es')}>Espa&ntilde;ol</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <Dropdown isOpen={this.state.userDropdownOpen2} toggle={() => this.setState({ userDropdownOpen2: !this.state.userDropdownOpen2 })} className="float-start ms-4">
                        <DropdownToggle title="User" role="button" data-toggle="dropdown" className="text-light bg-danger p-2 ps-3 pe-3 rounded fs-2" style={{ textDecoration: 'none' }}>{this.state.user.username}</DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem><DomNavLink to="/my/profile" onClick={onNav}><L>My Profile</L></DomNavLink></DropdownItem>
                            <DropdownItem><DomNavLink to="/logout" onClick={onNav}><L>Logout</L></DomNavLink></DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </NavItem>
            </> :
                <>
                    <NavItem className="ms-0 ms-sm-3 mt-2 mt-sm-0 d-none d-md-block">
                        <Dropdown isOpen={this.state.langDropdownOpen} toggle={() => this.setState({ langDropdownOpen: !this.state.langDropdownOpen })}>
                            <DropdownToggle title="Language" role="button" data-toggle="dropdown" className="nav-link bg-dark text-light" style={{ textDecoration: 'none' }}><img src={'/img/lang/' + this.state.currentLang + '.png'} alt="" style={{ height: '18px', marginTop: '-4px' }} /> {this.state.currentLang.toUpperCase()}</DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem className={this.state.currentLang === 'en' ? 'active' : ''} onClick={() => this.setLang('en')}>English</DropdownItem>
                                <DropdownItem className={this.state.currentLang === 'es' ? 'active' : ''} onClick={() => this.setLang('es')}>Espa&ntilde;ol</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </NavItem>
                <NavItem className="ms-0 ms-sm-3">
                    <NavLink tag={Link} className="text-light bg-danger p-2 ps-3 pe-3 rounded" to="/signup" onClick={(e) => { e.preventDefault(); this.props.setLayoutState({ showSignUpModal: true }); }}><L>Create new account</L></NavLink>
                </NavItem></> : <Spinner className="ms-0 ms-sm-3" />}
        </ul>;
        ;
    }
}


export default class NavMenu extends Component {
    static displayName = NavMenu.name;

    constructor(props) {
        super(props);

        this.state = {
            collapsed: true,
            show: false
        };
        this.toggleNavbar = this.toggleNavbar.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(j => {
            this.setState({ user: j, loaded: true });
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.currentLang !== Globals.currentLang)
            this.setState({ currentLang: Globals.currentLang });
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }


    render() {
        return (
            <header>
                <Navbar className="navbar-expand-sm navbar-dark navbar-toggleable-sm border-bottom box-shadow mb-3" container light>
                    <NavbarBrand tag={Link} to="/"><Logo /></NavbarBrand>
                    <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                    <div className="navbar d-sm-inline-flex flex-sm-row-reverse d-none d-sm-block">
                        <NavMenuList setLayoutState={this.props.setLayoutState} onLangChange={lang => this.props.onLangChange(lang)} />
                        {this.state.user ? <SearchForm /> : ''}
                    </div>
                </Navbar>
                <div className={'d-block d-sm-none bg-dark offcanvas offcanvas-start' + (this.state.collapsed ? '' : ' show')} tabIndex="-1" id="offcanvas" aria-labelledby="offcanvasLabel">
                    <div className="offcanvas-header text-light">
                        <h5 className="offcanvas-title" id="offcanvasLabel">{Globals.appName}</h5>
                        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" onClick={this.toggleNavbar}></button>
                    </div>
                    <div className="offcanvas-body">
                        <div className="mb-2">
                            {this.state.user ? <SearchForm onSearch={() => this.setState({ collapsed: true })} /> : ''}
                        </div>
                        <NavMenuList onNav={() => this.setState({ collapsed: true })} setLayoutState={this.props.setLayoutState} onLangChange={lang => this.props.onLangChange(lang)} />
                    </div>
                </div>
            </header>
        );
    }
}
