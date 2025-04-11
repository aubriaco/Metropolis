import { Modal, ModalBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import BaseCom from "./BaseCom";
import FormInput from './FormInput';
import L from './Lang';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import { qreq } from '../shared/qrequest';
import Globals from '../shared/Globals';
import Alert from './Alert';
import { v4 as uuidv4 } from 'uuid';
import UserInfoModal from './UserInfoModal';
import Auth from '../shared/Auth';


export default class RegisterCardModal extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: {},
            fees: {},
            paymentSettings: {},
            months: [],
            years: []
        };
        var n;

        for (n = 1; n <= 12; n++)
            this.state.months.push({ id: n, name: n });

        var y = new Date().getFullYear();

        for (n = y; n <= (y + 20); n++)
            this.state.years.push({ id: n, name: n });

        this.id = uuidv4();
        this.submit = this.submit.bind(this);
        this.checkInfo = this.checkInfo.bind(this);
    }

    componentDidMount() {

        qreq.get('/api/payment/stripe/session', j => {
            if (j.item) {
                this.setState({ paymentSettings: j.item });
            }
        });


        qreq.get('/api/vehicle/fees', j => {
            if (j.item)
                this.setState({ fees: j.item });
        });

    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show) {
            this.setState({ info: {} });
            this.checkInfo();
        }
    }

    checkInfo() {
        Auth.getLogin(j => {
            if (j && (!j.firstName || !j.lastName || !j.phone))
                this.setState({ showUserInfoModal: true });
        });
    }

    submit(e) {
        e.preventDefault();
        this.setState({ submitting: true });
        qreq.post('/api/payment/card/save', this.state.info, j => {
            if (j.errorCode === 0) {
                this.setState({ success: true });
                if (this.props.onSuccess)
                    this.props.onSuccess();
            }
            else {
                this.setState({ error: j.errorMessage });
                setTimeout(() => {
                    this.setState({ error: null });
                }, 3000);
            }
            this.setState({ submitting: false });
        }, () => {
            this.alert('Unknown error.');
            this.setState({ submitting: false });
        });
    }

    render() {
        return <>
            <UserInfoModal show={this.state.showUserInfoModal} onToggle={() => { this.setState({ showUserInfoModal: false }); if (this.props.onToggle) this.props.onToggle(); }} onSuccess={() => this.setState({ showUserInfoModal: false })} />
            <Modal isOpen={this.props.show && !this.state.showUserInfoModal} toggle={() => { if (this.props.onToggle) this.props.onToggle(); }} size="lg">
                <ModalBody>
                    <div className="p-5">
                        <div className="text-center">
                            {this.props.seller || this.props.wallet ? <h1><L>Add your card</L></h1> : <h1><L>Register to Bid</L></h1>}
                            <hr />
                            {!this.props.seller && !this.state.success && !this.props.wallet ?
                                <p><L>Before you can participate in bidding, we kindly ask you to provide a valid credit card for our records. Please note that winning bidders are subject to a buyer's fee of {this.state.fees.buyersPercent}% to be paid to Buy/Trade Car in addition to the final bid amount. The buyer's fee ranges from a minimum of ${this.state.fees.buyersMin} to a maximum of ${this.state.fees.buyersMax}.</L></p> : ''}
                            {this.props.seller && !this.state.success && !this.props.wallet ? <p><L>To protect your auction as a seller, and also the buyer. We ask for a valid credit card to prevent fraudulent activity.</L></p> : ''}
                        </div>
                        {this.state.success && !this.props.wallet ? <><p><L>Thank you for registering your card to participate in our</L> {Globals.appName} <L>platform!</L></p>
                            {this.state.seller || this.props.wallet ? '' : <><p><L>Happy bidding, buying, and trading, and we wish you the best of luck!</L></p>
                                {this.props.wallet ? <div className="mt-2">
                                    <Link to="/" role="button" className="btn btn-primary btn-lg d-block" onClick={() => { if (this.props.onToggle) this.props.onToggle() }}><L>Close</L></Link>
                                </div> : <div className="mt-2">
                                    <Link to="/" role="button" className="btn btn-primary btn-lg d-block" onClick={() => { if (this.props.onToggle) this.props.onToggle() }}><L>Browse auctions!</L></Link>
                                </div>}
                            </>}
                        </> :
                            <form onSubmit={this.submit}>
                                {!this.props.wallet ?
                                    <div className="mb-2">
                                        <p><L>Your card will</L> <strong>NOT</strong> <L>be charged unless:</L></p>
                                        <ul>
                                            <li><L>The auction ends and reserve is met but you decide to not deliver the item to the winner.</L>
                                                <br />
                                                <i><L>You will be charged</L> <strong>{this.state.fees.buyersPercent}%</strong> <L>of the winning bid ranging from</L> {Globals.formatter.format(this.state.fees.buyersMin)} <L>to</L> {Globals.formatter.format(this.state.fees.buyersMax)}</i>
                                            </li>
                                        </ul>
                                    </div> : ''}
                                <div className="row justify-content-center">
                                    <div className="col-md-8">
                                        <div className="bg-light rounded my-2 p-3">
                                            <FormInput model={this.state.info} name="cardNumber" label="Card Number" type="text" placeholder="0000 0000 0000 0000" />
                                            <div className="row">
                                                <div className="col-md">
                                                    <label className="mb-2">Expires</label>
                                                    <div className="row">
                                                        <div className="col">
                                                            <FormInput model={this.state.info} name="expMonth" label="MM" type="select" options={this.state.months} labelAsPlaceholder />
                                                        </div>
                                                        <div className="col">
                                                            <FormInput model={this.state.info} name="expYear" label="YYYY" type="select" options={this.state.years} labelAsPlaceholder />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md">
                                                    <FormInput model={this.state.info} name="cvc" label="CVC" type="number" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mx-auto rounded my-2 text-center">
                                            <img src="/img/stripe-badge-transparent.png" alt="" className="img-fluid" />
                                        </div>
                                        <div className="mt-2">
                                            <button type="submit" className="btn btn-success btn-lg d-block w-100" disabled={this.state.submitting}>Register</button>
                                        </div>
                                    </div>
                                </div>

                                {this.state.error ? <Alert message={this.state.error} type="danger" className="mt-2" /> : ''}
                            </form>}
                    </div>
                </ModalBody>
            </Modal>
        </>;
    }
}