/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import * as React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Web from './layouts/Web';
import NotFound from './pages/errors/NotFound';
import Globals from './shared/Globals';
import Loader from "./components/Loader";
import ConnError from "./pages/errors/ConnError";
import { qreq } from "./shared/qrequest";
import Login from './components/Login';
import Signup from './components/Signup';
import { ToastContainer } from 'react-toastify';
import Validate from './components/Validate';
import My from './components/My';
import MyProfile from './components/MyProfile';
import WalletPage from './components/WalletPage';
import Logout from './components/Logout';
import MyStores from './components/MyStores';
import MyStoresNew from './components/MyStoresNew';
import MyStoresDashboard from './components/MyStoresDashboard';
import MyStoresProducts from './components/MyStoresProducts';
import MyStoresOrders from './components/MyStoresOrders';
import MyStoresProductsEdit from './components/MyStoresProductsEdit';
import Home from './components/Home';
import MyStoresServices from './components/MyStoresServices';
import MyStoresServicesEdit from './components/MyStoresServicesEdit';
import MyStoresSettings from './components/MyStoresSettings';
import ProductList from './components/ProductList';
import Store from './components/Store';
import Product from './components/Product';
import Checkout from './components/Checkout';
import MyStoresPayouts from './components/MyStoresPayouts';
import CheckoutInfo from './components/CheckoutInfo';
import CheckoutPayment from './components/CheckoutPayment';
import CheckoutComplete from './components/CheckoutComplete';
import MyOrders from './components/MyOrders';
import MyOrdersView from './components/MyOrdersView';
import MyStoresOrdersView from './components/MyStoresOrdersView';
import MyWishlist from './components/MyWishlist';
import MyStoresOrdersPackage from './components/MyStoresOrdersPackage';
import MyStoresOrdersConfirm from './components/MyStoresOrdersConfirm';
import { getCurrentLangItem, loadLang, pullCurrentLang, setCurrentLang } from './shared/GLang';
import MyStoresUsers from './components/MyStoresUsers';
import CheckoutShipping from './components/CheckoutShipping';
import AdminVendors from './components/admin/AdminVendors';
import About from './components/About';
import Contact from './components/Contact';
import ForgotPassword from './components/ForgotPassword';
import SetPassword from './components/SetPassword';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import AdminBlog from './components/admin/AdminBlog';
import AdminBlogEdit from './components/admin/AdminBlogEdit';
import TOS from './components/TOS';
import PrivacyPolicy from './components/PrivacyPolicy';
import ReturnPolicy from './components/ReturnPolicy';
import CookiePolicy from './components/CookiePolicy';
import AcceptableUsePolicy from './components/AcceptableUsePolicy';
import VendorSignup from './components/VendorSignup';
import DigitalMarketing from './components/DigitalMarketing';
import Session from './components/Session';
import MyStoresMenu from './components/MyStoresMenu';
import AdminVendorsView from './components/admin/AdminVendorsView';
import Admin from './components/admin/Admin';
import CartView from './components/CartView';

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            loaded: false,
            connectionError: false,
            lang: getCurrentLangItem(),
            menuVisibility: true,
            lang: 'en'
        };
        this.setUser = this.setUser.bind(this);
        this.setLang = this.setLang.bind(this);
    }

    componentDidMount() {
        Globals.loadEnv(j => {
            this.setState({ connectionError: false, loaded: true });
            loadLang(() => {
                pullCurrentLang(() => {
                    this.setState({ lang: getCurrentLangItem() });
                });
            });
        });
    }

    setUser(user) {
        Globals.set('user', user);
        this.setState({ user: user, loaded: true });
    }

    setLang(item) {
        setCurrentLang(item, true);
        this.setState({ lang: item });
    }

    render() {
        if (this.state.connectionError)
            return (<ConnError />);
        if (!this.state.loaded)
            return <Loader />
        return (<>
            <ToastContainer position="top-center"
                autoClose={1000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light" />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Web setLang={this.setLang} />}>
                        <Route index path="/" element={<Home />} />
                        <Route path="/index" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:ident" element={<BlogPost />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/logout" element={<Logout />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/vendor/signup" element={<VendorSignup />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:code" element={<SetPassword />} />
                        <Route path="/cart" element={<CartView />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/checkout/1" element={<Checkout />} />
                        <Route path="/checkout/2" element={<CheckoutInfo />} />
                        <Route path="/checkout/3" element={<CheckoutShipping />} />
                        <Route path="/checkout/4" element={<CheckoutPayment />} />
                        <Route path="/checkout/4/:orderMID" element={<CheckoutComplete />} />
                        <Route path="/v/:vendorMID" element={<Store />} />
                        <Route path="/v/:vendorMID/:productMID" element={<Product />} />
                        <Route path="/p/:productMID" element={<Product />} />
                        <Route path="/c/:categoryIdent" element={<ProductList />} />
                        <Route path="/s/:terms" element={<ProductList />} />
                        <Route path="/my/verify-email/:code" element={<Validate />} />
                        <Route path="/my" element={<My />} />
                        <Route path="/my/profile" element={<MyProfile />} />
                        <Route path="/my/orders" element={<MyOrders />} />
                        <Route path="/my/orders/:orderMID" element={<MyOrdersView />} />
                        <Route path="/my/wishlist" element={<MyWishlist />} />
                        <Route path="/my/wallet" element={<WalletPage />} />
                        <Route path="/my/stores" element={<MyStores />} />
                        <Route path="/my/stores/new" element={<MyStoresNew />} />
                        <Route path="/my/stores/manage/:vendorMID" element={<MyStoresDashboard />} />
                        <Route path="/my/stores/manage/:vendorMID/menu" element={<MyStoresMenu />} />
                        <Route path="/my/stores/manage/:vendorMID/dashboard" element={<MyStoresDashboard />} />
                        <Route path="/my/stores/manage/:vendorMID/orders" element={<MyStoresOrders />} />
                        <Route path="/my/stores/manage/:vendorMID/orders/:orderMID" element={<MyStoresOrdersView />} />
                        <Route path="/my/stores/manage/:vendorMID/orders/:orderMID/confirm" element={<MyStoresOrdersConfirm />} />
                        <Route path="/my/stores/manage/:vendorMID/orders/:orderMID/package" element={<MyStoresOrdersPackage />} />
                        <Route path="/my/stores/manage/:vendorMID/products" element={<MyStoresProducts />} />
                        <Route path="/my/stores/manage/:vendorMID/products/:productMID" element={<MyStoresProductsEdit />} />
                        <Route path="/my/stores/manage/:vendorMID/services" element={<MyStoresServices />} />
                        <Route path="/my/stores/manage/:vendorMID/services/:serviceMID" element={<MyStoresServicesEdit />} />
                        <Route path="/my/stores/manage/:vendorMID/payouts" element={<MyStoresPayouts />} />
                        <Route path="/my/stores/manage/:vendorMID/settings" element={<MyStoresSettings />} />
                        <Route path="/my/stores/manage/:vendorMID/managers" element={<MyStoresUsers />} />

                        <Route path="/digitalmarketing" element={<DigitalMarketing />} />

                        <Route path="/session/:sessionID" element={<Session />} />

                        <Route path="/admin" element={<Admin />} />
                        <Route path="/admin/vendors" element={<AdminVendors />} />
                        <Route path="/admin/vendors/view/:vendorMID" element={<AdminVendorsView />} />
                        <Route path="/admin/blog" element={<AdminBlog />} />
                        <Route path="/admin/blog/new" element={<AdminBlogEdit />} />
                        <Route path="/admin/blog/edit/:blogPostMID" element={<AdminBlogEdit />} />

                        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/termsofservice" element={<TOS />} />
                        <Route path="/terms-of-service" element={<TOS />} />
                        <Route path="/returnpolicy" element={<ReturnPolicy />} />
                        <Route path="/return-policy" element={<ReturnPolicy />} />
                        <Route path="/cookiepolicy" element={<CookiePolicy />} />
                        <Route path="/cookie-policy" element={<CookiePolicy />} />
                        <Route path="/acceptableusepolicy" element={<AcceptableUsePolicy />} />
                        <Route path="/acceptable-use-policy" element={<AcceptableUsePolicy />} />

                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </BrowserRouter></>);
    }
}
