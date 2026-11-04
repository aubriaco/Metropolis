import React from 'react';
import { Collapse, Navbar, NavbarBrand, NavbarToggler } from 'reactstrap';
import { Link, NavLink as DomNavLink } from 'react-router-dom';
import './NavMenu.css';
import BaseCom from './BaseCom';
import Logo from './Logo';
import Manage from './Manage';
import Auth from '../shared/Auth';
import Globals from '../shared/Globals';
import Icon from './Icon';
import { qreq } from '../shared/qrequest';
import SelectVendorModal from './SelectVendorModal';

export class NavMenu extends BaseCom {

    constructor(props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            vendors: [],
            activeVendor: {},
            showMobileSidebar: false,
            selectVendorOpen: false
        };
        this.setActiveVendor = this.setActiveVendor.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            this.setState({ user: u });
            if (u) {
                qreq.get('/api/vendor/get/active', j => {
                    if (j.item) {
                        this.setState({ activeVendor: j.item });
                    }
                    qreq.get('/api/vendor/list', j => {
                        if (j.list)
                            this.setState({ vendors: j.list });
                    });
                });
            }
        });
    }

    componentDidUpdate(prevProps) {
        if(prevProps.showMobileSidebar !== this.props.showMobileSidebar)
            this.setState({ showMobileSidebar: this.props.showMobileSidebar });
    }

    toggleNavbar() {
        var b = !this.state.showMobileSidebar;
        this.props.setShowMobileSidebar(b);
        this.setState({ showMobileSidebar: b });
    }

    setActiveVendor(obj) {
        this.setState({ selectVendorOpen: false });
        qreq.post('/api/vendor/set/active', obj, j => {
            this.setState({ showSelectVendorModal: false });
            if (j.errorCode === 0) {
                this.setState({ activeVendor: j.item });
                window.location.reload();
            }
        });
    }

    render() {
        return <>
            <SelectVendorModal show={this.state.showSelectVendorModal} vendors={this.state.vendors} activeVendor={this.state.activeVendor} setActiveVendor={this.setActiveVendor} onToggle={() => this.setState({ showSelectVendorModal: false })} />
            <header>
                <Navbar className="navbar-expand-sm navbar-toggleable-sm mb-3" light>
                    <NavbarBrand><Logo white /></NavbarBrand>
                    <div className="d-flex justify-content-end align-items-center">
                        {this.state.user ? <button type="button" className="btn btn-primary btn-lg me-2" onClick={() => this.setState({ showSelectVendorModal: true })}><Icon icon="faStore" /> {this.state.activeVendor.name ?? ''}</button> : ''}
                        <button type="button" className="btn btn-primary btn-lg me-2 text-uppercase" onClick={() => Globals.setAppLang()}>{Globals.currentLang}</button>
                        {this.state.user ? <NavbarToggler onClick={this.toggleNavbar} className="mr-2" /> : ''}
                    </div>
                </Navbar>
            </header>
            <div className={(this.state.showMobileSidebar ? 'd-block' : 'd-none') + ' d-md-none sidebar bg-dark p-4'}>
                <Manage setShowMobileSidebar={this.setShowMobileSidebar} />
            </div>
        </>;
    }
}
