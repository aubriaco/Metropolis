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
import MyStoresPortal from "./MyStoresPortal";
import MyStoresCom from "./MyStoresCom";
import Card from "./Card";
import Icon from "./Icon";
import { Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { Pop } from "./PopModal";
import FormInput from "./FormInput";
import LoadingAlert from "./LoadingAlert";


class MyStoresOrdersView extends MyStoresCom {
    constructor(props) {
        super(props);
        this.init();
        this.state.order = {
            items: []
        };
        this.load = this.load.bind(this);
        this.confirmOrder = this.confirmOrder.bind(this);
        this.cancelOrder = this.cancelOrder.bind(this);
        this.packageOrder = this.packageOrder.bind(this);
        this.getShippingType = this.getShippingType.bind(this);
    }

    componentDidMount() {
        this.pullVendor(v => {
            this.setState({ vendor: v });
            this.load();
            qreq.get('/api/shipping/list', j => {
                if(j.list)
                    this.setState({ shippingTypes: j.list });
            });
        });
    }

    load() {
        qreq.get('/api/order/get?masterID=' + this.props.params.orderMID, j => {
            if (j.item)
                this.setState({ order: j.item });
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    confirmOrder() {
        Pop.showConfirm(<L>Are you sure you want to set this order as Confirmed?</L>, <L>Confirm Order</L>, () => {
            qreq.post('/api/order/vendor/confirm', { ...this.state.order }, j => {
                if (j.errorCode === 0) {
                    this.success('Order has been marked as confirmed.');
                    this.load();
                }
                else
                    this.alert(j.errorMessage);
            }, this.unkownErrorCallback);
        });
    }

    cancelOrder() {
        Pop.showConfirm(<L>Are you sure you want cancel this order?</L>, <L>Cancel Order</L>, () => {
            qreq.post('/api/order/vendor/cancel', { ...this.state.order }, j => {
                if (j.errorCode === 0) {
                    this.success('Order has been canceled.');
                    this.load();
                }
                else
                    this.alert(j.errorMessage);
            }, this.unkownErrorCallback);
        });
    }

    packageOrder(e, submit) {
        if (e) e.preventDefault();

        const packageFunc = () => {
            this.setState({ submitting: true });
            qreq.post('/api/order/vendor/package', { ...this.state.order }, j => {
                if (j.errorCode === 0) {
                    this.setState({ showPackageModal: false });
                    this.success('Ready for pickup, courier on the way.');
                    this.load();
                }
                else
                    this.alert(j.errorMessage);
                this.setState({ submitting: false });
            }, () => {
                this.unkownErrorCallback();
                this.setState({ submitting: false });
            });
        };

        if (!this.state.order.isCourierShipping) {
            if (!submit)
                this.setState({ showPackageModal: true });
            else
                packageFunc();
            return;
        }
        Pop.showConfirm(this.state.order.isCourierShipping ? <L>Once you mark the order for pickup, the courier service will be notified and dispatched right away. Are you sure?</L>
            : <L>Mark this order as packaged, ready to be shipped?</L>
            , this.state.order.isCourierShipping ? <L>Ready for Pickup</L> : <L>Package Order</L>, () => {
                packageFunc();
            });
    }

    getShippingType(ident) {
        if(this.state.shippingTypes) {
            var find = this.state.shippingTypes.find(a => a.ident === ident);
            if(find)
                return find;
        }
        return { ident: 'unknown', name: '' };
    }

    render() {
        return <>
            <Modal isOpen={this.state.showPackageModal} toggle={() => this.setState({ showPackageModal: false })}>
                <form onSubmit={e => this.packageOrder(e, true)}>
                    <ModalHeader>
                        <L>Package</L>
                    </ModalHeader>
                    <ModalBody>
                        <FormInput model={this.state.order} name="trackingNumber" label="Please input the package tracking number" type="text" placeholder="9400 1000 0000 0000 0000 00" required />
                    </ModalBody>
                    <ModalFooter>
                        <button type="submit" className="btn btn-success btn-lg"><L>Package Order</L></button>
                        <button type="button" className="btn btn-secondary btn-lg" onClick={() => this.setState({ showPackageModal: false })}><L>Cancel</L></button>
                    </ModalFooter>
                </form>
            </Modal>
            <MyStoresPortal vendor={this.state.vendor} subPath={[['/my/stores/manage/' + this.state.vendor.masterID + '/orders', 'Orders'], [false, this.state.order.ident ?? this.state.order.masterID]]}>
                <section className="py-4">
                    {this.state.order.id ? <div className="container">
                        <Card title="Order" headerButtons={<>
                            {this.state.order.isVendorCanceled ? '' : <>
                                {!this.state.order.isVendorConfirmed && this.state.order.id ? <>
                                    <button type="button" onClick={() => this.confirmOrder()} className="btn btn-lg btn-primary"><Icon icon="faCheck" /> <span className="d-none d-md-inline"><L>Confirm Order</L></span></button>
                                </> : ''}
                                {this.state.order.isVendorConfirmed && !this.state.order.isPackaged ? this.state.order.isCourierShipping ? <button type="button" onClick={() => this.packageOrder()} className="btn btn-lg btn-primary"><Icon icon="faTruckPickup" /> Ready for Pickup</button> : <button type="button" onClick={() => this.packageOrder()} className="btn btn-lg btn-primary"><Icon icon="faBoxesPacking" /> <L>Order Packaged</L></button> : ''}
                                {!this.state.order.isShipped ? <button type="button" onClick={() => this.cancelOrder()} className="btn btn-lg btn-danger"><Icon icon="faTimes" /> <span className="d-none d-md-inline"><L>Cancel Order</L></span></button> : ''}
                            </>}
                        </>}>
                            <h6 className="my-2"><span className="fw-normal">Order ID:</span> {this.state.order.ident ?? this.state.order.masterID} <span className="badge rounded-pill bg-secondary">{this.state.order.status}</span></h6>
                            <h6 className="my-2"><span className="fw-normal"><L>Order Date</L>:</span> {Globals.toMDYHMAMPMLocalDateString(this.state.order.createdDate)}</h6>
                            <h6 className="my-2"><span className="fw-normal"><L>Shipping Requested</L>:</span> {this.getShippingType(this.state.order.shippingType).name}</h6>
                            {this.state.order.isPackaged ? <h6 className="my-2"><span className="fw-normal"><L>Packaged Date</L>:</span> {Globals.toMDYHMAMPMLocalDateString(this.state.order.packagedDate)}</h6> : ''}
                            {this.state.order.isShipped ? <h6 className="my-2"><span className="fw-normal"><L>Shipped Date</L>:</span> {Globals.toMDYHMAMPMLocalDateString(this.state.order.shippedDate)}</h6> : ''}
                            {this.state.order.isPackaged && this.state.order.isCourierShipping && this.state.order.trackingUrl ? <h6 className="mb-0"><L>Tracking URL</L>: <a href={this.state.order.trackingUrl} rel="noreferrer" target="_blank" ref="noreferrer">View Tracking Information</a></h6> : ''}
                        </Card>
                        <Card title="Items">
                            <div className="row">
                                {this.state.order.items.map(i => <div key={i.id} className="col-md-3 text-center">
                                    <Link to={'/p/' + i.product.ident}>
                                        <h5>{i.product.name}</h5>
                                        <img src={Globals.imageUrl(i.product.displayImageUrl)} alt="" className="d-block img-fluid my-2" />
                                        <div><L>Qty</L>: x{i.quantity} <L>Total Paid</L>: {Globals.formatter.format(i.total)}</div>
                                    </Link>
                                </div>)}
                            </div>
                        </Card>
                    </div> : <Card><LoadingAlert /></Card>}
                </section>
            </MyStoresPortal>
        </>;
    }
}

export default withParamsAndNavigate(MyStoresOrdersView);