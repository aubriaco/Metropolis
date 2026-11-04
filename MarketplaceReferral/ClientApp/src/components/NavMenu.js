import React from 'react';
import { Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink, Dropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap';
import { NavLink as DomNavLink } from 'react-router-dom';
import './NavMenu.css';
import BaseCom from './BaseCom';
import Logo from './Logo';
import L from './Lang';
import { qreq } from '../shared/qrequest';
import Auth from '../shared/Auth';
import Icon from './Icon';

class NavMenuList extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            programs: [],
            currentLang: props.currentLang ?? 'en'
        };
    }

    componentDidMount() {
        qreq.get('/api/referral/program/list', j => {
            if (j.list)
                this.setState({ programs: j.list });
        });

        Auth.getLogin(u => {
            this.setState({ user: u });
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.currentLang !== this.props.currentLang)
            this.setState({ currentLang: this.props.currentLang });
    }

    setLang(lang) {
        this.props.onLangChange(lang);
    }

    render() {
        return <><ul className="navbar-nav flex-grow">
            {this.state.user ? <><NavItem>
                <NavLink tag={DomNavLink} to="/dashboard" onClick={() => this.props.onNav()}><L>Dashboard</L></NavLink>
            </NavItem>
                {this.state.user.isRefAdmin ?
                    <NavItem>
                        <NavLink tag={DomNavLink} to="/admin/dashboard" onClick={() => this.props.onNav()}><L>Administration</L></NavLink>
                    </NavItem> : ''}
            </> :
                <NavItem>
                    <NavLink tag={DomNavLink} to="/" onClick={() => this.props.onNav()}><L>Home</L></NavLink>
                </NavItem>}
            {!this.state.user ? this.state.programs.map(i => <NavItem className="d-none" key={i.id}>
                <NavLink tag={DomNavLink} to={'/program/' + i.ident} onClick={() => this.props.onNav()}>{i.name}</NavLink>
            </NavItem>) : ''}
            {!this.state.user ? <NavItem>
                <NavLink tag={DomNavLink} to="/login" onClick={() => this.props.onNav()}><L>Login</L></NavLink>
            </NavItem> : <NavItem>
                <NavLink tag={DomNavLink} to="/logout" onClick={() => this.props.onNav()}><L>Logout</L> <Icon icon="faRightFromBracket" /></NavLink>
            </NavItem>}
            <NavItem className="ms-0 ms-md-2 mt-2 mt-md-0">
                <Dropdown isOpen={this.state.langDropdownOpen} toggle={() => this.setState({ langDropdownOpen: !this.state.langDropdownOpen })}>
                    <DropdownToggle title="Language" role="button" data-toggle="dropdown" className="nav-link" style={{ textDecoration: 'none' }}><img src={'/img/lang/' + this.state.currentLang + '.png'} alt="" style={{ height: '18px', marginTop: '-4px' }} /> {this.state.currentLang.toUpperCase()}</DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem className={this.state.currentLang === 'en' ? 'active' : ''} onClick={() => this.setLang('en')}>English</DropdownItem>
                        <DropdownItem className={this.state.currentLang === 'es' ? 'active' : ''} onClick={() => this.setLang('es')}>Espa&ntilde;ol</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </NavItem>
        </ul>
        </>;
    }
}

export class NavMenu extends BaseCom {

    constructor(props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true
        };
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    render() {
        return (
            <header>
                <div className="top-header">
                    <div className="container">
                        <span className="d-inline-block me-3">
                            <Icon icon="faPhone" /> 000-000-0000
                        </span>
                        <span>
                            <Icon icon="faEnvelope" /> info@solopowerpr.com
                        </span>
                    </div>
                </div>
                <Navbar className="navbar-expand-sm navbar-toggleable-sm border-bottom box-shadow mb-3" container light>
                    <NavbarBrand tag={DomNavLink} to="/"><Logo /></NavbarBrand>
                    <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                    <div className="d-none d-md-block">
                        <NavMenuList onNav={() => this.setState({ collapsed: true })} setLayoutState={this.props.setLayoutState} onLangChange={lang => this.props.onLangChange(lang)} currentLang={this.props.currentLang} />
                    </div>
                </Navbar>


                <div className={'d-block d-sm-none bg-dark offcanvas offcanvas-start' + (this.state.collapsed ? '' : ' show')} tabIndex="-1" id="offcanvas" aria-labelledby="offcanvasLabel">
                    <div className="offcanvas-header text-light">
                        <h5 className="offcanvas-title" id="offcanvasLabel"><Logo /></h5>
                        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" onClick={this.toggleNavbar}></button>
                    </div>
                    <div className="offcanvas-body text-light fs-3">
                        <NavMenuList onNav={() => this.setState({ collapsed: true })} setLayoutState={this.props.setLayoutState} onLangChange={lang => this.props.onLangChange(lang)} currentLang={this.props.currentLang} />
                    </div>
                </div>
            </header>
        );
    }
}
