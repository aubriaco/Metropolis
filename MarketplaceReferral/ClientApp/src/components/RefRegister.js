import Address from "./Address";
import BaseCom from "./BaseCom";
import Card from "./Card";
import FormInput from "./FormInput";
import L from "./Lang";
import Icon from "./Icon";
import { Link } from 'react-router-dom';
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { qreq } from "../shared/qrequest";
import Alert from "./Alert";
import LoadingAlert from "./LoadingAlert";
import './RefRegister.css';
import Globals from "../shared/Globals";
import LoadingModal from "./LoadingModal";

class RefRegister extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            program: {},
            info: {
                address: {},
                physicalAddress: {},
                referralSurvey: {},
                refAccountInfo: {}
            },
            step: 0,
            success: false,
            processingMsg: null
        };


        this.onSubmit = this.onSubmit.bind(this);
        this.signupEmail = this.signupEmail.bind(this);
        this.filterUsername = this.filterUsername.bind(this);
        this.saveSession = this.saveSession.bind(this);
        this.onFileSelect = this.onFileSelect.bind(this);
        this.onKWMonthChange = this.onKWMonthChange.bind(this);
    }

    componentDidMount() {
        qreq.post('/api/referral/register/session/get', {}, j => {
            if (j.saved) {
                this.setState({ info: j, step: j.step });
            }
            this.setState({ loaded: true });
        }, () => {
            this.setState({ loaded: true });
        });
        qreq.get('/api/referral/program?ident=' + this.props.params.ident, j => {
            if (j.item)
                this.setState({ program: j.item });
        });
        qreq.post('/api/referral/link/get', {}, j => {
            if (j.item)
                this.setState({ info: { ...this.state.info, ...j.item } });
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.step !== this.state.step) {
            this.saveSession({ ...this.state.info }, this.state.step);
            if (this.state.step === 4) {
                this.onKWMonthChange(this.state.info.refAccountInfo.kwhMonth);
            }
        }
    }

    componentWillUnmount() {
        if (this.uploadInterval)
            clearInterval(this.uploadInterval);
    }

    saveSession(info, step) {
        if (!info)
            info = { ...this.state.info };
        if (!step)
            step = this.state.step;
        info.step = step;
        info.saved = true;
        qreq.post('/api/referral/register/session/save', info, j => {
            console.log('Session saved.');
        });
    }

    filterUsername(str) {
        str = str.replace(/[^0-9A-Za-z]/g, '');
        this.setState({ info: { ...this.state.info, username: str } });
    }

    signupEmail(e, info) {
        if (e)
            e.preventDefault();
        if (!info)
            info = this.state.info;
        this.setState({ submitting: true });
        qreq.post('/api/signup/check/email', info, j => {
            if (j.errorCode)
                this.showError(j.errorMessage);
            else {
                this.setState({ step: 2 });
            }
            this.setState({ submitting: false });
        }, () => {
            this.showError(<L>Unknown error ocurred, please try again.</L>);
            this.setState({ submitting: false });
        });
    }


    onSubmit(e) {
        if (e) e.preventDefault();
        if (this.state.step === 5) {
            this.setState({ submitting: true });
            qreq.post('/api/signup/submit/basic', { ...this.state.info, isRefUser: true, isRefClient: true, programID: this.state.program.id }, j => {
                if (j.errorCode)
                    this.showError(j.errorMessage);
                else {
                    qreq.post('/api/auth/login', this.state.info, k => {
                        if (k.errorCode === 0)
                            document.location.replace('/dashboard');
                    });
                    this.state.info.password = null;
                    this.setState({ success: true, info: this.state.info });
                }
                this.setState({ submitting: false });
            }, () => {
                this.showError(<L>Unknown error ocurred, please try again.</L>);
                this.setState({ submitting: false });
            });
        }
        else if (this.state.step === 4) {
            this.setState({ step: 5 });
        }
        else if (this.state.step === 3) {
            this.setState({ step: 4 });
        }
        else if (this.state.step === 2) {
            this.setState({ step: 3 });            
        }
        else if (this.state.step === 1) {
            if (!this.state.info.fullName)
                this.showError('Full Name is blank.');
            else {
                var fullName = this.state.info.fullName.toLowerCase();
                var n = fullName.indexOf(' ');
                if (n < 0)
                    this.showError('Full Name must have First and Last Name.');
                else {
                    var firstName = fullName.substr(0, n);
                    var lastName = fullName.substr(n + 1);
                    if (firstName.length < 2)
                        this.showError('First Name must be valid. At least 2 characters.')
                    else if (lastName.length < 2)
                        this.showError('Last Name must be valid. At least 2 characters.')
                    else {
                        this.state.info.firstName = firstName;
                        this.state.info.lastName = lastName;
                        this.setState({ info: this.state.info });
                        this.signupEmail();
                    }
                }
            }
        }
    }


    onFileSelect(e) {

        e.preventDefault();
        this.setState({ uploading: true, submitting: true });

        var f = e.target.files[0];

        var reader = new FileReader();
        reader.readAsBinaryString(f);
        reader.onload = () => {
            var b64data = btoa(reader.result);
            var v = {
                base64Content: b64data, fileType: f.type, fileSize: f.size, fileName: f.name, originalFileName: f.name, mimeType: f.type
            };

            qreq.post('/api/referral/register/pdf/upload', v, k => {
                if (k.item) {
                    this.uploadInterval = setInterval(() => {
                        qreq.get('/api/referral/register/pdf/upload/status?ident=' + k.item, j => {
                            if (j.item) {
                                j.item.refAccountInfo.utilityBillFile = v;
                                var info = { ...this.state.info };
                                for (var k in j.item) {
                                    if (j.item[k])
                                        info[k] = j.item[k];
                                }
                                if (!info.fullName)
                                    info.fullName = j.item.name;
                                this.setState({ step: 1, info: info, processingMsg: null });
                            }
                            else if (j.errorCode === 10) {
                                this.setState({ processingMsg: j.errorMessage });
                                console.log('Status check.');
                                return;
                            }
                            else {
                                if (window.confirm(Globals.getLang('We failed on parsing your document. Would you like to continue to the manual process?')))
                                    this.setState({ step: 1 });
                            }
                            this.setState({ submitting: false, uploading: false });
                            clearInterval(this.uploadInterval);
                        }, () => {
                            if (window.confirm(Globals.getLang('We failed on parsing your document. Would you like to continue to the manual process?')))
                                this.setState({ step: 1 });
                            this.setState({ submitting: false, uploading: false });
                        });
                    }, 2000);       
                }
                else {
                    if (window.confirm(Globals.getLang('We failed on parsing your document. Would you like to continue to the manual process?')))
                        this.setState({ step: 1 });
                    this.setState({ submitting: false, uploading: false });
                }                
            }, () => {
                if (window.confirm(Globals.getLang('We failed on parsing your document. Would you like to continue to the manual process?')))
                    this.setState({ step: 1 });
                this.setState({ submitting: false, uploading: false });
            });
            e.target.value = '';
        };
        reader.onerror = (error) => {
            console.log('Error: ', error);
            this.setState({ uploading: false });
            e.target.value = '';
        };


    }

    onKWMonthChange(val) {
        if (!val) {
            this.setState({ recommendedProduct: null });
            return;
        }
        qreq.get('/api/referral/product/recommend?monthlyProduction=' + val, j => {
            this.setState({ recommendedProduct: j.item ?? null });
        });
    }

    render() {

        if (!this.state.loaded)
            return <LoadingAlert />;

        if (this.state.success) {
            return <div className="container RefRegister">
                <Card title="Success">
                    <p><L>Remember to check your email</L> <strong>{this.state.info.email}</strong> <L>to validate your account. Rewards can not be dispatched to invalid accounts.</L></p>
                    <div className="d-grid">
                        <Link to="/dashboard" role="button" className="btn btn-primary btn-lg"><L>Continue to Dashboard</L> <Icon icon="faDashboard" /></Link>
                    </div>
                </Card>
            </div>;
        }
        return <div className="RefRegister">
            <LoadingModal show={this.state.uploading} message={Globals.getLang('Your request is currently processing. Please wait...')} note={this.state.processingMsg} />
            {this.state.step === 0 ?
                <section className="plans my-5">
                    <div className="container-lg p-4">
                        <div className="row row-cols-md-4 row-cols-1">
                            <div className="col p-3 text-center hot">
                                <div className="line"><span className="badge fav"><L>Customer's Favorite</L></span></div>
                                <h4 className="head"><L>Monthly Lease</L></h4>
                                <hr />
                                <div className="line"><span className="badge bg-primary text-uppercase" role="button" onClick={() => document.getElementById('RefRegister-form').scrollIntoView()}><L>Register Below</L></span></div>
                                <div className="line"><L>Low upfront cost</L></div>
                                <div className="line"><L>Sunrun</L></div>
                                <div className="line"><L>$0 to little down</L></div>
                                <div className="line"><L>Monthly Payment to Sunrun</L></div>
                                <div className="line"><Icon icon="faCheck" className="text-success" /> Rate Hike Protection</div>
                                <div className="line"><Icon icon="faCheck" className="text-success" /> Warranty</div>
                                <div className="line"><Icon icon="faCheck" className="text-success" /> Full Service</div>
                            </div>
                            <div className="col p-3 text-center">
                                <div className="line">&nbsp;</div>
                                <h4 className="head"><L>Full Lease</L></h4>
                                <hr />
                                <div className="line"><span className="badge bg-secondary text-uppercase" role="button" onClick={() => document.getElementById('RefRegister-form').scrollIntoView()}><L>Register Below</L></span></div>
                                <div className="line"><L>Pay now, save later</L></div>
                                <div className="line"><L>Sunrun</L></div>
                                <div className="line"><L>~25 years of energy cost upfront</L></div>
                                <div className="line"><Icon icon="faTimes" className="text-secondary" /> <L>Monthly Payment</L></div>
                                <div className="line"><Icon icon="faCheck" className="text-success" /> Rate Hike Protection</div>
                                <div className="line"><Icon icon="faCheck" className="text-success" /> Warranty</div>
                                <div className="line"><Icon icon="faCheck" className="text-success" /> Full Service</div>
                            </div>
                            <div className="col p-3 text-center">
                                <div className="line">&nbsp;</div>
                                <h4 className="head"><L>Full Purchase</L></h4>
                                <hr />
                                <div className="line"><span className="badge bg-secondary text-uppercase" role="button" onClick={() => document.getElementById('RefRegister-form').scrollIntoView()}><L>Register Below</L></span></div>
                                <div className="line"><L>Own your system outright</L></div>
                                <div className="line"><L>Homeowner</L></div>
                                <div className="line"><L>Full system cost upfront</L></div>
                                <div className="line"><Icon icon="faTimes" className="text-secondary" /> <L>Monthly Payment</L></div>
                                <div className="line"><Icon icon="faCheck" className="text-success" /> Rate Hike Protection</div>
                                <div className="line"><Icon icon="faCheck" className="text-success" /> Warranty</div>
                                <div className="line"><Icon icon="faCheck" className="text-success" /> Protection Plus</div>
                            </div>
                            <div className="col p-3 text-center">
                                <div className="line">&nbsp;</div>
                                <h4 className="head"><L>Monthly Loan</L></h4>
                                <hr />
                                <div className="line"><span className="badge bg-secondary text-uppercase" role="button" onClick={() => document.getElementById('RefRegister-form').scrollIntoView()}><L>Register Below</L></span></div>
                                <div className="line"><L>Own your system outright</L></div>
                                <div className="line"><L>Homeowner</L></div>
                                <div className="line"><L>$0 down</L></div>
                                <div className="line"><L>Monthly Payment to Load Provider</L></div>
                                <div className="line"><Icon icon="faCheck" className="text-success" /> Rate Hike Protection</div>
                                <div className="line"><Icon icon="faCheck" className="text-success" /> Warranty</div>
                                <div className="line"><Icon icon="faCheck" className="text-success" /> Protection Plus</div>
                            </div>
                        </div>
                    </div>
                </section> : ''}
            <div className="container">
            <h1 className="text-center">{this.state.program.name}</h1>
                <form onSubmit={this.onSubmit} id="RefRegister-form">
                {this.state.step === 0 ? <>
                    <Card title="Select registration method">
                        <div className="my-2 mb-4 text-center">
                            <img src="/img/ref-program/home-power/home-power-logo.png" alt="" className="img-fluid" style={{ maxWidth: '300px' }} />
                        </div>
                        <div className="d-grid gap-2 text-center">
                            <button type="button" className="btn btn-primary btn-lg" onClick={() => this.setState({ step: 'pdf-a' })}><Icon icon="faUpload" /> <L>Upload Energy Bill PDF</L></button>
                            <small className="text-muted d-block mb-2"><L>The information will be automatically collected from your utility bill to prepare your plan.</L></small>
                            <button type="button" className="btn btn-secondary btn-lg" onClick={() => this.setState({ step: 1 })}><Icon icon="faKeyboard" /> <L>Enter Information Manually</L></button>
                            <small className="text-muted d-block mb-2"><L>Input all the information. You will still be required to upload at least a scan of the utility bill.</L></small>
                        </div>
                    </Card>
                </> : this.state.step === 'pdf-a' ? <>
                    <Card title="Where to get the utility bill PDF">
                        <div className="d-none d-md-block">
                            <div className="row row-cols-1 text-center gy-4 tutorial">
                                <div className="col">
                                    <p>1. <L>Visit </L> <a href="https://miluma.lumapr.com/" target="_blank">https://miluma.lumapr.com/</a> <L>and log in to your account.</L></p>
                                    <img src="/img/ref-program/utility-tutorial/desktop/1.png" alt="" className="img-fluid" />
                                </div>
                                <div className="col">
                                    <p>2. <L>Go to the utility bill invoice history menu.</L></p>
                                    <img src="/img/ref-program/utility-tutorial/desktop/2.png" alt="" className="img-fluid" />
                                </div>
                                <div className="col">
                                    <p>3. <L>Download the latest utility bill invoice.</L></p>
                                    <img src="/img/ref-program/utility-tutorial/desktop/3.png" alt="" className="img-fluid" />
                                </div>
                            </div>
                        </div>
                        <div className="d-block d-md-none">
                                <div className="row row-cols-1 text-center gy-4 tutorial">
                                    <div className="col">
                                        <p>1. <L>Visit </L> <a href="https://miluma.lumapr.com/" target="_blank">https://miluma.lumapr.com/</a> <L>and log in to your account.</L></p>
                                        <img src="/img/ref-program/utility-tutorial/mobile/1.png" alt="" className="img-fluid" />
                                    </div>
                                    <div className="col">
                                        <p>2. <L>Go to the utility bill invoice history menu.</L></p>
                                        <img src="/img/ref-program/utility-tutorial/mobile/2.png" alt="" className="img-fluid" />
                                    </div>
                                    <div className="col">
                                        <p>3. <L>Download the latest utility bill invoice.</L></p>
                                        <img src="/img/ref-program/utility-tutorial/mobile/3.png" alt="" className="img-fluid" />
                                    </div>
                                    <div className="col">
                                        <p>4. <L>Click on the share action icon.</L></p>
                                        <img src="/img/ref-program/utility-tutorial/mobile/4.png" alt="" className="img-fluid" />
                                    </div>
                                    <div className="col">
                                        <p>5. <L>Select "Save to Files".</L></p>
                                        <img src="/img/ref-program/utility-tutorial/mobile/5.png" alt="" className="img-fluid" />
                                    </div>
                            </div>
                        </div>

                            <small className="text-muted d-block mt-4 text-center"><L>Please make sure you select a valid PDF file downloaded directly from the utility portal.</L></small>
                            <div className="d-none"><input type="file" id={'c-upload-pdf'} onChange={this.onFileSelect} /></div>
                            <div className="d-grid mt-2">
                                <button type="button" className="btn btn-primary btn-lg" onClick={() => document.getElementById('c-upload-pdf').click()} disabled={this.state.submitting}><Icon icon="faFilePdf" /> <L>Select Utility Invoice PDF File</L></button>
                        </div>
                        <a onClick={() => this.setState({ step: 0 })} className="d-block p-3 my-3 text-center" role="button" disabled={this.state.submitting}><Icon icon="faArrowLeft" /> <L>Go back to previous step</L></a>
                    </Card>
                </> : this.state.step === 1 ? <>
                    <Card title="Your information">
                        <div className="row row-cols-1 row-cols-md-2">
                            <div className="col">
                                <FormInput model={this.state.info} name="fullName" label="Your full name" placeholder="Jose Rodriguez" type="text" required size="lg" />
                            </div>
                            <div className="col">
                                <FormInput model={this.state.info} name="phone" label="Your phone number" placeholder="(XXX) XXX-XXXX" type="tel" required size="lg" />
                            </div>
                            <div className="col">
                                <FormInput model={this.state.info} name="email" label="Your email address" placeholder="myemail@provider.com" type="email" optional size="lg" />
                            </div>
                        </div>
                    </Card>
                    <small className="d-block mb-3 text-muted"><L>Please fill in the precise information. Your reward will be sent under this name. We are not responsible if you can not cash out your reward due to incorrect information.</L></small>
                    <button type="submit" className="btn btn-primary btn-lg d-block w-100" disabled={this.state.submitting}><L>Next</L> <Icon icon="faArrowRight" /></button>
                    <a onClick={() => this.setState({ step: (this.state.step - 1) })} className="d-block p-3 my-3 text-center" role="button" disabled={this.state.submitting}><Icon icon="faArrowLeft" /> <L>Go back to previous step</L></a>
                </> : this.state.step === 2 ? <>
                    <Address item={this.state.info.address} title="Postal address" required />
                    <small className="d-block mb-3 text-muted"><L>This is where you can receive correspondence.</L></small>
                    <button type="submit" className="btn btn-primary btn-lg d-block w-100" disabled={this.state.submitting}><L>Next</L> <Icon icon="faArrowRight" /></button>
                    <a onClick={() => this.setState({ step: (this.state.step - 1) })} className="d-block p-3 my-3 text-center" role="button" disabled={this.state.submitting}><Icon icon="faArrowLeft" /> <L>Go back to previous step</L></a>
                            </> : this.state.step === 3 ? <>
                                <Address item={this.state.info.physicalAddress} title="Physical address" required />
                                <small className="d-block mb-3 text-muted"><L>The physical address where the installation will occur.</L></small>
                                <button type="submit" className="btn btn-primary btn-lg d-block w-100" disabled={this.state.submitting}><L>Next</L> <Icon icon="faArrowRight" /></button>
                                <a onClick={() => this.setState({ step: (this.state.step - 1) })} className="d-block p-3 my-3 text-center" role="button" disabled={this.state.submitting}><Icon icon="faArrowLeft" /> <L>Go back to previous step</L></a>
                                </> : this.state.step === 4 ? <>
                                        <Card title="Power consumption information">
                                            <FormInput model={this.state.info.refAccountInfo} name="hasNoService" label="I currently do not have a power utility provider." type="switch" size="lg" onChange={() => this.setState({ info: this.state.info })} />
                                            {!this.state.info.refAccountInfo.hasNoService ? <>
                                                <FormInput model={this.state.info.refAccountInfo} name="accountNumber" label="Utility Account Number" type="text" placeholder="0000000000" required size="lg" />
                                                <div className="row row-cols-1 row-cols-md-2">
                                                    <div className="col">
                                                            <FormInput model={this.state.info.refAccountInfo} name="kwhMonth" label="kWh on Month" type="number" step="1" placeholder="0" required size="lg" onChange={this.onKWMonthChange} />
                                                    </div>
                                                    <div className="col">
                                                        <FormInput model={this.state.info.refAccountInfo} name="costMonth" label="Invoice Cost Month" type="number" step="0.01" placeholder="0.00" required size="lg" />
                                                    </div>
                                                    </div>
                                                    {this.state.recommendedProduct ? <div className="recommended p-3 bg-light">
                                                        <h4>{this.state.recommendedProduct.manufacturer}</h4>
                                                        <div className="text-primary">{this.state.recommendedProduct.panelCount} {this.state.recommendedProduct.panelCount > 1 ? <L>Solar Panels</L> : <L>Solar Panel</L>} {this.state.recommendedProduct.batteryCount} {this.state.recommendedProduct.batteryCount > 1 ? <L>Batteries</L> : <L>Battery</L>}</div>
                                                        <div className="text-secondary"><L>Estimate Price:</L> {Globals.getFormatter().format(this.state.recommendedProduct.cashPrice)}</div>
                                                        <div><L>Finance Estimate:</L> {Globals.getFormatter().format(this.state.recommendedProduct.cashPrice / (12 * 15))}/month (15 years) <span className="text-muted">*</span></div>
                                                        <small className="d-block text-muted"><i><L>* Only an estimate. The price might vary depending on your credit score or financial institution.</L></i></small>
                                                    </div> : ''}
                                            </> : ''}
                                        </Card>
                                        <button type="submit" className="btn btn-primary btn-lg d-block w-100" disabled={this.state.submitting}><L>Next</L> <Icon icon="faArrowRight" /></button>
                                        <a onClick={() => this.setState({ step: (this.state.step - 1) })} className="d-block p-3 my-3 text-center" role="button" disabled={this.state.submitting}><Icon icon="faArrowLeft" /> <L>Go back to previous step</L></a>
                                    </> : this.state.step === 5 ? <>
                    <Card title="Your login information">
                        <p><Icon icon="faUser" /> <L>You will be able to see the status of your inquiry using these credentials.</L></p>
                        <div className="row">
                            <div className="col-12 mb-3">
                                <FormInput model={this.state.info} name="username" label="Username" placeholder="myusername" type="text" required size="lg" onChange={obj => this.filterUsername(obj)} />
                                <small className="text-muted"><L>Must be at least 3 characters long. Only letters and/or numbers.</L></small>
                            </div>
                            <div className="col-12 mb-3">
                                <FormInput model={this.state.info} name="password" label="Password" placeholder="********" type="password" required size="lg" />
                                <small className="text-muted"><L>Must be at least 8 characters long, must contain at least 1 digit and 1 symbol.</L></small>
                            </div>
                        </div>
                    </Card>
                    
                    <small className="d-block mb-3"><L>By registering you agree to our</L> <a href="#" onClick={e => { e.preventDefault(); this.setState({ showTOSModal: true }); }}><L>Terms of Service</L></a> <L>and</L> <a href="#" onClick={e => { e.preventDefault(); this.setState({ showPrivacyPolicyModal: true }); }}><L>Privacy Policy.</L></a></small>
                    <button type="submit" className="btn btn-primary btn-lg d-block w-100" disabled={this.state.submitting}><L>Complete</L> <Icon icon="faArrowRight" /></button>
                    <a onClick={() => this.setState({ step: (this.state.step - 1) })} className="d-block p-3 my-3 text-center" role="button" disabled={this.state.submitting}><Icon icon="faArrowLeft" /> <L>Go back to previous step</L></a>

                </> : ''}
                {this.state.error ? <Alert type="danger" className="mt-2"><L>{this.state.error}</L></Alert> : ''}
                </form>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(RefRegister);