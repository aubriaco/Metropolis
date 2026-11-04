import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import LoadingAlert from "./LoadingAlert";
import SubNav from "./SubNav";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import './Cart.css';
import Icon from "./Icon";
import L from "./Lang";
import FormInput from "./FormInput";
import Card from "./Card";
import Alert from "./Alert";
import { toast } from "react-toastify";

class Cart extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            vendor: {},
            cart: {
                items: []
            },
            info: {},
            taxPercent: 11.5,
            checkLoc: true
        };
        this.load = this.load.bind(this);
        this.submit = this.submit.bind(this);
        this.getLocation = this.getLocation.bind(this);
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
                    qreq.get('/api/waiter/order/cart', j => {
                        if (j.errorCode === 0 && j.item) {
                            this.setState({ cart: j.item });
                            this.setState({ loaded: true });
                            Globals.set('cartCount', j.item.quantity);
                            this.getLocation();
                        }
                        else {
                            this.alert(j.errorMessage);
                            this.goBack();
                        }
                    }, () => {
                        this.alert('An unknown error ocurred. Please try again.');
                        this.goBack();
                    });
                }
                else if (j.errorCode) {
                    this.alert(j.errorMessage);
                    this.goBack();
                }
            }, () => {
                this.alert('An unknown error ocurred. Please try again.');
                this.goBack();
            });
        }
    }

    changeQuantity(i, q) {
        if ((i.quantity < 2 && q < 0) || (i.quantity > 9 && q > 0))
            return;
        i.subTotal = null;
        i.quantity += q;
        this.setState({ cart: this.state.cart, updating: true });
        qreq.post('/api/waiter/order/cart/update', i, j => {
            if (j.errorCode === 0 && j.item) {
                this.setState({ cart: j.item });
                Globals.set('cartCount', j.item.quantity);
            }
            else
                this.alert(j.errorMessage);
            this.setState({ updating: false });
        }, () => {
            this.alert('An unknown error ocurred. Please try again.');
            this.setState({ updating: false });
        });
    }

    remove(i) {
        i.removed = true;
        this.setState({ cart: this.state.cart, updating: true });
        qreq.post('/api/waiter/order/cart/update', i, j => {
            if (j.errorCode === 0 && j.item) {
                this.setState({ cart: j.item });
                Globals.set('cartCount', j.item.quantity);
            }
            else
                this.alert(j.errorMessage);
            this.setState({ updating: false });
        }, () => {
            this.alert('An unknown error ocurred. Please try again.');
            this.setState({ updating: false });
        });
    }

    submit(e) {
        if (e) e.preventDefault();

        this.setState({ submitting: true });
        qreq.post('/api/waiter/order/submit', { ...this.state.cart, tableID: (this.state.qr.tableID ?? 0) }, j => {
            if (j.errorCode === 0 && j.item) {
                this.props.navigate('/qr/' + this.props.params.qr + '/order/' + j.item.masterID)
                Globals.set('cartCount', 0);
            }
            else
                this.alert(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.alert('An unknown error ocurred. Please try again.');
            this.setState({ submitting: false });
        });

    }

    getLocation() {
        this.setState({ locError: null, checkLoc: true });
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
            console.log(pos);
            this.setState({ checkLoc: false, cart: {...this.state.cart, lat: pos.coords.latitude, lng: pos.coords.longitude }});
          }, error => {
            if (error.code === error.PERMISSION_DENIED) {
                this.setState({ locError: error.code, });
            }            
            toast('Failed to get location. You can still submit the order, but location will not be confirmed.');
            this.setState({ checkLoc: false });
          });
      }
    }

    render() {

        if(this.state.checkLoc) {
            return <div className="Cart">
                <SubNav hideLeft qr={this.props.params.qr} />
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">{this.state.vendor.name ?? '...'}</li>
                    <li className="breadcrumb-item"><L>Order</L></li>
                </ol>
                <Alert className="fs-4" icon="LocationCrosshairs"><L>We recommend you allow location access to the application. This will confirm that you are in proximity of the service location. Some locations might ignore non-proximity orders.</L></Alert>
                <div className="mt-2 d-grid gap-2 mb-4">
                    <button type="button" className="btn btn-secondary btn-lg" onClick={() => this.setState({ checkLoc: false })}><L>Ignore and Continue</L></button>
                </div>
            </div>
        }

        var n = 0;
        return <div className="Cart">
            <SubNav hideLeft qr={this.props.params.qr} />
            {this.state.loaded ? <><h1><L>Order</L></h1>
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">{this.state.vendor.name ?? '...'}</li>
                    <li className="breadcrumb-item"><L>Order</L></li>
                </ol>
                <div className="list-group">
                    {this.state.cart.items.length === 0 ? <Alert type="warning"><L>Your order currently has no items selected.</L></Alert> : ''}
                    {this.state.cart.items.map(i => <div key={n++} className={'list-group-item d-flex justify-content-start align-items-center' + (i.removed ? ' faded' : '')}>
                        <div className="DisplayImage d-none d-md-block">
                            <img src={i.item.imageURL ? Globals.serverUrl + i.item.imageURL : '/img/noimage.png'} alt="" className="thumb img-fluid rounded" />
                        </div>
                        <div className="flex-fill ms-3 fs-3">
                            <h4>{i.item.name}</h4>
                        </div>
                        <div className="text-muted me-3 fs-3 text-secondary">
                            <div className="d-flex justify-content-center align-items-center">
                                <button type="button" className="btn btn-primary" onClick={() => this.changeQuantity(i, -1)}><Icon icon="faCaretLeft" /></button>
                                <div className="px-1">{i.quantity}</div>
                                <button type="button" className="btn btn-primary" onClick={() => this.changeQuantity(i, 1)}><Icon icon="faCaretRight" /></button>
                            </div>
                        </div>
                        <div className="text-secondary me-3 fs-3 text-secondary text-end" style={{ minWidth: '20%' }}>
                            {i.subTotal === null ? '...' : Globals.getFormatter().format(i.subTotal)}
                        </div>
                        <div className="me-1">
                            <button type="button" className="btn btn-danger btn-lg" onClick={() => this.remove(i)}><Icon icon="faTrash" /></button>
                        </div>
                    </div>)}
                    {this.state.cart.subTotal > 0 ? <>
                        <div className="list-group-item d-flex">
                            <div className="flex-fill fs-3">Sub-Total</div>
                            <div className="fs-3 text-secondary">{Globals.getFormatter().format(this.state.cart.subTotal)}</div>
                        </div>
                        <div className="list-group-item d-flex">
                            <div className="flex-fill fs-3">Sales Tax</div>
                            <div className="fs-3 text-secondary">{Globals.getFormatter().format(this.state.cart.subTotal * (this.state.taxPercent / 100))}</div>
                        </div>
                        <div className="list-group-item d-flex">
                            <div className="flex-fill fs-3 fw-bolder">Total <span className="text-muted">without tip</span></div>
                            <div className="fs-3 fw-bolder">{Globals.getFormatter().format(this.state.cart.subTotal + (this.state.cart.subTotal * (this.state.taxPercent / 100)))}</div>
                        </div>
                    </> : ''}
                </div>
                {this.state.cart.subTotal > 0 ? <>
                    <form onSubmit={this.submit}>
                        <p className="mt-4 text-center text-secondary"><L>Please remember to tip your servers!<br />Tip is not included in this total.</L></p>
                        <p className=" text-center text-muted">
                            <small>
                                15% - <strong>{Globals.getFormatter().format(1.15 * (this.state.cart.subTotal + (this.state.cart.subTotal * (this.state.taxPercent / 100))))}</strong> |
                                20% - <strong>{Globals.getFormatter().format(1.20 * (this.state.cart.subTotal + (this.state.cart.subTotal * (this.state.taxPercent / 100))))}</strong> |
                                30% - <strong>{Globals.getFormatter().format(1.30 * (this.state.cart.subTotal + (this.state.cart.subTotal * (this.state.taxPercent / 100))))}</strong>
                            </small>
                        </p>
                        <Card className="bg-light">
                            <FormInput model={this.state.info} name="displayName" label="Your name or nickname" type="text" placeholder="Jose Luis" />
                            <small className="d-block mb-3"><L>This is optional.</L></small>
                            <FormInput model={this.state.info} name="email" label="Email address" type="email" placeholder="myname@example.com" />
                            <small className="d-block"><L>Optional. You will receive the order info with the ID.</L></small>
                        </Card>
                        <p className="mt-4 text-center"><L>Once this order is submitted it will be put in line to be processed. If you need to make any modifications, please notify the waiter/waitress or bartender.</L></p>
                        <div className="mt-2 d-grid gap-2 mb-4">
                            <button type="submit" className="btn btn-primary btn-lg" disabled={this.state.updating || this.state.submitting || this.state.cart.items.length === 0}><L>Submit</L></button>
                        </div>
                    </form>
                </> : ''}
            </> : <LoadingAlert />}
        </div>;
    }
}

export default withParamsAndNavigate(Cart);