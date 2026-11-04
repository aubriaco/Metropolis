import React from 'react';
import { Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { NavLink as DomNavLink } from 'react-router-dom';
import './NavMenu.css';
import BaseCom from './BaseCom';
import Logo from './Logo';

class NavMenuList extends BaseCom {
    render() {
        return <><ul className="navbar-nav flex-grow">
            <NavItem>
                <NavLink tag={DomNavLink} to="/" onClick={() => this.props.onNav()}>Home</NavLink>
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
                <Navbar className="navbar-expand-sm navbar-toggleable-sm text-dark border-bottom box-shadow mb-3" container light>
                    <NavbarBrand tag={DomNavLink} to="/"><Logo /></NavbarBrand>
                    <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                    <div className="d-none d-md-block">
                        <NavMenuList onNav={() => this.setState({ collapsed: true })} setLayoutState={this.props.setLayoutState} onLangChange={lang => this.props.onLangChange(lang)} />
                    </div>
                </Navbar>

                <div className={'d-block d-sm-none bg-dark offcanvas offcanvas-start' + (this.state.collapsed ? '' : ' show')} tabIndex="-1" id="offcanvas" aria-labelledby="offcanvasLabel">
                    <div className="offcanvas-header text-light">
                        <h5 className="offcanvas-title" id="offcanvasLabel"><Logo /></h5>
                        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" onClick={this.toggleNavbar}></button>
                    </div>
                    <div className="offcanvas-body text-light fs-3">
                        <NavMenuList onNav={() => this.setState({ collapsed: true })} setLayoutState={this.props.setLayoutState} onLangChange={lang => this.props.onLangChange(lang)} />
                    </div>
                </div>
            </header>
        );
    }
}
