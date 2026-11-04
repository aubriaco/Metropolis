import Auth from "../shared/Auth";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import Icon from "./Icon";
import L from "./Lang";
import SubNav from "./SubNav";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import Globals from "../shared/Globals";
import { toast } from "react-toastify";
import Alert from "./Alert";
import PinModal from "./PinModal";
import LoadingAlert from "./LoadingAlert";

class Orders extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: []
        };
        this.ticker = 0;
        this.load = this.load.bind(this);
        this.tick = this.tick.bind(this);
        this.done = this.done.bind(this);
        this.complete = this.complete.bind(this);
        this.trash = this.trash.bind(this);
        this.enterViewMode = this.enterViewMode.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            this.setState({ user: u });
            if (!u)
                this.props.navigate('/login');
            else {
                this.load();
                this.interval = setInterval(() => this.tick(), 1000);
            }
        });
    }

    componentWillUnmount() {
        if (this.interval)
            clearInterval(this.interval);
    }

    load() {
        qreq.get('/api/waiter/order/list/pending', j => {
            if (j.list) {
                this.setState({ list: j.list, loaded: true });
            }
        });
    }

    tick() {
        this.ticker++;
        if (this.ticker >= 5) {
            this.load();
            this.ticker = 0;
        }
    }

    done(i) {
        qreq.post('/api/waiter/order/done', i, j => {
            if (j.errorCode === 0) {
                this.load();
                toast('Order marked done!', {
                    autoClose: 4000,
                    closeButton: closeEvent => <button
                        className="btn btn-secondary btn-lg"
                        onClick={() => {
                            qreq.post('/api/waiter/order/undo', i, j => { this.load(); });
                            closeEvent();
                        }}
                    >
                        Undo
                    </button>
                });
            }
            else
                this.alert(j.errorMessage);
        }, () => {
            this.alert('An error ocurred. Please try again.');
        });
    }

    complete(i) {
        qreq.post('/api/waiter/order/complete', i, j => {
            if (j.errorCode === 0) {
                this.load();
                toast('Order marked complete!', {
                    autoClose: 4000,
                    closeButton: closeEvent => <button
                        className="btn btn-secondary btn-lg"
                        onClick={() => {
                            qreq.post('/api/waiter/order/undo', i, j => { this.load(); });
                            closeEvent();
                        }}
                    >
                        Undo
                    </button>
                });
            }
            else
                this.alert(j.errorMessage);
        }, () => {
            this.alert('An error ocurred. Please try again.');
        });
    }

    trash(i) {
        if (!window.confirm('Are you sure you want to cancel order #' + i.seqID + '?'))
            return;
        qreq.post('/api/waiter/order/trash', i, j => {
            if (j.errorCode === 0) {
                this.load();
                toast('Order canceled!', {
                    autoClose: 4000,
                    closeButton: closeEvent => <button
                        className="btn btn-secondary btn-lg"
                        onClick={() => {
                            qreq.post('/api/waiter/order/undo', i, j => { this.load(); });
                            closeEvent();
                        }}
                    >
                        Undo
                    </button>
                });
            }
            else
                this.alert(j.errorMessage);
        }, () => {
            this.alert('An error ocurred. Please try again.');
        });
    }

    enterViewMode() {
        /*
        if (!window.confirm('Are you sure you want to enter \'view mode\'?'))
            return;
        qreq.post('/api/auth/mode/view', {}, j => {
            if (j.errorCode === 0)
                window.location.reload();
            else
                this.alert(j.errorMessage);
        });
        */
        this.setState({ enterViewModeModal: true });
    }

    render() {
        var o = 0;
        var n = 0;
        return <div className="Orders">
            <PinModal show={this.state.enterViewModeModal} lock={this.state.user && !this.state.user.isViewMode} onToggle={() => this.setState({ enterViewModeModal: false })} />
            <SubNav noBack={this.state.user && this.state.user.isViewMode}>
                {this.state.user && !this.state.user.isViewMode ?
                    <button type="button" className="btn btn-primary btn-lg" onClick={this.enterViewMode}><Icon icon="faEye" /> <L>Enter View Mode</L></button> : <button type="button" className="btn btn-primary btn-lg" onClick={this.enterViewMode}><Icon icon="faLock" /> <L>Exit View Mode</L></button>}
            </SubNav>
            <h1><L>Orders</L></h1>

            {this.state.loaded ? <div className="list-group">
                {this.state.list.map(i => <div key={o++} className={'list-group-item d-flex justify-content-start align-items-top mb-2' + (o !== 0 ? ' text-muted' : '')}>
                    <div className="fs-1" onClick={() => this.props.navigate('/orders/' + i.masterID)}># {i.seqID}</div>
                    <div className="mx-2 flex-fill" onClick={() => this.props.navigate('/orders/' + i.masterID)}>
                        {i.items.map(j => <div key={n++} className="p-2 d-flex justify-content-start align-items-baseline">
                            <h4>{j.item.name}</h4>
                            <div className="ms-2">x {j.quantity}</div>
                        </div>)}
                    </div>
                    <div className="text-center">
                        <div className="fs-2">{Globals.getFormatter().format(i.total)}</div>
                        <div><Icon icon="faClock" /> {i.timeDiff}</div>
                    </div>
                    <div className="mx-2">
                        <div className="btn-group">
                            {i.isDone ? <button type="button" className="btn btn-success btn-lg" onClick={() => this.complete(i)}><Icon icon="faCheck" /></button> : <button type="button" className="btn btn-warning btn-lg" onClick={() => this.done(i)}><Icon icon="faCheck" /></button>}
                            <button type="button" className="btn btn-danger btn-lg" onClick={() => this.trash(i)}><Icon icon="faTrash" /></button>
                        </div>
                    </div>
                </div>)}
                {this.state.list.length === 0 ? <Alert><L>There are no pending orders.</L></Alert> : ''}
            </div> : <LoadingAlert />}
        </div>;
    }
}

export default withParamsAndNavigate(Orders);