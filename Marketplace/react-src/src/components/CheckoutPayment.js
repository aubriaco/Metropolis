/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Auth from "../shared/Auth";
import Cart from "../shared/Cart";
import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import AppStickyBottom from "./AppStickyBottom";
import BaseCom from "./BaseCom";
import CheckoutSteps from "./CheckoutSteps";
import RegisterCard from "./RegisterCard";
import SubHeader from "./SubHeader";
import Wallet from "./Wallet";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Link } from "react-router-dom";

class CheckoutPayment extends BaseCom {
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
            total: Cart.total,
            paymentMethodList: [],
            selectedPaymentMethod: null
        };
        this.tick = this.tick.bind(this);
        this.loadOrder = this.loadOrder.bind(this);
        this.loadPaymentMethods = this.loadPaymentMethods.bind(this);
        this.selectPaymentMethod = this.selectPaymentMethod.bind(this);
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if (!u)
                this.props.navigate('/login');
            this.setState({ user: u });

            qreq.get('/api/cart/step', j => {
                if (j.item) {
                    if (j.item < 4) {
                        if(this.state.cart.list.length === 0)
                            this.props.navigate('/my/orders');
                        else
                            this.props.navigate('/checkout/' + j.item);
                    }
                    else
                        this.loadOrder();
                }
                else
                    this.alert(j.errorMessage);
            }, this.unkownErrorCallback);

            this.loadPaymentMethods();


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
        if (this.state.total !== Cart.total)
            this.setState({ total: Cart.total });
    }

    loadOrder() {
        qreq.get('/api/cart/order', j => {
            if (j.item)
                this.setState({ order: j.item });
            else if (j.errorCode !== 2)
                this.alert(j.errorMessage);
            this.setState({ loaded: true });
        }, this.unkownErrorCallback);
    }

    loadPaymentMethods() {
        qreq.get('/api/payment/card/list', j => {
            if (j.list)
                this.setState({ paymentMethodList: j.list });
            else if (j.errorCode)
                this.alert(j.errorMessage);
        });
    }

    selectPaymentMethod(item) {
        this.setState({ selectedPaymentMethod: { ...item } })
    }

    submit(e) {
        if (e) e.preventDefault();
        if (!this.state.selectedPaymentMethod)
            return;
        this.setState({ submitting: true });
        qreq.post('/api/payment/order', { paymentMethodID: this.state.selectedPaymentMethod.id }, j => {
            if (j.errorCode)
                this.alert(j.errorMessage);
            else
                this.props.navigate('/checkout/4/' + j.item.masterID);
            this.setState({ submitting: false });
        }, () => {
            this.unkownErrorCallback();
            this.setState({ submitting: false });
        });
    }

    render() {
        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title="Checkout" />
                <section className="py-4">
                    <div className="container">
                        <div className="shop-cart">
                            <div className="row">
                                <div className="col-12 col-xl-8">
                                    <div className="checkout-payment">
                                        <CheckoutSteps step={4} />
                                        <div className="card rounded-0 shadow-none border">
                                            <div className="card-header border-bottom">
                                                <h2 className="h5 my-2">Choose Payment Method</h2>
                                            </div>
                                            <div className="card-body">
                                                <ul className="nav nav-pills mb-3 border p-3 d-none" role="tablist">
                                                    <li className="nav-item" role="presentation">
                                                        <span className="nav-link active rounded-0" data-bs-toggle="pill" role="tab" aria-selected="true">
                                                            <div className="d-flex align-items-center">
                                                                <div className="tab-icon"><i className="bx bx-credit-card font-18 me-1"></i>
                                                                </div>
                                                                <div className="tab-title">Credit Card</div>
                                                            </div>
                                                        </span>
                                                    </li>
                                                </ul>
                                                <div className="tab-content" id="pills-tabContent">
                                                    <div className="tab-pane fade show active" id="credit-card" role="tabpanel">
                                                        <div className="p-3 border">
                                                            {this.state.paymentMethodList.length === 0 ? <RegisterCard onSuccess={() => this.loadPaymentMethods()} /> : <Wallet onSelect={this.selectPaymentMethod} />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <form onSubmit={this.submit}>

                                            <div className="card rounded-0 shadow-none border">
                                                <div className="card-body">
                                                    <AppStickyBottom>
                                                        <Link to="/checkout/3" className="btn btn-light btn-ecomm" disabled={this.state.submitting}><i className="bx bx-chevron-left"></i>Back to Shipping</Link>
                                                        <button type="submit" className="btn btn-dark btn-ecomm" disabled={!this.state.selectedPaymentMethod || this.state.submitting}>Submit Order and Payment<i className="bx bx-chevron-right"></i></button>
                                                    </AppStickyBottom>
                                                </div>
                                            </div>
                                        </form>
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
                                                        <p className="mb-2">Shipping &amp; Handling: <span className="float-end">{Globals.formatter.format(this.state.totalShipping)}</span>
                                                        </p>
                                                        <p className="mb-2">Taxes: <span className="float-end">{Globals.formatter.format(this.state.totalTax)}</span>
                                                        </p>
                                                        {this.state.totalDiscount ? <p className="mb-0">Discount: <span className="float-end">{Globals.formatter.format(this.state.totalDiscount)}</span>
                                                        </p> : ''}
                                                        <div className="my-3 border-top"></div>
                                                        <h5 className="mb-0">Order Total: <span className="float-end">{Globals.formatter.format(this.state.total)}</span></h5>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(CheckoutPayment);