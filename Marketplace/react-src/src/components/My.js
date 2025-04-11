/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link } from "react-router-dom";
import BaseCom from "./BaseCom";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import "./My.css";
import NativeNav from "./NativeNav";
import Globals from "../shared/Globals";
import L from "./Lang";
import Auth from "../shared/Auth";
import LoadingAlert from "./LoadingAlert";
import Card from "./Card";
import Icon from "./Icon";
import SubHeader from "./SubHeader";
import { WebGlobal } from "../layouts/Web";

class My extends BaseCom {

    async componentDidMount() {
        WebGlobal.setSearchVisible(false);
        await this.requireLoginAsync();
        await this.pullVendors();
    }

    pullVendors = async () => {
        await this.fillListAsync('/api/vendor/list', 'vendors');
    }

    render() {

        if (!this.state.loaded)
            return <LoadingAlert />

        return <div className="page-wrapper">
            <div className="page-content">
                <div className="My">
                    <SubHeader title="My Account" />
                    <NativeNav show={Globals.mobileView} noBack />
                    <div className="container">
                        {this.state.user ? <Card title="My Account">
                            <ul className="list-group">
                                {this.state.user?.isAdmin ? <li className="list-group-item">
                                    <Link to="/admin"><Icon icon="faScrewdriverWrench" className="me-2" />
                                        <L>Administration</L></Link>
                                </li> : ''}
                                <li className="list-group-item">
                                    <Link to="/my/orders">
                                        <Icon icon="faCartShopping" className="me-2" />
                                        <L>My Orders</L>
                                    </Link>
                                </li>
                                <li className="list-group-item">
                                    <Link to="/my/wishlist">
                                        <Icon icon="faHeart" className="me-2" />
                                        <L>My Wishlist</L>
                                    </Link>
                                </li>
                                {this.state.user?.isVendor && this.state.vendors?.length > 0 ? <li className="list-group-item">
                                    <Link to="/my/stores">
                                        <Icon icon="faShop" className="me-2" />
                                        
                                            {this.state.vendors?.length === 1 ? <L>My Store</L> : <L>My Stores</L>}
                                        
                                        </Link>
                                </li> : ''}
                                <li className="list-group-item">
                                    <Link to="/my/profile"><Icon icon="faUser" className="me-2" />
                                        <L>My Profile</L></Link>
                                </li>
                                <li className="list-group-item">
                                    <Link to="/my/wallet"><Icon icon="faCreditCard" className="me-2" /><L>Payment Methods</L></Link>
                                </li>
                                <li className="list-group-item">
                                    <Link to="/about"><Icon icon="faCircleInfo" className="me-2" /><L>About Us</L></Link>
                                </li>
                                <li className="list-group-item">
                                    <Link to="/contact"><Icon icon="faCircleInfo" className="me-2" /><L>Help &amp; Support</L></Link>
                                </li>
                                <li className="list-group-item">
                                    <Link to="/blog"><Icon icon="faBlog" className="me-2" /><L>Blog</L></Link>
                                </li>
                                <li className="list-group-item">
                                    <Link to="/logout"><Icon icon="faRightFromBracket" className="me-2" /><L>Logout</L></Link>
                                </li>
                            </ul>
                        </Card> : <Card title="Menu">
                            <ul className="list-group">
                                <li className="list-group-item">
                                    <Link to="/login"><Icon icon="faRightToBracket" className="me-2" /><L>Login</L></Link>
                                </li>
                                <li className="list-group-item">
                                    <Link to="/signup"><Icon icon="faUserPlus" className="me-2" /><L>Create an Account</L></Link>
                                </li>
                                <li className="list-group-item">
                                    <Link to="/about"><Icon icon="faCircleInfo" className="me-2" /><L>About Us</L></Link>
                                </li>
                                <li className="list-group-item">
                                    <Link to="/contact"><Icon icon="faCircleInfo" className="me-2" /><L>Help &amp; Support</L></Link>
                                </li>
                                <li className="list-group-item">
                                    <Link to="/blog"><Icon icon="faBlog" className="me-2" /><L>Blog</L></Link>
                                </li>
                            </ul>
                        </Card>}
                        {!this.state.user?.isVendor ? <Card title="Bring your business online!">
                            <p>Do you wish to sell your products on Metropolis? Click the button below to begin!</p>
                            <div className="mt-3">
                                <Link to="/my/stores/new" className="btn btn-primary btn-lg">Sell Now in Metropolis</Link>
                            </div>
                        </Card> : ''}
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(My);