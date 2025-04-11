/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { qreq } from "../shared/qrequest";
import Alert from "./Alert";
import BaseCom from "./BaseCom";
import L from "./Lang";
import LoadingAlert from "./LoadingAlert";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Link } from "react-router-dom";

class CheckoutComplete extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            order: null
        };
    }

    componentDidMount() {
        qreq.get('/api/order/get?masterID=' + this.props.params.orderMID, j => {
            if (j.item) {
                this.setState({ order: j.item });
                this.props.navigate('/my/orders/' + j.item.masterID);
            }
            else
                this.alert(j.errorMessage);
            this.setState({ loaded: true });
        }, this.unkownErrorCallback);
    }

    render() {
        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title="Checkout" />
                {this.state.loaded ? this.state.order ?
                    <section className="py-4">
                        <div className="container">
                            <div className="card py-3 mt-sm-3">
                                <div className="card-body text-center">
                                    <h2 className="h4 pb-3">Thank you for your order!</h2>
                                    <p className="fs-sm mb-2">Your order has been placed and will be processed as soon as possible.</p>
                                    <p className="fs-sm mb-2">Make sure you make note of your order number, which is <span className="fw-medium">{this.state.order.masterID}.</span>
                                    </p>
                                    <p className="fs-sm">You will be receiving an email shortly with confirmation of your order. <u>You can now:</u>
                                    </p><Link to="/" className="btn btn-light rounded-0 mt-3 me-3">Go back shopping</Link><Link to={'/my/orders/' + this.state.order.masterID} className="btn btn-white rounded-0 mt-3"><i className="bx bx-map"></i>Track order</Link>
                                </div>
                            </div>
                        </div>
                    </section> : <div className="container mt-3"><Alert type="danger"><L>Order not found.</L></Alert></div> : <div className="container mt-3"><LoadingAlert /></div>}
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(CheckoutComplete);