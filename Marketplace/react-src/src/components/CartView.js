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
import { WebGlobal } from "../layouts/Web";
import Icon from "./Icon";

class CartView extends BaseCom {
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
        this.quantityChange = this.quantityChange.bind(this);
        this.updateCart = this.updateCart.bind(this);
        this.removeFromCart = this.removeFromCart.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if (!u)
                this.props.navigate('/login');
            this.setState({ user: u, loaded: true });
        });
        WebGlobal.setSearchVisible(false);
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


    render() {
        return <>
            <div className="page-wrapper">
                <div className="page-content">
                    <SubHeader title="Cart" />
                    {this.state.user ? <section className="py-4">
                        <form onSubmit={this.submit}>
                        <div className="container">
                            <div className="shop-cart">
                                <div className="row">
                                    <div className="col-12 col-xl-8">
                                        <div className="checkout-review">
                                            <div className="card  rounded-0 shadow-none mb-3 border">
                                                <div className="card-body">
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
                                        </div>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="checkout-form p-3 bg-light">
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
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {this.state.cart?.list?.length ? <div className="app-sticky-above-bottom">
                                <Link to="/checkout/2" role="button" className="btn btn-dark rounded-0 btn-ecomm btn-lg"><Icon icon="faCartShopping" /> <L>Proceed to Checkout</L> </Link>
                            </div> : ''}
                        </div>
                        </form>
                    </section> : ''}
                </div>
            </div>
        </>;
    }
}

export default withParamsAndNavigate(CartView);