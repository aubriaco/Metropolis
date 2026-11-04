import BaseCom from "./BaseCom";
import L from "./Lang";
import SubNav from "./SubNav";
import LoadingAlert from './LoadingAlert';
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { qreq } from "../shared/qrequest";
import Globals from "../shared/Globals";
import { Alert } from "reactstrap";
import CardPay from "./CardPay";

class Order extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            order: {
                items: []
            },
            taxPercent: 11.5
        };
        this.load = this.load.bind(this);
    }

    componentDidMount() {
        this.interval = setInterval(() => this.load(), 5000);
        this.load();
    }

    componentWillUnmount() {
        if (this.interval)
            clearInterval(this.interval);
    }

    load() {
        qreq.get('/api/waiter/order/get?masterID=' + this.props.params.orderMasterID, j => {
            if (j.item)
                this.setState({ order: j.item });
            else if (j.errorMessage)
                this.setState({ error: j.errorMessage });
            this.setState({ loaded: true });
        }, () => {
            this.setState({ error: 'Unknown error ocurred. Please refresh and try again.' });
            this.setState({ loaded: true });
        });
    }

    render() {
        var n = 0;
        return <div className="Order">
            <SubNav hideLeft noBack={!this.props.manageView} qr={this.props.params.qr} />
            <h1 className="text-center"><L>Order</L></h1>
            {this.state.loaded ? this.state.error ? <Alert type="danger">{this.state.error}</Alert> : <>
                <div className="text-center">
                    <span className={'d-inline-block fs-1 font-bolder p-3 rounded box-shadow mb-2' + (this.state.order.isCompleted ? ' bg-secondary text-light' : this.state.order.isDone ? ' bg-success text-light' : ' bg-faded')}># {this.state.order.seqID}</span>
                    {this.state.order.isCompleted ? <span className="d-block fs-2 text-secondary">Delivered</span> : this.state.order.isDone ? <span className="d-block fs-2 text-success">Ready To Pickup</span> : ''}
                    {!this.props.manageView ? <>
                        <p className="mt-2"><L>Depending on the server, you will be brought the order, or you number will be called out to be picked up.</L></p>
                        <p className="mt-2 text-secondary"><L>Please have this open on you device to show to the server.</L></p>
                    </> : ''}
                </div>
                {this.state.order.items.map(i => <div key={n++} className={'list-group-item d-flex justify-content-start align-items-center' + (i.removed ? ' faded' : '')}>
                    <div className="DisplayImage d-none d-md-block">
                        <img src={i.item.imageURL ? Globals.serverUrl + i.item.imageURL : '/img/noimage.png'} alt="" className="thumb img-fluid rounded" />
                    </div>
                    <div className="flex-fill ms-3 fs-3">
                        <h4>{i.item.name}</h4>
                    </div>
                    <div className="text-muted me-3 fs-3 text-secondary">
                        <div className="d-flex justify-content-center align-items-center">
                            <div className="px-1">x{i.quantity}</div>
                        </div>
                    </div>
                    <div className="text-secondary me-1 fs-3 text-secondary text-end" style={{ minWidth: '20%' }}>
                        {i.subTotal === null ? '...' : Globals.getFormatter().format(i.subTotal)}
                    </div>
                </div>)}
                {this.state.order.subTotal > 0 ? <>
                    <div className="list-group-item d-flex">
                        <div className="flex-fill fs-3">Sub-Total</div>
                        <div className="fs-3 text-secondary">{Globals.getFormatter().format(this.state.order.subTotal)}</div>
                    </div>
                    <div className="list-group-item d-flex">
                        <div className="flex-fill fs-3">Sales Tax</div>
                        <div className="fs-3 text-secondary">{Globals.getFormatter().format(this.state.order.subTotal * (this.state.taxPercent / 100))}</div>
                    </div>
                    <div className="list-group-item d-flex">
                        <div className="flex-fill fs-3 fw-bolder">Total <span className="text-muted">without tip</span></div>
                        <div className="fs-3 fw-bolder">{Globals.getFormatter().format(this.state.order.subTotal + (this.state.order.subTotal * (this.state.taxPercent / 100)))}</div>
                    </div>
                    <div className="mt-4">
                        {this.state.order.isPaid ? <Alert type="success"><L>Thank you for your payment!</L></Alert>
                            : <CardPay order={this.state.order} onSuccess={() => this.setState({ order: {...this.state.order, isPaid: true}})} />}
                    </div>
                </> : ''}
            </> : <LoadingAlert />}
        </div>;
    }
}

export default withParamsAndNavigate(Order);