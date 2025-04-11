/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Auth from "../shared/Auth";
import Cart from "../shared/Cart";
import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import FormInput from "./FormInput";
import L from "./Lang";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Link } from 'react-router-dom';
import CheckoutSteps from "./CheckoutSteps";
import LoadingAlert from "./LoadingAlert";
import Alert from "./Alert";
import AppStickyBottom from "./AppStickyBottom";

class Checkout extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            cart: {
                list: Cart.list ?? [],
                total: 0
            },
            subTotal: Cart.subTotal,
            totalTax: Cart.totalTax,
            totalDiscount: Cart.totalDiscount,
            totalNoShipping: Cart.totalNoShipping,
            total: Cart.total,
            discount: {},
            shipping: {},
            changing: false
        };
        this.tick = this.tick.bind(this);
        this.quantityChange = this.quantityChange.bind(this);
        this.updateCart = this.updateCart.bind(this);
        this.removeFromCart = this.removeFromCart.bind(this);
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if (!u)
                this.props.navigate('/login');
            this.setState({ user: u, loaded: true });
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

    quantityChange(a, v) {
        var num = Number(v);
        if (num === 0) {
            a.cart.quantity = 1;
            if (window.confirm('Do you want to remove this item from the cart?')) {
                this.removeFromCart(a);
            }
            return;
        }
        a.cart.quantity = num;
        this.updateCart(a);
    }

    removeFromCart(item) {
        this.setState({ changing: true });
        qreq.post('/api/cart/remove', item.cart, j => {
            if (j.errorCode) {
                this.alert(j.errorMessage);
                this.setState({ changing: false });
            }
            else {
                Cart.refresh((list, total) => {
                    this.setState({ cart: { ...this.state.cart, list: list } });
                    this.setState({ changing: false });
                });
            }
        }, () => {
            this.setState({ changing: false });
            this.unkownErrorCallback();
        });
    }

    updateCart(item) {
        this.setState({ changing: true });
        qreq.post('/api/cart/update', item.cart, j => {
            if (j.errorCode) {
                this.alert(j.errorMessage);
                this.setState({ changing: false });
            }
            else {
                Cart.refresh((list, total) => {
                    this.setState({ cart: { ...this.state.cart, list: list } });
                    this.setState({ changing: false });
                });
            }
        }, () => {
            this.setState({ changing: false });
            this.unkownErrorCallback();
        });
    }

    submit(e) {
        if (e) e.preventDefault();
        qreq.post('/api/cart/step/1', {}, j => {
            if (j.errorCode === 0)
                this.props.navigate('/checkout/2');
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    render() {
        return <>
            <div className="page-wrapper">
                <div className="page-content">
                    <SubHeader title="Checkout" />
                    {this.state.user ? <section className="py-4">
                        <form onSubmit={this.submit}>
                        <div className="container">
                            <div className="shop-cart">
                                <div className="row">
                                    <div className="col-12 col-xl-8">
                                        <div className="checkout-review">
                                            <CheckoutSteps step={1} />
                                            <div className="card  rounded-0 shadow-none mb-3 border">
                                                <div className="card-body">
                                                    <h5 className="mb-0"> <L>Review Your Order</L> </h5>
                                                    <div className="my-3 border-bottom"></div>
                                                    {!this.state.loaded ? <LoadingAlert /> : this.state.cart.list.length === 0 ? <Alert type="warning"><L>There are no items in your shopping cart.</L></Alert> : this.state.cart.list.map(a =>
                                                        <div key={a.id + '-' + a.idx}>
                                                            <div className="row align-items-center g-3">
                                                                <div className="col-12 col-lg-6">
                                                                    <div className="d-lg-flex align-items-center gap-3">
                                                                        <div className="cart-img text-center text-lg-start bg-light" style={{minWidth: '200px'}}>
                                                                            <Link to={'/p/' + a.ident}>
                                                                                <img src={Globals.imageUrl(a.displayImageUrl)} alt="" style={{ maxHeight: '100px', maxWidth: '200px', display: 'block', margin: '0 auto' }} />
                                                                            </Link>
                                                                        </div>
                                                                        <div className="cart-detail text-center text-lg-start">
                                                                            <h6 className="mb-2"><Link to={'/p/' + a.ident}>{a.name}</Link></h6>
                                                                            <h5 className="mb-0">{Globals.formatter.format(a.cart.totalPrice)}</h5>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-6 col-lg-3">
                                                                    <div className="cart-action text-center">
                                                                        <FormInput model={a.cart} name="quantity" type="number" className="rounded-0" min="1" step="1" preAddon={<L>Quantity</L>} onChange={v => this.quantityChange(a,v)} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-6 col-lg-3">
                                                                    <div className="text-left">
                                                                        <div className="d-flex gap-2 justify-content-lg-end">
                                                                            <button type="button" onClick={() => this.removeFromCart(a)} className="btn btn-light rounded-0 btn-ecomm"><i className="bx bx-x-circle me-0"></i> <L>Remove</L> </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="my-4 border-top"></div>
                                                        </div>)}
                                                </div>
                                            </div>
                                            <div className="card rounded-0 shadow-none mb-3 border">
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="shipping-aadress">
                                                                <h5 className="mb-3"> <L>Shipping to:</L> </h5>
                                                                <p className="mb-1"><span className="text-dark"> <L>Customer:</L> </span> {this.state.user.name}</p>
                                                                <p className="mb-1"><span className="text-dark"> <L>Address:</L> </span> {this.state.user.address.line1} {this.state.user.address.line2} {this.state.user.address.city} {this.state.user.address.state} {this.state.user.address.country} {this.state.user.address.postalCode}</p>
                                                                <p className="mb-1"><span className="text-dark"> <L>Phone:</L> </span> {Globals.formatPhone(this.state.user.phone)} </p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="payment-mode">
                                                                <h5 className="mb-3"> <L>Payment Mode:</L> </h5>
                                                                <img src="/assets/images/icons/visa.png" height="50" className="p-2 border bg-light rounded d-inline-block me-1" alt="" />
                                                                <img src="/assets/images/icons/mastercard.png" height="50" className="p-2 border bg-light rounded d-inline-block me-1" alt="" />
                                                                <img src="/assets/images/icons/american-express.png" height="50" className="p-2 border bg-light rounded d-inline-block me-1" alt="" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="checkout-form p-3 bg-light">
                                            { /*
                                            <div className="card rounded-0 border bg-transparent shadow-none">
                                                <div className="card-body">
                                                    <p className="fs-5"> <L>Apply Discount Code</L> </p>
                                                    <div className="my-3 border-top"></div>
                                                        <FormInput model={this.state.discount} name="code" type="text" label="Enter discount code" labelAsPlaceholder />
                                                        <button className="btn btn-dark btn-ecomm" type="button"> <L>Apply</L> </button>
                                                </div>
                                            </div>
                                            <div className="card rounded-0 border bg-transparent shadow-none">
                                                <div className="card-body">
                                                    <p className="fs-5"> <L>Estimate Shipping and Tax</L> </p>
                                                    <div className="my-3 border-top"></div>
                                                    <div className="mb-3">
                                                        <label className="form-label"> <L>Country Name</L> </label>
                                                        <FormInput model={this.state.shipping} name="country" type="select" label="Select" labelAsPlaceholder options={countries.list} />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label"> <L>State/Province</L> </label>
                                                        <FormInput model={this.state.shipping} name="state" type="select" label="Select" labelAsPlaceholder options={statesUsa.list} />
                                                    </div>
                                                    <div className="mb-0">
                                                        <label className="form-label"> <L>Zip/Postal Code</L> </label>
                                                        <FormInput model={this.state.shipping} name="postalCode" type="text" label="00000" labelAsPlaceholder />
                                                    </div>
                                                </div>
                                            </div>
                                            */
                                            }
                                            <div className="card rounded-0 border bg-transparent mb-0 shadow-none">
                                                <div className="card-body">
                                                    <p className="mb-2"> <L>Subtotal:</L> <span className="float-end">{Globals.formatter.format(this.state.subTotal)}</span>
                                                    </p>
                                                    <p className="mb-2"> <L>Taxes:</L> <span className="float-end"> <L>{Globals.formatter.format(this.state.totalTax)}</L> </span>
                                                    </p>
                                                    {this.state.totalDiscount ? <p className="mb-0"> <L>Discount:</L> <span className="float-end"> <L>{Globals.formatter.format(this.state.totalDiscount)}</L> </span>
                                                    </p> : ''}
                                                    <div className="my-3 border-top"></div>
                                                    <h5 className="mb-0"> <L>Order Total:</L> <span className="float-end">{Globals.formatter.format(this.state.totalNoShipping)}</span></h5>
                                                    <div className="my-4"></div>
                                                    <AppStickyBottom>
                                                        <button type="button" className="btn btn-secondary d-block d-md-none" onClick={this.goBack}>Cancel</button>
                                                        <button type="submit" disabled={this.state.changing || this.state.cart.list.length === 0} className="btn btn-dark btn-ecomm"> <L>Proceed to Checkout</L> </button>
                                                    </AppStickyBottom>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        </form>
                    </section> : ''}
                </div>
            </div>
        </>;
    }
}

export default withParamsAndNavigate(Checkout);