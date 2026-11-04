import { Link } from "react-router-dom";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import LoadingAlert from "./LoadingAlert";
import SubNav from "./SubNav";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import L from "./Lang";
import Card from './Card';
import ImageGallery from "./ImageGallery";
import Globals from "../shared/Globals";
import './MenuItemView.css';
import FormInput from "./FormInput";
import Icon from "./Icon";
import { toast } from 'react-toastify';

class MenuItemView extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            vendor: {},
            category: {},
            item: {
                images: []
            },
            order: {
                quantity: 1
            }
        };
        this.load = this.load.bind(this);
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        this.load();
    }

    load() {
        if (this.props.params.qr) {
            this.setState({ list: [] });
            qreq.get('/api/waiter/qr/get?ident=' + this.props.params.qr, j => {
                if (j.item) {
                    this.setState({ qr: j.item });
                    qreq.get('/api/vendor/get/public?id=' + j.item.vendorID, j => {
                        if (j.item)
                            this.setState({ vendor: j.item });
                    });
                    qreq.get('/api/waiter/category/get/public?vendorID=' + j.item.vendorID + '&id=' + this.props.params.categoryID, j => {
                        if (j.item)
                            this.setState({ category: j.item });
                    });
                    qreq.get('/api/waiter/item/get/public?vendorID=' + j.item.vendorID + '&id=' + this.props.params.itemID, j => {
                        if (j.item)
                            this.setState({ item: j.item });
                    });
                }
                else if (j.errorCode)
                    this.alert(j.errorMessage);
                this.setState({ loaded: true });
            });
        }
    }

    submit(e) {
        if(e) e.preventDefault();
        var order = {...this.state.order};
        order.itemID = this.state.item.id;
        order.item = this.state.item;
        order.vendorID = this.state.vendor.id;
        this.setState({ submitting: true });
        qreq.post('/api/waiter/order/add', order, j => {
            if(j.errorCode === 0) {
                toast(Globals.getLang('Added to order.'));
                Globals.set('cartCount', j.item);
                this.goBack();
            }
            else
                this.alert(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.alert('An unknown error ocurred. Please try again.');
            this.setState({ submitting: false });
        });
    }

    render() {

        return <div className="MenuItemView">
            <SubNav hideLeft showCart qr={this.props.params.qr} />
            {this.state.loaded ? <>
                <h1>{this.state.item.name}</h1>
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">{this.state.vendor.name ?? '...'}</li>
                    <li className="breadcrumb-item">{this.state.category.name ?? '...'}</li>
                    <li className="breadcrumb-item active">{this.state.item.name ?? '...'}</li>
                </ol>
                <form onSubmit={this.submit}>
                    <Card>
                        <img src={this.state.item.imageURL ? Globals.serverUrl + this.state.item.imageURL : '/img/noimage.png'} alt="" className="img-fluid d-block mx-auto DisplayImage rounded" />
                        {this.state.item.images.length > 1 ? <ImageGallery list={this.state.item.images} /> : ''}
                        <div className="mt-2 text-center">
                            <label className="mb-2 d-block text-center">Quantity</label>
                            <div className="d-flex justify-content-center align-items-stretch">
                                <div>
                                    <button type="button" className="btn btn-primary btn-lg d-block" onClick={() => { if (this.state.order.quantity < 2) return; this.setState({ order: { ...this.state.order, quantity: this.state.order.quantity - 1 } }); }} ><Icon icon="faCaretLeft" /></button>
                                </div>
                                <div className="mx-2">
                                    <input type="number" className="d-block form-control form-control-lg mx-auto text-center" placeholder="" step="1" value={this.state.order.quantity} style={{ width: '100px' }} onChange={e => this.setState({ order: { ...this.state.order, quantity: e.target.value } })} />
                                </div>
                                <div>
                                    <button type="button" className="btn btn-primary btn-lg d-block" onClick={() => { if (this.state.order.quantity > 9) return; this.setState({ order: { ...this.state.order, quantity: this.state.order.quantity + 1 } }); }}><Icon icon="faCaretRight" /></button>
                                </div>
                            </div>
                            <div className="mt-2 fs-3 text-center text-secondary">{Globals.getFormatter().format(this.state.item.price * this.state.order.quantity)}</div>
                            <div className="mt-2 d-grid gap-2">
                                <button type="submit" className="btn btn-primary btn-lg" disabled={this.state.submitting}><L>Add to Order</L></button>
                            </div>
                        </div>
                    </Card>
                </form>
            </> : <LoadingAlert />}
        </div>;
    }
}

export default withParamsAndNavigate(MenuItemView);