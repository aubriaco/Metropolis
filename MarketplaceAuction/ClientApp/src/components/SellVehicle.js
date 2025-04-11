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
import UserInfoModal from "./UserInfoModal";
import NativeNav from "./NativeNav";

class SellVehicle extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            item: {},
            salesRanges: [],
            years: [],
            transmissions: [
                { id: 'All', name: 'All' },
                { id: 'Automatic', name: 'Automatic' },
                { id: 'Manual', name: 'Manual' }
            ],
            titleStatuses: []
        };

        var salesRangesList = [
            'Less than 10',
            '10 - 50',
            '50 - 100',
            'More than 100'
        ];

        var titleStatusList = [
            'Clean',
            'Salvage',
            'Rebuilt',
            'No actual image',
            'Manufacturer buyback'
        ];

        salesRangesList.forEach(i => {
            this.state.salesRanges.push({ id: i, name: i });
        });

        titleStatusList.forEach(i => {
            this.state.titleStatuses.push({ id: i, name: i });
        });

        for (var n = Number(new Date().getFullYear()); n >= 1981; n--) {
            this.state.years.push({ id: n, name: n });
        }

        this.onSubmit = this.onSubmit.bind(this);
        this.onSubmitVerify = this.onSubmitVerify.bind(this);
        this.checkVIN = this.checkVIN.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(j => {
            if (!j)
                this.props.navigate('/sell');
            this.setState({ user: j });
        });
    }

    onSubmitVerify(e) {
        if (e)
            e.preventDefault();
        this.setState({ submitting: true });
        qreq.post('/api/user/agreement/check', { documentName: 'TOSSellers' }, r => {
            if (r.errorCode === 0) {
                Auth.getLogin(j => {
                    if (j && (!j.firstName || !j.lastName || !j.phone))
                        this.setState({ showUserInfoModal: true });
                    else
                        this.onSubmit();
                    this.setState({ submitting: false });
                });
            }
            else if (r.errorCode === 10) {
                this.setState({ showTOSModal: true, submitting: false });
            }
            else {
                this.alert(r.errorMessage);
                this.setState({ submitting: false });
            }
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

        if (!this.state.validVIN) {
            var vinInput = document.getElementById('vin');
            vinInput.scrollIntoView();
            var em2 = document.createElement('div');
            em2.className = 'alert alert-warning mt-2';
            em2.innerHTML = 'VIN is invalid.';
            vinInput.appendChild(em2);
            setTimeout(() => {
                em2.style.transition = '1s';
                em2.style.opacity = '0';
                setTimeout(() => em2.remove(), 1000);
            }, 3000);
            return;
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

        var uploaders = ['_idFileData', '_licenseFileData', '_registrationFileData'];

        for (var v of uploaders) {
            if (((v === '_idFileData' || v === '_registrationFileData') && this.state.item.sellerType === 'Private party')
                || (v === '_licenseFileData' && this.state.item.sellerType === 'Dealer')) {
                if (!this.state.item[v]) {
                    showElementError('upload-' + v, 'Please select a file or image.');
                    return;
                }
            }
        }

        if (!this.state.item.photos || this.state.item.photos.length < 8) {
            var upElement = document.getElementById('SellVehicle-photos');
            upElement.scrollIntoView();
            var em3 = document.createElement('div');
            em3.className = 'alert alert-warning mt-2';
            em3.innerHTML = 'Please upload at least 8 photos.';
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
            if (this.state.item.sellerType === 'Private party') {
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
        }

        var photos = [...this.state.item.photos];
        photos.forEach(i => {
            i.base64Content = null;
        });

        this.setState({ showSubmittingModal: true });

        qreq.post('/api/vehicle/submit', { ...this.state.item, idFileData: JSON.stringify(this.state.item._idFileData), licenseFileData: JSON.stringify(this.state.item._licenseFileData), registrationFileData: JSON.stringify(this.state.item._registrationFileData), photos: photos }, j => {
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

    checkVIN() {
        this.setState({ validVIN: false });
        if (!this.state.item.vin || this.state.item.vin.length < 17 || !this.state.item.year)
            return;

        qreq.get('/api/vehicle/vin/decode?vin=' + this.state.item.vin + '&year=' + this.state.item.year, j => {
            if (j.item) {
                var item = { ...this.state.item };
                item.make = j.item.make;
                item.model = j.item.model;
                item.vinInfo = j.item.vinInfo;
                this.setState({ item: item, validVIN: ((item.make && item.model) ? true : false) });
            }

        });
    }

    render() {
        if (this.state.success) {
            return <div className="container-narrow">
                <form onSubmit={this.onSubmit}>
                    <h1><L>Submission successful</L></h1>
                    <p><L>Thank you for submitting your application. Our team will review it promptly, and you can expect a response within one business day. Once your application is approved you will receive en email.</L></p>
                </form>
                <div className="mt-2 mb-4">
                    <Link to="/" role="button" className="btn btn-success btn-lg">Back to Home Page</Link>
                </div>
            </div>;
        }

        return <>
            <Helmet>
                <title>Bidea Online | {Globals.getLang('Sell your car')}</title>
            </Helmet>
            <TOSModal type="TOSSellers" show={this.state.showTOSModal} onToggle={() => { this.setState({ showTOSModal: false }); if (this.props.onToggle) this.props.onToggle(); }} onSuccess={() => { this.setState({ showTOSModal: false }); this.onSubmitVerify(); }} />
            <RegisterCardModal show={this.state.showRegisterCard} onToggle={() => { this.setState({ showRegisterCard: false }); if (this.props.onToggle) this.props.onToggle(); }} onSuccess={() => { this.setState({ showRegisterCard: false }); this.onSubmit(null, true); }} seller />
            <UserInfoModal show={this.state.showUserInfoModal} onToggle={() => { this.setState({ showUserInfoModal: false }); if (this.props.onToggle) this.props.onToggle(); }} onSuccess={() => { this.setState({ showUserInfoModal: false }); this.onSubmitVerify(); }} />
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
            <div className="container-narrow sell-vehicle">
                <form onSubmit={this.onSubmitVerify}>
                    <h1><L>Provide us with information about your vehicle</L></h1>
                    <p><L>Kindly provide us with essential information about yourself and the car you intend to sell. Additionally, we require details regarding the car's title status and eight photos showcasing both the exterior and interior condition of the vehicle.</L></p>
                    <p><L>You can expect a response to your application within one business day. Once your application is approved, you will receive an email.</L></p>
                    <Card title="Your info">
                        <div className="row mb-2">
                            <div className="col-md">
                                <FormInput model={this.state.item} name="fullName" label="Your full name" type="text" required />
                            </div>
                            <div className="col-md">
                                <FormInput model={this.state.item} name="contactPhone" label="Phone number" type="tel" required />
                            </div>
                        </div>
                        <label><L>* Are you a dealer or a private individual?</L></label>
                        <div className="mb-2 mt-2 ButtonInput" id="ButtonInput-sellerType" data-name="sellerType">
                            <button type="button" className={'btn' + (this.state.item.sellerType === 'Dealer' ? ' btn-success' : ' btn-secondary')} onClick={() => { var item = { ...this.state.item }; item.sellerType = 'Dealer'; this.setState({ item: item }) }}>Dealer</button>
                            <button type="button" className={'btn ms-2' + (this.state.item.sellerType === 'Private party' ? ' btn-success' : ' btn-secondary')} onClick={() => { var item = { ...this.state.item }; item.sellerType = 'Private party'; this.setState({ item: item }) }}>Private party</button>
                        </div>
                        {this.state.item.sellerType === 'Private party' ? <>
                            <div className="mt-3">
                                <FormInput model={this.state.item} name="_idFileData" label="Upload or take a photo of your Drivers License or Real ID" type="upload" required onChange={() => this.setState({ item: this.state.item })} />
                                {this.state.item._idFileData ? <span>Selected File: <strong>{this.state.item._idFileData.fileName}</strong>
                                    <span onClick={() => this.setState({ item: { ...this.state.item, _idFileData: null } })} role="button" className="badge bg-danger">remove</span>
                                    {this.state.item._idFileData.fileType.startsWith('image/') ? <><br /><img src={'data:' + this.state.item._idFileData.fileType + ';base64,' + this.state.item._idFileData.base64Content} alt="" className="img-thumbnail" /></> : ''}</span> : ''}
                                <div id="upload-_idFileData"></div>
                            </div>
                        </> : ''}
                        {this.state.item.sellerType === 'Dealer' ? <>
                            <hr />
                            <div className="row mb-2">
                                <div className="col-md">
                                    <FormInput model={this.state.item} name="dealershipName" label="Dealership name" type="text" required />
                                </div>
                                <div className="col-md">
                                    <FormInput model={this.state.item} name="dealershipWebsite" label="Dealership website" type="text" required />
                                </div>
                            </div>
                            <FormInput model={this.state.item} name="additionalFees" label="Are there any additional fees that the buyer needs to be aware of?" type="text" />
                            <FormInput model={this.state.item} name="salesRange" label="On average, how many vehicles does your dealership sell each month?" type="select" options={this.state.salesRanges} required />
                            <p><L>Kindly provide a photo or PDF document of your dealer license for verification purposes.</L></p>
                            <p><i><L>Rest assured that this information will be treated as confidential and solely utilized for verification purposes. It will not be displayed in the auction listing.</L></i></p>
                            <FormInput model={this.state.item} name="_licenseFileData" label="Upload dealer license photo/document" type="upload" required onChange={() => this.setState({ item: this.state.item })} />
                            {this.state.item._licenseFileData ? <span>Selected File: <strong>{this.state.item._licenseFileData.fileName}</strong>
                                <span onClick={() => this.setState({ item: { ...this.state.item, _licenseFileData: null } })} role="button" className="badge bg-danger">remove</span>
                                {this.state.item._licenseFileData.fileType.startsWith('image/') ? <><br /><img src={'data:' + this.state.item._licenseFileData.fileType + ';base64,' + this.state.item._licenseFileData.base64Content} alt="" className="img-thumbnail" /></> : ''}</span> : ''}
                            <div id="upload-_licenseFileData"></div>

                        </> : ''}
                        <hr />
                        <YesNoInput item={this.state.item} name="_feeCover" label="As a seller, are you willing to cover/discount the fee from the sale price for the buyer?" />
                    </Card>
                    <Card title="Vehicle details">
                        <div className="row mb-2">
                            <div className="col-md-8">
                                <FormInput model={this.state.item} name="vin" label="VIN" type="text" required onChange={this.checkVIN} />
                                <div id="vin"></div>
                            </div>
                            <div className="col-md-4">
                                <FormInput model={this.state.item} name="year" label="Year" selectLabel="Select year" type="select" options={this.state.years} required onChange={this.checkVIN} />
                            </div>
                        </div>
                        <div className="row mb-2">
                            <div className="col-md">
                                <FormInput model={this.state.item} name="make" label="Make" type="text" required />
                            </div>
                            <div className="col-md">
                                <FormInput model={this.state.item} name="model" label="Model" type="text" required />
                            </div>
                        </div>
                        <div className="row mb-2">
                            <div className="col-md">
                                <FormInput model={this.state.item} name="milage" label="Milage (in miles)" type="number" required />
                            </div>
                            <div className="col-md">
                                <FormInput model={this.state.item} name="transmission" label="Transmission type" selectLabel="Select transmission type" type="select" options={this.state.transmissions} required />
                            </div>
                        </div>
                        {this.state.item.sellerType === 'Private party' ? <>
                            <div className="mt-3">
                                <FormInput model={this.state.item} name="_registrationFileData" label="Upload or take a photo of the vehicle license or the vehicle title" type="upload" required onChange={() => this.setState({ item: this.state.item })} />
                                {this.state.item._registrationFileData ? <span>Selected File: <strong>{this.state.item._registrationFileData.fileName}</strong>
                                    <span onClick={() => this.setState({ item: { ...this.state.item, _registrationFileData: null } })} role="button" className="badge bg-danger">remove</span>
                                    {this.state.item._registrationFileData.fileType.startsWith('image/') ? <><br /><img src={'data:' + this.state.item._registrationFileData.fileType + ';base64,' + this.state.item._registrationFileData.base64Content} alt="" className="img-thumbnail" /></> : ''}</span> : ''}
                                <div id="upload-_registrationFileData"></div>

                            </div>
                        </> : ''}
                        <FormInput model={this.state.item} name="highlights" label="Highlights and sales pitch" type="textarea" spellCheck autoCapitalize inputStyle={{ height: '100px' }} required />
                        <FormInput model={this.state.item} name="features" label="Options and features" type="textarea" spellCheck autoCapitalize inputStyle={{ height: '100px' }} required />
                        <label><L>* Is the car stock, or does it have modifications?</L></label>
                        <div className="mb-4 mt-2 ButtonInput" id="ButtonInput-modType" data-name="modType">
                            <button type="button" className={'btn' + (this.state.item.modType === 'Stock' ? ' btn-success' : ' btn-secondary')} onClick={() => { var item = { ...this.state.item }; item.modType = 'Stock'; this.setState({ item: item }) }}>Stock (all original parts)</button>
                            <button type="button" className={'btn ms-2' + (this.state.item.modType === 'Modified' ? ' btn-success' : ' btn-secondary')} onClick={() => { var item = { ...this.state.item }; item.modType = 'Modified'; this.setState({ item: item }) }}>Modified</button>
                        </div>
                        {this.state.item.modType === 'Modified' ? <>
                            <FormInput model={this.state.item} name="mods" label="Any modifications or re-maps (including catalytic converters)" type="textarea" spellCheck autoCapitalize inputStyle={{ height: '100px' }} required />
                        </> : ''}
                        <YesNoInput item={this.state.item} name="_cosmeticFlaws" label="Are there any notable mechanical or cosmetic issues that we should be aware of?" onChange={() => this.setState({ item: this.state.item })} />
                        {this.state.item._cosmeticFlaws === 'True' ? <FormInput model={this.state.item} name="cosmeticFlawsDetail" label="Please provide specific details regarding any mechanical or cosmetic imperfections or flaws the vehicle may have." type="textarea" inputStyle={{ height: '100px' }} required /> : ''}

                        <FormInput model={this.state.item} name="postalCode" label="Zip code where car is located" type="text" style={{ maxWidth: '100px' }} required />
                    </Card>
                    <Card title="Title info">
                        <YesNoInput item={this.state.item} name="_titleOwnership" label="Is the vehicle registered under your name?" onChange={() => this.setState({ item: this.state.item })} />
                        {this.state.item._titleOwnership === 'False' ? <><p><i>If the vehicle is titled or registered in the name of another individual, a photo of the owner's ID will be requested for further verification.</i></p>
                            <FormInput model={this.state.item} name="titleOwnershipRel" label="Whose name appears on the vehicle's title? Could you please specify your relationship with the title holder?" type="textarea" inputStyle={{ height: '100px' }} required /></> : ''}
                        <div className="row">
                            <div className="col-md-6">
                                <FormInput model={this.state.item} name="titleStatus" label="What is the current status of the vehicle's title?" selectLabel="Select" type="select" options={this.state.titleStatuses} required />
                            </div>
                        </div>
                    </Card>
                    <Card title="Reserve price">
                        <p><i><L>The reserve price represents the minimum amount required for your vehicle to be sold, and it is kept confidential. Please note that vehicles with reserve prices may attract comparatively less interest than those without reserves.</L></i></p>
                        <YesNoInput item={this.state.item} name="_reservePriceEnabled" label="Do you want to set a minimum price required for your vehicle to sell?" onChange={() => this.setState({ item: this.state.item })} />
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
                        <p><L>Kindly provide a minimum of six photos showcasing both the car's exterior and interior.</L></p>
                        <UploadPad item={this.state.item} name="photos" onUploadBegin={() => this.setState({ uploading: true })} onUploadEnd={() => this.setState({ uploading: false })} />
                        <div id="SellVehicle-photos"></div>
                    </Card>
                    <Card title="Referral">
                        <FormInput model={this.state.item} name="referrer" label="How did you discover our platform? If you were referred by another user, please provide their username for reference." type="text" />
                    </Card>
                    <div className="mt-2 mb-4">
                        <button type="submit" className="btn btn-success btn-lg" disabled={this.state.submitting || this.state.uploading}>Submit</button>
                    </div>
                    {this.state.uploading ? <Alert type="info" message="Images are still uploading." /> : ''}
                </form>
            </div></>;
    }
}

export default withParamsAndNavigate(SellVehicle);