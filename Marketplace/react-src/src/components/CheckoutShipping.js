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
import Card from "./Card";
import L from "./Lang";
import AppStickyBottom from "./AppStickyBottom";

class CheckoutShipping extends BaseCom {
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
            info: {},
            shippingTypes: [],
            calculating: false,
            calculated: false,
            loadingAmount: false
        };
        this.tick = this.tick.bind(this);
        this.loadOrder = this.loadOrder.bind(this);
        this.loadShippingTypes = this.loadShippingTypes.bind(this);
        this.loadVendors = this.loadVendors.bind(this);
        this.shippingTypeSelected = this.shippingTypeSelected.bind(this);
        this.isCalculated = this.isCalculated.bind(this);
        this.getTotalShippingAmount = this.getTotalShippingAmount.bind(this);
        this.getShippingTypeByVendorID = this.getShippingTypeByVendorID.bind(this);
        this.readyToSubmit = this.readyToSubmit.bind(this);
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if (!u)
                this.props.navigate('/login');
            this.setState({ user: u, shipping: { ...u, ...u.address }, billing: { ...u, ...u.address } });

            qreq.get('/api/cart/step', j => {
                if (j.item) {
                    if (j.item < 3)
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
        if (this.state.totalShipping !== Cart.totalShipping)
            this.setState({ totalShipping: Cart.totalShipping });
        if (this.state.shippingType !== Cart.shippingType)
            this.setState({ shippingType: Cart.shippingType });
        if (this.state.total !== Cart.total)
            this.setState({ total: Cart.total });
    }

    loadOrder() {
        qreq.get('/api/cart/order', j => {
            if (j.item) {
                this.setState({ order: j.item, shipping: { ...j.item.shippingAddress }, billing: { ...j.item.billingAddress }, totalShipping: j.item.shippingAmount });
                this.loadShippingTypes();
                if (j.item.shippingType) {
                    this.shippingTypeSelected(j.item.shippingType);
                }
            
            }
            else if (j.errorCode !== 2)
                this.alert(j.errorMessage);
            this.setState({ loaded: true });
        }, this.unkownErrorCallback);
    }

    loadShippingTypes() {
        qreq.get('/api/shipping/list', j => {
            if (j.list) {
                this.setState({ shippingTypes: j.list });
                this.loadVendors(j.list);
                
            }
        }, this.unkownErrorCallback);
    }

    loadVendors(shippingTypes) {
        qreq.get('/api/cart/vendors', j => {
            if (j.list) {
                this.setState({ vendors: j.list });
                if(shippingTypes?.length > 0) {
                    j.list.forEach(v => {
                        this.shippingTypeSelected(v, shippingTypes[0].ident);
                    });
                }
            }
        }, this.unkownErrorCallback);
    }

    getTotalShippingAmount(vendorShippingTypes) {
        var amount = 0;
        if (!vendorShippingTypes)
            vendorShippingTypes = this.state.order.vendorShippingTypes;
        console.log(vendorShippingTypes);
        vendorShippingTypes.forEach(i => {
            amount += Number(i.amount);
        });
        return amount;
    }

    getShippingTypeByVendorID(vendorID) {
        if (this.state.order.vendorShippingTypes) {
            var find = this.state.order.vendorShippingTypes.find(a => a.vendorID === vendorID);
            if (find)
                return find;
        }
        return { shippingType: 'null', amount: 0 };
    }

    shippingTypeSelected(vendor, v) {
        if (!v) v = 'null';
        this.setState({ calculating: true, calculated: false, loadingAmount: true, order: { ...this.state.order, shippingAmount: 0, shippingType: v }, totalShipping: 0, total: -1 });
        qreq.get('/api/shipping/estimate?vendorID=' + vendor.id + '&ident=' + v + '&clientDate=' + Globals.toISOLocalDateString(new Date()), j => {
            if (j.item) {
                var vendorShippingTypes = [...this.state.order.vendorShippingTypes];
                var st = vendorShippingTypes.find(a => a.vendorID === vendor.id);
                if (st == null)
                    vendorShippingTypes.push({ vendorID: vendor.id, shippingType: v ?? 'null', amount: j.item });
                else {
                    st.shippingType = v ?? 'null';
                    st.amount = j.item;
                }
                this.setState({ order: { ...this.state.order, vendorShippingTypes: vendorShippingTypes, shippingAmount: this.getTotalShippingAmount(vendorShippingTypes) }, calculated: true, shippingAmount: j.item, total: -1 });
                Cart.refresh();
            }
            else
                this.alert(j.errorMessage);
            this.setState({ calculating: false, loadingAmount: false });
        }, () => {
            this.unkownErrorCallback();
            this.setState({ calculating: false, loadingAmount: false });
        });
    }

    isCalculated() {
        return !this.state.loadingAmount && this.state.total !== -1;
    }

    readyToSubmit() {
        if(!this.state.vendors || !this.state.order || !this.state.order.vendorShippingTypes)
            return false;
        var count = 0;
        this.state.order.vendorShippingTypes.forEach(i => {
            if(i.shippingType)
                count++;
        });
        return count === this.state.vendors.length;
    }

    submit(e) {
        if (e) e.preventDefault();
        qreq.post('/api/cart/step/3', { ...this.state.order, clientDate: Globals.toISOLocalDateString(new Date()) }, j => {
            if (j.errorCode === 0)
                this.props.navigate('/checkout/4');
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
                                                <form onSubmit={this.submit}>
                                                    <CheckoutSteps step={3} />
                                                    {this.state.vendors ? this.state.vendors.map(v => <Card key={v.id} title={'Delivery for: ' + v.name} className="rounded-0">
                                                        <p className="mb-3"><L>Please select a delivery method for '{v.name}' below.</L></p>
                                                        <ul className="list-group mb-3">
                                                            {this.state.shippingTypes.map(i => <li key={i.ident} role="button" className="list-group-item" onClick={e => this.shippingTypeSelected(v, i.ident)}>
                                                                <input className="form-check-input me-1" type="radio" checked={this.getShippingTypeByVendorID(v.id).shippingType === i.ident} disabled={this.state.calculating} />
                                                                <label className="form-check-label" for="firstRadio">{i.name}</label>
                                                            </li>)}
                                                        </ul>
                                                        {this.getShippingTypeByVendorID(v.id).shippingType !== 'null' ? <h5><strong>Shipping and Handling:</strong> {Globals.formatter.format(this.getShippingTypeByVendorID(v.id).amount)}</h5> : ''}
                                                    </Card>) : ''}

                                                    {this.state.calculated ? <Card title="Total">
                                                        <h6><strong>Total Shipping and Handling:</strong> {Globals.formatter.format(this.state.totalShipping)}</h6>
                                                    </Card> : ''}

                                                    <AppStickyBottom>
                                                        <Link to="/checkout/2" className="btn btn-light btn-ecomm"><i className="bx bx-chevron-left"></i>Back to Shipping/Billing Info</Link>
                                                        <button type="submit" className="btn btn-dark btn-ecomm" disabled={!this.readyToSubmit()}>Proceed to Payment<i className="bx bx-chevron-right"></i></button>
                                                    </AppStickyBottom>

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
                                                                <h5 className="mb-0">Order Total: <span className="float-end">{!this.isCalculated() ? 'Loading...' : Globals.formatter.format(this.state.total)}</span></h5>
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

export default withParamsAndNavigate(CheckoutShipping);