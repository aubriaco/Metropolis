/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link } from "react-router-dom";
import { getLang } from "../shared/GLang";
import Globals from "../shared/Globals";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { qreq } from "../shared/qrequest";
import Cart from "../shared/Cart";
import BaseCom from "./BaseCom";
import Wishlist from "../shared/Wishlist";
import Auth from "../shared/Auth";
import L from "./Lang";
import Icon from "./Icon";
import { WebGlobal } from "../layouts/Web";

class Home extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            topProducts: [],
            featured: []
        };
    }

    componentDidMount() {
        WebGlobal.setSearchVisible(true);
        Auth.getLogin(u => {
            this.setState({ user: u });
        });
        qreq.post('/api/product/search', { featured: true }, j => {
            if (j.list)
                this.setState({ featured: j.list });
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
        qreq.get('/api/product/featured/top', j => {
            if (j.list)
                this.setState({ topProducts: j.list });
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    render() {
        return <>
            <div className="page-wrapper">
                <div className="page-content">
                    <section className="py-4 banner-cat-section bg-info bg-opacity-25">
                        <div className="container">
                            <h2 className="card p-2 p-md-3 shadow-none"><L>Welcome</L> {this.state.user ? this.state.user.name : <L>Guest</L>}</h2>
                            <div className="row g-4 align-items-center">
                                {this.state.topProducts.length > 0 ? <div className={'col-6' + (this.state.topProducts.length > 1 ? ' col-md-6 col-lg-3' : ' text-center')}>
                                    <div className="card rounded-0 shadow-none bg-opacity-25 p-2">
                                        <Link to={'/p/' + this.state.topProducts[0].ident}>
                                            <img src={Globals.imageUrl(this.state.topProducts[0].displayImageUrl)} className="img-fluid" alt="..." style={{ maxHeight: '250px' }} />
                                            <div>{this.state.topProducts[0].name}</div>
                                        </Link>
                                    </div>
                                </div> : ''}
                                {this.state.topProducts.length > 1 ? <div className={'col-6 col-md-6 col-lg-3'}>
                                    <div className="card rounded-0 shadow-none bg-opacity-25 p-2">
                                        <Link to={'/p/' + this.state.topProducts[1].ident}>
                                            <img src={Globals.imageUrl(this.state.topProducts[1].displayImageUrl)} className="img-fluid" alt="..." style={{ maxHeight: '250px' }} />
                                            <div>{this.state.topProducts[1].name}</div>
                                        </Link>
                                    </div>
                                </div> : ''}
                                <div className={'col-12 col-md-12 ' + (this.state.topProducts.length > 1 ? 'col-lg-6' : 'col-lg-12')}>
                                    <div className="card rounded-0 shadow-none bg-opacity-25 p-2 text-center">
                                        {this.state.user ? <>
                                            <img src="/img/home-signup-login-large.png" className="img-fluid mx-auto" style={{ maxHeight: '200px' }} alt="" />
                                            <h4><L>Quick links!</L></h4>
                                            <div className="d-flex gap-1">
                                                <Link to="/my" className="btn btn-success btn-lg col"><Icon icon="faUser" /> <L>My Account</L></Link>
                                                <Link to="/my/orders" className="btn btn-success btn-lg col"><Icon icon="faCartShopping" /> <L>My Orders</L></Link>
                                            </div>
                                        </> : <>
                                            <img src="/img/home-signup-login-large.png" className="img-fluid mx-auto" style={{ maxHeight: '200px' }} alt="" />
                                            <h4><L>Get the best out of Metropolis Market</L></h4>
                                            <div className="d-flex gap-1 pb-2" style={{ borderBottom: '1px solid #eee' }}>
                                                <Link to="/signup" className="btn btn-success btn-lg col"><Icon icon="faUserPlus" /> <L>Sign up</L></Link>
                                                <Link to="/login" className="btn btn-success btn-lg col"><Icon icon="faRightToBracket" /> <L>Login</L> <span className="d-none d-md-inline"><L>to my Account</L></span></Link>
                                            </div>
                                            <img src="/img/home-store-large.png" className="img-fluid mx-auto" style={{ maxHeight: '200px' }} alt="" />
                                            <h4><L>Are you a store owner looking to register for the grand opening?</L></h4>
                                            <div className="d-flex gap-1">
                                                <Link to="/vendor/signup" className="btn btn-success btn-lg col"><Icon icon="faStore" /> <L>Store Signup form</L></Link>
                                            </div>
                                        </>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {this.state.featured.length !== 0 ? <section className="py-4">
                        <div className="container">
                            <div className="separator pb-4">
                                <div className="line"></div>
                                <h5 className="mb-0 fw-bold separator-title">{getLang('FEATURED PRODUCTS')}</h5>
                                <div className="line"></div>
                            </div>
                            <div className="product-grid">
                                <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-4 row-cols-xxl-5 g-3 g-sm-4">
                                    {this.state.featured.map(a => <div key={a.id} className="col">
                                        <div className="card">
                                            <div className="position-relative overflow-hidden text-center bg-light" style={{ minHeight: '175px' }}>
                                                <div className="add-cart position-absolute top-0 end-0 mt-3 me-3">
                                                    <a role="button" onClick={() => Cart.add(a.id)}><i className="bx bxs-cart-add"></i></a>
                                                </div>
                                                <div className="quick-view position-absolute start-0 bottom-0 end-0">
                                                    <Link to={'/p/' + a.ident}>{getLang('View')}</Link>
                                                </div>
                                                <Link to={'/p/' + a.ident}>
                                                    <img src={Globals.imageUrl(a.displayImageUrl)} className="img-fluid" alt="..." style={{ maxHeight: '175px' }} />
                                                </Link>
                                            </div>
                                            <div className="card-body px-0">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="">
                                                        <p className="mb-1 product-short-name"><Link to={'/c/' + a.categoryIdent}>{a.categoryName}</Link></p>
                                                        <h6 className="mb-0 fw-bold product-short-title"><Link to={'/p/' + a.ident}>{a.name}</Link></h6>
                                                    </div>
                                                    <div className="icon-wishlist">
                                                        <span role="button" onClick={() => Wishlist.add(a.id)}><i className="bx bx-heart"></i></span>
                                                    </div>
                                                </div>
                                                <div className="cursor-pointer rating mt-2" ng-bind-html="a.ratingHTML"></div>
                                                <div className="product-price d-flex align-items-center justify-content-start gap-2 mt-2">
                                                    {a.comparePrice && a.price !== a.comparePrice ? <div className="h6 fw-light fw-bold text-secondary text-decoration-line-through">{Globals.formatter.format(a.comparePrice)}</div> : ''}
                                                    <div className="h6 fw-bold">{Globals.formatter.format(a.price)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>)}
                                </div>
                            </div>
                        </div>
                    </section> : ''}
                    <section className="py-5 bg-light">
                        <div className="container">
                            <div className="row row-cols-1 row-cols-md-1 row-cols-xl-2 g-3">
                                <div className="col">
                                    <div className="text-center border p-3 bg-white">
                                        <div className="font-50 text-dark">
                                            <i className="bx bx-cart"></i>
                                        </div>
                                        <h5 className="fs-5 text-uppercase mb-0 fw-bold">{getLang('Fast delivery')}</h5>
                                        <p className="text-capitalize">{getLang('Get what you need, when you need it')}</p>
                                        <p><L>Our stores are located locally in the island of Puerto Rico and some use our courier network.</L></p>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="text-center border p-3 bg-white">
                                        <div className="font-50 text-dark">
                                            <i className="bx bx-credit-card"></i>
                                        </div>
                                        <h5 className="fs-5 text-uppercase mb-0 fw-bold">{getLang('Secure payment')}</h5>
                                        <p className="text-capitalize"><L>Provided by our partner</L> <a href="https://stripe.com/customers" target="_blank">Stripe</a></p>
                                        <p><L>Our secure payment system guarantees the protection of your personal and financial information.</L></p>
                                    </div>
                                </div>
                                <div className="col d-none">
                                    <div className="text-center border p-3 bg-white">
                                        <div className="font-50 text-dark">
                                            <i className="bx bx-support"></i>
                                        </div>
                                        <h5 className="fs-5 text-uppercase mb-0 fw-bold">{getLang('Customer Support')}</h5>
                                        <p className="text-capitalize">{getLang('Friendly 24/7 customer support')}</p>
                                        <p><L>Our team of experts are available 24/7 to help you with any questions or concerns you may have.</L></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>;
    }
}

export default withParamsAndNavigate(Home);