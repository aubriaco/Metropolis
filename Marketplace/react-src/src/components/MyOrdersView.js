/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link } from "react-router-dom";
import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import L from "./Lang";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { WebGlobal } from "../layouts/Web";

class MyOrdersView extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            order: {
                items: []
            }
        };
    }

    componentDidMount() {
        WebGlobal.setSearchVisible(false);
        qreq.get('/api/order/get?masterID=' + this.props.params.orderMID, j => {
            if(j.item)
                this.setState({ order: j.item });
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    render() {
        return <div className="page-wrapper">
        <div className="page-content">
            <SubHeader title="Order Information" path={[['/my', 'My Account'], ['/my/orders', 'My Orders']]} />
            <section className="py-4">
                <div className="container">
                    <h6 className="mb-0">Order ID: {this.state.order.masterID}</h6>
                    <hr />
                    <div className="row row-cols-1 row-cols-lg-4 rounded-4 gx-3 m-0 border d-none">
                        <div className="col p-4 text-center border-end">
                            <h6 className="mb-1">Estimated Delivery time:</h6>
                            <p className="mb-0"></p>
                        </div>
                        <div className="col p-4 text-center border-end">
                            <h6 className="mb-1">Shipping BY:</h6>
                            <p className="mb-0"></p>
                        </div>
                        <div className="col p-4 text-center border-end">
                            <h6 className="mb-1">Status:</h6>
                            <p className="mb-0"></p>
                        </div>
                        <div className="col p-4 text-center">
                            <h6 className="mb-1">Tracking #:</h6>
                            <p className="mb-0"></p>
                        </div>
                    </div>
                    <div className="mt-3"></div>
                    <div className="checkout-payment">
                        {this.state.order.trackingList && this.state.order.trackingList.map(i => <div className="card bg-transparent rounded-0 shadow-none mb-3">
                            <div className="card-body">
                                <h4>{i.vendorName}</h4>
                                <div className="steps steps-light py-4  pb-md-1">
                                    <Link className={'step-item' + (i.isConfirmed ? ' active' : '')}>
                                        <div className="step-progress"><span className="step-count"><i className="bx bx-check"></i></span>
                                        </div>
                                        <div className="step-label d-none d-md-block"><L>Order confirmed</L></div>
                                    </Link>
                                    <Link className={'step-item' + (i.isPackaged ? ' active' : '')}>
                                        <div className="step-progress"><span className="step-count"><i className="bx bx-user-circle"></i></span>
                                        </div>
                                        <div className="step-label d-none d-md-block"><L>Ready to Ship</L></div>
                                    </Link>
                                    <Link className={'step-item' + (i.isShipped ? ' active' : '')}>
                                        <div className="step-progress"><span className="step-count"><i className="bx bx-car"></i></span>
                                        </div>
                                        <div className="step-label d-none d-md-block"><L>On the way</L></div>
                                    </Link>
                                    <Link className={'step-item' + (i.isDelivered ? ' active' : '')}>
                                        <div className="step-progress"><span className="step-count"><i className="bx bx-planet"></i></span>
                                        </div>
                                        <div className="step-label d-none d-md-block"><L>Delivered</L></div>
                                    </Link>
                                </div>
                            </div>
                        </div>)}
                        {this.state.order.isShipped ? <div className="card bg-transparent rounded-0 shadow-none mb-3">

                        </div> : ''}
                        <div className="card mt-3 bg-transparent rounded-0 shadow-none">
                            <div className="card-header">
                                <h4>Items</h4>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    {this.state.order.items.map(i => <div className="col-md-3 text-center">
                                        <Link to={'/p/' + i.product.ident}>
                                            <h5>{i.product.name}</h5>
                                            <img src={Globals.imageUrl(i.product.displayImageUrl)} alt="" className="d-block img-fluid my-2" />
                                            <div><L>Qty</L>: x{i.quantity} <L>Total Paid</L>: {Globals.formatter.format(i.total)}</div>
                                        </Link>
                                    </div>)}
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

export default withParamsAndNavigate(MyOrdersView);