import React, { Component } from 'react';
import Manage from './Manage';
import { Navbar } from 'rsuite';
import { NavbarBrand, NavbarToggler } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';

export default class Website extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showMobileSidebar: false
    };
    this.setShowMobileSidebar = this.setShowMobileSidebar.bind(this);
  }

  setShowMobileSidebar(b) {
    this.setState({ showMobileSidebar: b });
  }

  render() {
    return (
      <div className="wrapper" id="wrapper">
        <header>
          <Navbar className="navbar-expand-sm navbar-toggleable-sm mb-3" container light>
            <NavbarBrand tag={NavLink} to="/"><Logo white /></NavbarBrand>
            <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
          </Navbar>
        </header>
        <div className="page-wrapper" onClick={() => this.setShowMobileSidebar(false)}>
          <div className="d-flex">
            <div className="d-none d-md-block p-4 left-side">
              <Manage />
            </div>
            <div className="d-block flex-fill p-2 p-md-0">
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
