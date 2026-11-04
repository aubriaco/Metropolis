import Auth from "../shared/Auth";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import L from "./Lang";
import LoadingAlert from "./LoadingAlert";
import { Pop } from "./PopModal";
import SubNav from "./SubNav";
import Wallet from "./Wallet";

class Subscription extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            serviceName: 'WAITERNET100',
            info: {}
        };
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if (!u)
                window.location.assign('/login');
            else {
                qreq.get('/api/vendor/get/active', j => {
                    if (j.item) {
                        this.setState({ vendor: j.item });
                        qreq.get('/api/subscription/status?service=' + this.state.serviceName, k => {
                            if (k.item)
                                this.setState({ subscribed: true });
                            this.setState({ loaded: true });
                        }, () => {
                            Pop.show('Unknown error ocurred. Please reload the application.');
                        });
                    }
                }, () => {
                    Pop.show('Unknown error ocurred. Please reload the application.');
                });
            }
        });
    }

    submit(e) {
        if (e) e.preventDefault();
        this.setState({ submitting: true });
        qreq.post('/api/subscription/subscribe', { ...this.state.info, service: this.state.serviceName }, j => {
            if (j.errorCode === 0) {
                this.setState({ success: true });
            }
            else
                Pop.show(<L>{j.errorMessage}</L>, <L>Could not process</L>);
            this.setState({ submitting: false });
        }, () => {
            Pop.show(<L>Unknown error ocurred. Please try again.</L>, <L>Could not process</L>);
            this.setState({ submitting: false });
        });
    }

    render() {
        if (!this.state.loaded)
            return <LoadingAlert />
        return <div className="Subscription">
            {this.state.subscribed ? <>
                <SubNav />
                <h1><L>Subscription</L></h1>
                <p><L>You are currently subscribed to:</L></p>
                <div className="p-3">
                    <strong className="fs-3">$100/Month</strong> <span className="fs-5">Unlimited Plan</span>
                </div>
            </>
                : this.state.success ? <>
                    <SubNav />
                    <h1><L>Subscription</L></h1>
                    <p><L>We're thrilled to welcome</L> {this.state.vendor.name} <L>to the</L> Waitr.NET <L>family! Thank you for subscribing to our platform – we look forward to helping your restaurant thrive with efficient in-dine food ordering.</L></p>
                </> : <>
                    <h1><L>Subscription</L></h1>
                    <div className="p-3">
                        <strong className="fs-3">$100/Month</strong> <span className="fs-5">Unlimited Plan</span>
                    </div>

                    <Wallet item={this.state.info} select={obj => this.setState({ info: { ...this.state.info, paymentMethodID: obj.id } })} className="mt-2" />
                    <form onSubmit={this.submit}>

                        <SubNav>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={this.state.submitting}>Subscribe</button>
                        </SubNav>
                        <div className="btn-group mt-2">
                            <button type="submit" className="btn btn-primary btn-lg" disabled={this.state.submitting}><L>Subscribe</L></button>
                        </div>
                    </form>
                </>}
        </div>;
    }
}

export default Subscription;