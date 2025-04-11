/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Auth from "../shared/Auth";
import BaseCom from "./BaseCom";
import CheckoutSteps from "./CheckoutSteps";
import FormInput from "./FormInput";
import UserInfoModal from "./UserInfoModal";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import countries from '../dicts/countries.json';
import statesUsa from '../dicts/states-usa.json';
import { Link } from 'react-router-dom';
import Cart from "../shared/Cart";
import Globals from "../shared/Globals";
import SubHeader from "./SubHeader";
import { qreq } from "../shared/qrequest";
import LoadingAlert from "./LoadingAlert";
import AppStickyBottom from "./AppStickyBottom";

class CheckoutInfo extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            cart: {
                list: Cart.list ?? [],
                total: 0
            },
            subTotal: Cart.subTotal,
            totalTax: Cart.totalTax,
            totalShipping: Cart.totalShipping,
            totalDiscount: Cart.totalDiscount,
            totalNoShipping: Cart.totalNoShipping,
            total: Cart.total,
            shipping: {},
            billing: {}
        };
        this.tick = this.tick.bind(this);
        this.loadOrder = this.loadOrder.bind(this);
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if (!u)
                this.props.navigate('/login');
            this.setState({ user: u, shipping: { ...u, ...u.address }, billing: { ...u, ...u.address } });

            qreq.get('/api/cart/step', j => {
                if (j.item) {
                    if (j.item < 2)
                        this.props.navigate('/checkout/' + j.item);
                    else
                        this.loadOrder();
                }
                else
                    this.alert(j.errorMessage);
            }, this.unkownErrorCallback);


        });
        this.interval = setInterval(this.tick, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    tick() {
        if (this.state.cart.list !== Cart.list)
            this.setState({ cart: { ...this.state.cart, list: Cart.list } });
        if (this.state.subTotal !== Cart.subTotal)
            this.setState({ subTotal: Cart.subTotal });
        if (this.state.totalTax !== Cart.totalTax)
            this.setState({ totalTax: Cart.totalTax });
        if (this.state.totalDiscount !== Cart.totalDiscount)
            this.setState({ totalDiscount: Cart.totalDiscount });
        if(this.state.totalNoShipping !== Cart.totalNoShipping)
            this.setState({ totalNoShipping: Cart.totalNoShipping });
        if (this.state.total !== Cart.total)
            this.setState({ total: Cart.total });
    }

    loadOrder() {
        qreq.get('/api/cart/order', j => {
            if (j.item)
                this.setState({ order: j.item, shipping: { ...j.item.shippingAddress }, billing: { ...j.item.billingAddress } });
            else if (j.errorCode !== 2)
                this.alert(j.errorMessage);
            this.setState({ loaded: true });
        }, this.unkownErrorCallback);
    }

    submit(e) {
        if (e) e.preventDefault();
        qreq.post('/api/cart/step/2', { shippingAddress: { ...this.state.shipping }, billingAddress: { ...this.state.billing } }, j => {
            if (j.errorCode === 0)
                this.props.navigate('/checkout/3');
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    render() {
        return <>
            <UserInfoModal show={this.state.showUserInfoModal} onToggle={() => { this.setState({ showUserInfoModal: false }); if (this.props.onToggle) this.props.onToggle(); }} onSuccess={() => { this.setState({ showUserInfoModal: false }); this.reload(); }} />

            <div className="page-wrapper">
                <div className="page-content">
                    <SubHeader title="Checkout" />
                    {this.state.loaded ?
                        <section className="py-4">
                            <div className="container">
                                <div className="shop-cart">
                                    <div className="row">
                                        <div className="col-12 col-xl-8">
                                            <div className="checkout-details">
                                                <CheckoutSteps step={2} />
                                                <div className="card rounded-0">
                                                    <div className="card-body">
                                                        <div className="d-flex align-items-center mb-3">
                                                            <div className="">
                                                                <img src="/img/profile-default.svg" width="90" alt="" className="rounded-circle p-1 border" />
                                                            </div>
                                                            <div className="ms-2">
                                                                <h6 className="mb-0">{this.state.user.name}</h6>
                                                                <p className="mb-0">{this.state.user.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="border p-3">
                                                            <h2 className="h5 mb-0">Shipping Address</h2>
                                                            <div className="my-3 border-bottom"></div>
                                                            <div className="form-body">
                                                                <form className="row g-3" onSubmit={this.submit}>
                                                                    <div className="col-md-6">
                                                                        <FormInput model={this.state.shipping} name="firstName" type="text" label="First Name" required />
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <FormInput model={this.state.shipping} name="lastName" type="text" label="Last Name" required />
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <FormInput model={this.state.shipping} name="email" type="text" label="Email" />
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <FormInput model={this.state.shipping} name="phone" type="text" label="Phone" required />
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <FormInput model={this.state.shipping} name="line1" type="text" label="Address Line 1" required />
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <FormInput model={this.state.shipping} name="line2" type="text" label="Address Line 2" />
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <FormInput model={this.state.shipping} name="city" type="text" label="City" required />
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <FormInput model={this.state.shipping} name="state" type="select" label="State/Province" options={statesUsa.list} required />
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <FormInput model={this.state.shipping} name="postalCode" type="text" label="Postal Code" required />
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <FormInput model={this.state.shipping} name="country" type="select" label="Country" options={countries.list} required />
                                                                    </div>

                                                                    <div className="col-md-12">
                                                                        <h6 className="mb-0 h5">Billing Address</h6>
                                                                        <div className="my-3 border-bottom"></div>
                                                                        <div className="form-check">
                                                                            <input className="form-check-input" type="checkbox" id="gridCheck" checked={this.state.billing.sameAsShipping} onChange={e => this.setState({ billing: { ...this.state.billing, sameAsShipping: e.target.checked } })} />
                                                                            <label className="form-check-label">Same as shipping address</label>
                                                                        </div>
                                                                    </div>

                                                                    {!this.state.billing.sameAsShipping ? <><div className="col-md-6">
                                                                        <FormInput model={this.state.billing} name="firstName" type="text" label="First Name" required />
                                                                    </div>
                                                                        <div className="col-md-6">
                                                                            <FormInput model={this.state.billing} name="lastName" type="text" label="Last Name" required />
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <FormInput model={this.state.billing} name="email" type="text" label="Email" />
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <FormInput model={this.state.billing} name="phone" type="text" label="Phone" required />
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <FormInput model={this.state.billing} name="line1" type="text" label="Address Line 1" required />
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <FormInput model={this.state.billing} name="line2" type="text" label="Address Line 2" />
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <FormInput model={this.state.billing} name="city" type="text" label="City" required />
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <FormInput model={this.state.billing} name="state" type="select" label="State/Province" options={statesUsa.list} required />
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <FormInput model={this.state.billing} name="postalCode" type="text" label="Postal Code" required />
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <FormInput model={this.state.billing} name="country" type="select" label="Country" options={countries.list} required />
                                                                        </div>
                                                                    </> : ''}

                                                                    <AppStickyBottom>
                                                                        <Link to="/cart" role="button" className="btn btn-light btn-ecomm"><i className="bx bx-chevron-left"></i>Back to Cart</Link>
                                                                        <button type="submit" className="btn btn-dark btn-ecomm">Proceed to Delivery<i className="bx bx-chevron-right"></i></button>
                                                                    </AppStickyBottom>

                                                                </form>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-xl-4">
                                            <div className="order-summary">
                                                <div className="card rounded-0">
                                                    <div className="card-body">
                                                        <div className="card rounded-0 border bg-transparent shadow-none">
                                                            <div className="card-body">
                                                                <p className="fs-5">Order summary</p>
                                                                {this.state.cart.list.map(i => <div key={i.id}><div className="my-3 border-top"></div>
                                                                    <div className="d-flex align-items-center">
                                                                        <Link to={'/p/' + i.ident} className="d-block flex-shrink-0">
                                                                            <img src={Globals.imageUrl(i.displayImageUrl ?? '/img/noimage.png')} width="75" alt="Product" />
                                                                        </Link>
                                                                        <div className="ps-2">
                                                                            <h6 className="mb-1"><Link to={'/p/' + i.ident} className="text-dark">{i.name}</Link></h6>
                                                                            <div className="widget-product-meta"><span className="me-2">{Globals.formatter.format(i.price)}</span><span className="">x {i.cart.quantity}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div></div>)}
                                                            </div>
                                                        </div>
                                                        <div className="card rounded-0 border bg-transparent mb-0 shadow-none">
                                                            <div className="card-body">
                                                                <p className="mb-2">Subtotal: <span className="float-end">{Globals.formatter.format(this.state.subTotal)}</span>
                                                                </p>
                                                                <p className="mb-2">Taxes: <span className="float-end">{Globals.formatter.format(this.state.totalTax)}</span>
                                                                </p>
                                                                {this.state.totalDiscount ? <p className="mb-0">Discount: <span className="float-end">{Globals.formatter.format(this.state.totalDiscount)}</span>
                                                                </p> : ''}
                                                                <div className="my-3 border-top"></div>
                                                                <h5 className="mb-0">Order Total: <span className="float-end">{Globals.formatter.format(this.state.totalNoShipping)}</span></h5>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section> : <LoadingAlert />}
                </div>
            </div>
        </>;
    }
}

export default withParamsAndNavigate(CheckoutInfo);