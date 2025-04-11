/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link, NavLink } from "react-router-dom";
import Auth from "../shared/Auth";
import BaseCom from "./BaseCom";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import './MobileNav.css';

class MobileNav extends BaseCom {
    componentDidMount() {
        Auth.getLogin(u => {
            this.setState({ user: u });
        });
    }

    render() {
        if (this.props.isAdmin)
            return <nav className="nav-mobile">
                <NavLink to="/admin/vendors" className="nav-mobile-item">
                    <i className="bx bx-store"></i>
                    <span>Vendors</span>
                </NavLink>
                <NavLink to="/admin/blog" className="nav-mobile-item">
                    <i className="bx bx-news"></i>
                    <span>Blog</span>
                </NavLink>
                <NavLink to="/" className="nav-mobile-item" end>
                    <i className="bx bx-exit"></i>
                    <span>Exit Admin</span>
                </NavLink>
            </nav>;
        return <nav className="nav-mobile">
            <NavLink to="/" className="nav-mobile-item">
                <i className="bx bx-home"></i>
                <span>Home</span>
            </NavLink>
            <NavLink to="/categories" className="nav-mobile-item d-none">
                <i className="bx bx-store"></i>
                <span>Shop</span>
            </NavLink>
            <NavLink to="/my/orders" className="nav-mobile-item">
                <i className="bx bx-package"></i>
                <span>Orders</span>
            </NavLink>
            <NavLink to="/cart" className="nav-mobile-item">
                <i className="bx bx-cart"></i>
                <span>Cart</span>
            </NavLink>
            <NavLink to="/my" className="nav-mobile-item">
                <i className="bx bx-menu"></i>
                <span>Menu</span>
            </NavLink>
        </nav>;
    }
}

export default withParamsAndNavigate(MobileNav);