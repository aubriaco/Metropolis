import React, { Component } from 'react';
import { Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link, NavLink as DomNavLink } from 'react-router-dom';
import './NavMenu.css';
import Globals from '../shared/Globals';
import BaseCom from './BaseCom';
import Auth from '../shared/Auth';

export class NavMenu extends BaseCom {
    constructor(props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true
        };
    }

    componentDidMount() {
        Auth.getLogin(j => {
            this.setState({ user: j });
        });
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    render() {
        return (
            <header>
                <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" container light>
                    <NavbarBrand tag={Link} to="/">{Globals.appName}</NavbarBrand>
                    <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                    <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
                        <ul className="navbar-nav flex-grow">   
                            {this.state.user ? <>
                                <NavItem>
                                    <NavLink tag={DomNavLink} className="text-dark" to="/">Manage</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={DomNavLink} className="text-dark" to="/auction/vehicle/list">Auction</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={DomNavLink} className="text-dark" to="/logout">Logout</NavLink>
                                </NavItem>
                            </> : ''}
                        </ul>
                    </Collapse>
                </Navbar>
            </header>
        );
    }
}
