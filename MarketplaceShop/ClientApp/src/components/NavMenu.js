import React from 'react';
import { Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { NavLink as DomNavLink } from 'react-router-dom';
import './NavMenu.css';
import BaseCom from './BaseCom';
import Logo from './Logo';

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
                    <ul className="navbar-nav flex-grow">
                        <NavItem>
                            <NavLink tag={DomNavLink} to="/">Home</NavLink>
                        </NavItem>
                    </ul>
                </Navbar>
            </header>
        );
    }
}
