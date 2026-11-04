import Alert from "./Alert";
import BaseCom from "./BaseCom";
import Card from "./Card";
import FormInput from "./FormInput";
import L from "./Lang";
import SubNav from "./SubNav";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { qreq } from "../shared/qrequest";
import LoadingAlert from "./LoadingAlert";
import { Pop } from "./PopModal";
import Icon from "./Icon";

class Connect extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            cinfo: {}
        };
        this.load = this.load.bind(this);
        this.import = this.import.bind(this);
        this.checkQS = this.checkQS.bind(this);
        this.enableInterval = this.enableInterval.bind(this);
        this.connect = this.connect.bind(this);
    }

    componentDidMount() {
        this.load();
    }

    load() {
        qreq.get('/api/vendor/get/active', j => {
            if (j.item) {
                qreq.get('/api/payout/status?vendorID=' + j.item.id, j => {
                    if (j.errorCode !== 0 && j.errorCode !== 2 && j.errorCode !== 3)
                        this.alert(j.errorMessage);
                    else {
                        this.setState({ stripeStatus: j.item });
                    }
                    this.setState({ loaded: true });
                }, () => {
                    this.unkownErrorCallback();
                });
            }
        }, this.unkownErrorCallback);

        qreq.get('/api/integration/clover/import/preset', j => {
            if (j.item) {
                this.setState({ cinfo: { ...j.item, isRerun: true } });
            }
            this.setState({ loaded: true });
            this.checkQS(j.item ? { ...j.item } : {});
        }, () => {
            this.setState({ loaded: true });
        });
    }

    checkQS(cinfo) {
        var qs = window.location.search;
        if (qs.substring(0, 1) === '?')
            qs = qs.substring(1);
        var p = qs.split('&');
        var dict = {};
        p.forEach(i => {
            var kv = i.split('=');
            if (kv.length >= 2) {
                dict[kv[0]] = kv[1];
            }
        });

        if (dict.merchant_id)
            cinfo.merchantID = dict.merchant_id;
        if (dict.code) {
            cinfo.code = dict.code;
            qreq.post('/api/integration/clover/oauth', cinfo, j => {
                if (j.item) {
                    this.setState({ cinfo: j.item.integration });
                    this.props.navigate('/manage/connect');
                    this.enableInterval(j.item.taskID);
                }
                else if (j.errorCode)
                    this.alert(j.errorMessage);
            }, () => {
                this.alert('Unknown error ocurred. Please try again.');
            });
        }
    }

    enableInterval(taskID) {
        this.setState({ importing: true });
        this.interval = setInterval(() => {
            qreq.get('/api/integration/clover/import/status?taskID=' + taskID, j => {
                if (j.errorCode === 0) {
                    clearInterval(this.interval);
                    this.setState({ importing: false });
                    this.load();
                }
                else if (j.errorCode !== 10) {
                    clearInterval(this.interval);
                    this.setState({ importing: false });
                }
            }, () => {
                clearInterval(this.interval);
            });
        }, 3000);
    }

    import(e, rerun) {
        if (e) e.preventDefault();
        var cinfo = { ...this.state.cinfo };
        if (rerun)
            cinfo.isRerun = true;
        this.setState({ saving: true });
        qreq.post('/api/integration/clover/import', cinfo, j => {
            if (j.errorCode === 0) {
                this.enableInterval(j.item.taskID);
            }
            else
                this.alert(j.errorMessage);
            this.setState({ saving: false });
        }, () => {
            this.alert('Unknown error ocurred. Please try again.');
            this.setState({ saving: false });
        });
    }

    connect() {
        Pop.show(<p><L>Navigating to</L> <strong>Stripe Connect</strong> <L>for account setup.</L></p>, 'Loading', true);
        qreq.get('/api/vendor/get/active', j => {
            if (j.item) {
                qreq.post('/api/payout/setup?vendorID=' + j.item.id, {}, j => {
                    if (j.item) {
                        window.location.assign(j.item);
                    }
                    else
                        this.alert(j.errorMessage);
                }, this.unkownErrorCallback);
            }
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    render() {
        return <div className="Import">
            <SubNav />
            <Modal isOpen={this.state.importing}>
                <ModalHeader className="text-center">
                    Connect
                </ModalHeader>
                <ModalBody>
                    <p className="lead text-center">Connecting and importing...Please wait...</p>
                </ModalBody>
            </Modal>
            <h1><L>Connect Bank</L></h1>

            {this.state.loaded ?
                <>
                    <Card>
                        {this.state.stripeStatus && this.state.stripeStatus.active ? <>
                            <h3>Stripe <L>Connected</L></h3>
                            <div className="my-3 border-top"></div>
                            <p><L>Your connection to Stripe is active.</L></p>
                        </> : <>
                            <h3><L>What is</L> Stripe Connect?</h3>
                            <div className="my-3 border-top"></div>
                            <p>Stripe Connect <L>is a powerful platform that enables seamless payment processing, simplified financial management, and enhanced security for your transactions. By connecting your platform to Stripe, you gain access to a robust set of tools and features that streamline payments, reduce friction, and provide a more efficient way to manage funds.</L></p>
                            <div className="mt-3">
                                <button type="button" onClick={() => this.connect()} className="btn btn-lg btn-primary"><Icon icon="faPlug" /> <span><L>Connect Bank</L></span></button>
                            </div>
                        </>}
                    </Card>
                    {this.state.cinfo.isRerun ? <form onSubmit={e => this.import(e, true)}>
                        <Card title="Clover Integration">
                            <h5>Merchant ID</h5>
                            <div className="mb-2">{this.state.cinfo.merchantID}</div>
                            <div className="btn-group mb-2">
                                <button type="submit" className="btn btn-lg btn-primary" disabled={this.state.saving}><L>Re-run Import</L></button>
                                <button type="submit" className="btn btn-lg btn-secondary" disabled={this.state.saving} onClick={() => this.setState({ cinfo: { ...this.state.cinfo, isRerun: false } })}><L>Modify Integration</L></button>
                            </div>
                        </Card>
                    </form>
                        : <form onSubmit={e => this.import(e)} className="d-none">
                            <Card title="Connect with Clover">
                                <div className="mb-4">
                                    <div><button type="button" className="btn btn-lg btn-primary" disabled><L>Connect using</L> Clover OAuth 2.0</button></div>
                                    <div><a href={'https://sandbox.dev.clover.com/oauth/authorize?client_id=TB3WW64X2Y6W2&redirect_uri=' + window.location.href} role="button" className="btn btn-lg btn-primary d-none">Connect using Clover OAuth 2.0</a></div>
                                    <div><small className="text-muted"><L>This will open the Clover website for authorization.</L></small></div>
                                    <div><small className="text-warning"><L>This integration is currently disabled until we get approval from Clover Marketplace.</L></small></div>
                                </div>
                                <div className="d-none">
                                    <FormInput model={this.state.cinfo} name="merchantID" label="Merchant ID" type="text" placeholder="K1FKXJ1E1E1B1" required />
                                    <FormInput model={this.state.cinfo} name="apiToken" label="API Token" type="text" placeholder="1111a111-1111-1111-11aa-1110011aa111" required />
                                    <div className="btn-group mb-2">
                                        <button type="submit" className="btn btn-lg btn-primary" disabled={this.state.saving}><L>Connect</L></button>
                                    </div>
                                </div>
                                <p className="mb-2 text-secondary"><L>Connecting with Clover will automatically import your inventory as your menu.</L></p>
                                {this.state.error ? <Alert type="danger"><L>{this.state.error}</L></Alert> : ''}
                            </Card>
                        </form>}
                </>
                : <LoadingAlert />}
        </div>;
    }
}

export default withParamsAndNavigate(Connect);