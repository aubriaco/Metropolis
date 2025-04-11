import BaseCom from "./BaseCom";
import L from "./Lang";
import Card from "./Card";
import FormInput from "./FormInput";
import YesNoInput from "./YesNoInput";
import UploadPad from "./UploadPad";
import { qreq } from "../shared/qrequest";
import { Link } from 'react-router-dom';
import './SellVehicle.css';
import RegisterCardModal from "./RegisterCardModal";
import { Modal, ModalBody } from 'reactstrap';
import { Helmet } from "react-helmet";
import Globals from "../shared/Globals";
import TOSModal from "./TOSModal";
import Alert from "./Alert";
import Auth from "../shared/Auth";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import colors from '../json/colors.json';
import NativeNav from "./NativeNav";

class SellAppliance extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            item: {},
            types: [],
            conditions: []
        };
        this.load = this.load.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onSubmitVerify = this.onSubmitVerify.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(j => {
            this.setState({ user: j });
            if (j)
                this.load();
            else
                this.props.navigate('/sell');
        });
    }

    load() {
        qreq.get('/api/auction/appliance/type/list', j => {
            if (j.list)
                this.setState({ types: j.list });
        });
        qreq.get('/api/auction/appliance/condition/list', j => {
            if (j.list) {
                j.list.forEach(i => {
                    i.name = Globals.getLang(i.name);
                });
                this.setState({ conditions: j.list });
            }
        });
        qreq.get('/api/auction/appliance/fees', j => {
            if (j.item) {
                this.setState({ applianceFees: j.item });
            }
        });
    }

    onSubmitVerify(e) {
        if (e)
            e.preventDefault();

        this.setState({ submitting: true });
        qreq.post('/api/user/agreement/check', { documentName: 'TOSSellers' }, r => {
            if (r.errorCode === 0)
                this.onSubmit();
            else if (r.errorCode === 10)
                this.setState({ showTOSModal: true });
            else
                this.alert(r.errorMessage);
            this.setState({ submitting: false });
        }, e => {
            console.log('exception', e);
            this.alert('An unknown error ocurred. Please try again.');
            this.setState({ submitting: false });
        });
    }

    onSubmit(e, bypassCardVerification) {
        if (e)
            e.preventDefault();

        const showElementError = (id, message) => {
            var upElement = document.getElementById(id);
            upElement.scrollIntoView();
            var em3 = document.createElement('div');
            em3.className = 'alert alert-warning mt-2';
            em3.innerHTML = message;
            upElement.appendChild(em3);
            setTimeout(() => {
                em3.style.transition = '1s';
                em3.style.opacity = '0';
                setTimeout(() => em3.remove(), 1000);
            }, 3000);
        };


        if (!this.state.item.postalCode || this.state.item.postalCode.length !== 5 || this.state.item.postalCode.replace(/[0-9]/g, '').length !== 0) {
            showElementError('SellVehicle-postalCode', Globals.getLang('Invalid postal code.'));
            return;
        }

        var inputs = document.querySelectorAll('.ButtonInput');

        for (var n = 0; n < inputs.length; n++) {
            var i = inputs[n];
            var name = i.getAttribute('data-name');
            if (!this.state.item[name]) {
                var bi = document.getElementById('ButtonInput-' + name);
                bi.scrollIntoView();
                var em = document.createElement('div');
                em.className = 'alert alert-warning mt-2';
                em.innerHTML = 'Please select one of the above.';
                bi.appendChild(em);
                // eslint-disable-next-line no-loop-func
                setTimeout(() => {
                    em.style.transition = '1s';
                    em.style.opacity = '0';
                    setTimeout(() => em.remove(), 1000);
                }, 3000);
                return;
            }
        }

        if (this.state.item._selectedStart === 'True') {
            var dt = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);
            dt.setHours(0);
            dt.setMinutes(0);
            dt.setSeconds(0);
            try {
                if (Date.parse(this.state.item.selectedStartDate) <= dt) {
                    showElementError('date-selectedStart', 'Please select a date in the future.');
                    return;
                }
            }
            catch { }
        }

        /*
        var uploaders = ['_idFileData'];

        for (var v of uploaders) {
            if (!this.state.item[v]) {
                showElementError('upload-' + v, 'Please select a file or image.');
                return;
            }
        }
        */

        if (!this.state.item.photos || this.state.item.photos.length < 2) {
            var upElement = document.getElementById('SellVehicle-photos');
            upElement.scrollIntoView();
            var em3 = document.createElement('div');
            em3.className = 'alert alert-warning mt-2';
            em3.innerHTML = 'Please upload at least 2 photos.';
            upElement.appendChild(em3);
            setTimeout(() => {
                em3.style.transition = '1s';
                em3.style.opacity = '0';
                setTimeout(() => em3.remove(), 1000);
            }, 3000);
            return;
        }


        this.setState({ submitting: true });

        if (!bypassCardVerification) {
            qreq.get('/api/payment/card/list', j => {
                this.setState({ submitting: false });
                if (j.list) {
                    if (j.list.length === 0)
                        this.setState({ showRegisterCard: true });
                    else
                        this.onSubmit(null, true);
                }
            }, () => {
                this.alert('An error ocurred while submitting. Please try again.');
                this.setState({ submitting: false });
            });
            return;
        }

        var photos = [...this.state.item.photos];
        photos.forEach(i => {
            i.base64Content = null;
        });

        this.setState({ showSubmittingModal: true });

        qreq.post('/api/auction/appliance/submit', { ...this.state.item, photos: photos }, j => {
            if (j.item)
                this.setState({ success: true, submitting: false, showSubmittingModal: false });
            else {
                this.alert('An error has ocurred. Please try again or contact tech support.');
                this.setState({ submitting: false, showSubmittingModal: false });
            }
        }, () => {
            this.alert('An error has ocurred. Please try again or contact tech support.');
            this.setState({ submitting: false, showSubmittingModal: false });
        });

    }


    render() {
        if (!this.state.user)
            return <></>;

        if (this.state.success) {
            return <><Helmet>
                <title>Bidea Online | {Globals.getLang('Sell appliance')}</title>
            </Helmet><div className="container-narrow">
                    <form onSubmit={this.onSubmit}>
                        <h1><L>Submission successful</L></h1>
                        <p><L>Thank you for submitting your application. Our team will review it promptly, and you can expect a response within one business day. Once your application is approved you will receive en email.</L></p>
                    </form>
                    <div className="mt-2 mb-4">
                        <Link to="/" role="button" className="btn btn-success btn-lg">Back to Home Page</Link>
                    </div>
                </div>
            </>;
        }


        return <><Helmet>
            <title>Bidea Online | {Globals.getLang('Sell appliance')}</title>
        </Helmet>
            <TOSModal type="TOSSellers" show={this.state.showTOSModal} onToggle={() => { this.setState({ showTOSModal: false }); if (this.props.onToggle) this.props.onToggle(); }} onSuccess={() => { this.setState({ showTOSModal: false }); this.onSubmitVerify(); }} />
            <RegisterCardModal show={this.state.showRegisterCard} onToggle={() => { this.setState({ showRegisterCard: false }); if (this.props.onToggle) this.props.onToggle(); }} onSuccess={() => { this.setState({ showRegisterCard: false }); this.onSubmit(null, true); }} seller />
            <Modal isOpen={this.state.showSubmittingModal}>
                <ModalBody>
                    <div className="p-5">
                        <div className="text-center">
                            <h1><L>Submitting...</L></h1>
                            <p><L>Please wait while we submit your request.</L></p>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
            <NativeNav show={Globals.mobileView} />
            <div className="container-narrow sell-appliance">
                <h1><L>Provide us with information about your item</L></h1>
                <p><L>Kindly provide us with essential information about yourself and the item you intend to sell.</L></p>
                <p><L>You can expect a response to your application within one business day. Once your application is approved, you will receive an email.</L></p>
                <form onSubmit={this.onSubmit}>
                    <Card title="Item type">
                        <div className="row align-items-center">
                            {this.state.types.map(i => <div key={i.id} className="col-4 col-md-3 mt-2">
                                <div className={'p-1 p-md-3 btn text-center d-block w-100 ' + (this.state.item.applianceTypeID === i.id ? 'btn-primary' : 'btn-light')} role="button" onClick={() => this.setState({ item: { ...this.state.item, applianceType: i, applianceTypeID: i.id } })}>
                                    <img src={'/img/sell/type/appliance/' + i.name.toLowerCase().replace(/ /g, '-') + '.png'} alt="" className="img-fluid d-block mx-auto" style={{ maxHeight: '80px' }} />
                                    {Globals.getLang(i.name)}
                                </div>
                            </div>)}
                        </div>
                    </Card>
                    {this.state.item.applianceTypeID ? <>
                        <Card title="Contact info">
                            <div className="row mb-2">
                                <div className="col-md">
                                    <FormInput model={this.state.item} name="fullName" label="Your full name" type="text" required />
                                </div>
                                <div className="col-md">
                                    <FormInput model={this.state.item} name="contactPhone" label="Phone number" type="tel" required />
                                </div>
                            </div>
                            <FormInput model={this.state.item} name="postalCode" label="Zip code where item is located" type="text" style={{ maxWidth: '100px' }} required />
                            <div id="SellVehicle-postalCode"></div>
                        </Card>
                        <Card title="Item info">
                            <div className="row mb-2">
                                <div className="col-md">
                                    <FormInput model={this.state.item} name="name" label="A short description of what you are selling" type="text" required />
                                    <p><L>This will be the auction title.</L></p>
                                </div>
                            </div>
                        </Card>
                        {this.state.item.applianceType.name === 'Computers' ? <>
                            <Card title="Computer info">
                                <FormInput model={this.state.item} name="applianceSubType" label="Computer type" type="select" options={[
                                    { id: 'Laptop', name: 'Laptop' },
                                    { id: 'Desktop', name: 'Desktop' },
                                    { id: 'All-in-One', name: 'All-in-One' },
                                    { id: 'Embedded', name: 'Embedded' },
                                    { id: 'Other', name: 'Other' }
                                ]} required />
                                <div className="row mb-2">
                                    <div className="col-md">
                                        <FormInput model={this.state.item} name="make" label="Computer brand" type="text" required />
                                    </div>
                                    <div className="col-md">
                                        <FormInput model={this.state.item} name="model" label="Computer model" type="text" required />
                                    </div>
                                </div>
                                <div className="row mb-2">
                                    <div className="col-md">
                                        <FormInput model={this.state.item} name="color" label="Laptop or computer case color" type="select" options={colors.list} required />
                                    </div>
                                </div>
                            </Card>
                        </> : ''}
                        <Card title="Condition">
                            <FormInput model={this.state.item} name="conditionTypeID" label="In what condition is this item?" type="select" options={this.state.conditions} />
                        </Card>
                        <Card title="Description">
                            <FormInput model={this.state.item} name="description" label="A detailed description of the item" type="textarea" inputStyle={{ height: '200px' }} required onChange={() => this.setState({ item: this.state.item })} />
                            <p className="d-none"><L>Must have at least 200 characters. Current count:</L> <span>{this.state.item.description ? this.state.item.description.length : '0'}</span></p>
                            <p><L>Note: Please provide a detailed description of the item you are selling, including its brand, model, condition, specifications, and any other relevant information. The more information you provide, the better equipped potential buyers will be to make informed decisions. Clear and accurate descriptions help create a transparent and trustworthy auction environment.</L></p>
                        </Card>
                        <Card title="Reserve price">
                            <p><i><L>The reserve price represents the minimum amount required for your item to be sold, and it is kept confidential. Please note that articles with reserve prices may attract comparatively less interest than those without reserves.</L></i></p>
                            <YesNoInput item={this.state.item} name="_reservePriceEnabled" label="Do you want to set a minimum price required for your article to sell?" onChange={() => this.setState({ item: this.state.item })} />
                            {this.state.item._reservePriceEnabled === 'True' ?
                                <FormInput model={this.state.item} name="reservePrice" label="What reserve price would you like (USD)?" type="number" step="0.01" preAddon="$" style={{ maxWidth: '150px' }} required /> : ''}
                        </Card>
                        <Card title="Auction settings">
                            <p><L>The time the auction will be active. Once it ends, you and the winner will receive an email with each others contact details.</L></p>
                            <label><L>* How much time should the auction run?</L></label>
                            <div className="mb-4 mt-2 ButtonInput" id="ButtonInput-runTimeHours" data-name="runTimeHours">
                                <button type="button" className={'btn' + (this.state.item.runTimeHours === 24 ? ' btn-success' : ' btn-secondary')} onClick={() => { var item = { ...this.state.item }; item.runTimeHours = 24; this.setState({ item: item }) }}>1 Day</button>
                                <button type="button" className={'btn ms-2' + (this.state.item.runTimeHours === 48 ? ' btn-success' : ' btn-secondary')} onClick={() => { var item = { ...this.state.item }; item.runTimeHours = 48; this.setState({ item: item }) }}>2 Days</button>
                                <button type="button" className={'btn ms-2' + (this.state.item.runTimeHours === 96 ? ' btn-success' : ' btn-secondary')} onClick={() => { var item = { ...this.state.item }; item.runTimeHours = 96; this.setState({ item: item }) }}>4 Days</button>
                                <button type="button" className={'btn ms-2' + (this.state.item.runTimeHours === 168 ? ' btn-success' : ' btn-secondary')} onClick={() => { var item = { ...this.state.item }; item.runTimeHours = 168; this.setState({ item: item }) }}>7 Days</button>
                            </div>
                            <YesNoInput item={this.state.item} name="_selectedStart" label="Do you want to use a specific start date?" onChange={() => this.setState({ item: this.state.item })} />
                            {this.state.item._selectedStart === 'True' ? <FormInput model={this.state.item} name="selectedStartDate" label="Auction Start Date" type="date" required /> : ''}
                            <div id="date-selectedStart"></div>
                        </Card>
                        <Card title="Photos">
                            <p><L>Kindly provide a minimum of two photos showcasing the item.</L></p>
                            <UploadPad item={this.state.item} name="photos" onUploadBegin={() => this.setState({ uploading: true })} onUploadEnd={() => this.setState({ uploading: false })} />
                            <div id="SellVehicle-photos"></div>
                        </Card>
                        <div className="mt-2 mb-2">
                            <h2><L>How do I get paid?</L></h2>
                            <p><L>You will get a credit transfer to your debit card (if your bank supports it) or a check under your name to the mailing address in your profile.</L></p>
                            <p><L>The service charge of</L> <i>{this.state.applianceFees.buyersPercent}%</i> <L>will be automatically deducted from the final bid. There is no charge required up-front.</L></p>
                            {!this.state.user.firstName || !this.state.user.lastName || !this.state.user.phone ? <p><L>Once you click submit below you will be requested for your personal and mailing information.</L></p> : ''}
                        </div>
                        <div className="mt-2 mb-4">
                            <button type="submit" className="btn btn-success btn-lg" disabled={this.state.submitting || this.state.uploading}>Submit</button>
                        </div>
                        {this.state.uploading ? <Alert type="info" message="Images are still uploading." /> : ''}
                    </> : ''}
                </form>
            </div>
        </>;
    }
}

export default withParamsAndNavigate(SellAppliance);