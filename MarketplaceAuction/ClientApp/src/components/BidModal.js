import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { Link } from 'react-router-dom';
import BaseCom from "./BaseCom";
import FormInput from './FormInput';
import L from './Lang';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import { qreq } from '../shared/qrequest';
import Globals from '../shared/Globals';
import Alert from './Alert';
import RegisterCardModal from './RegisterCardModal';
import TOSModal from './TOSModal';

export default class BidModal extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            item: this.props.item,
            info: { amount: 0 },
            loaded: false,
            hasCards: false,
            fees: {},
            selectedCard: null
        };
        this.formatter = Globals.formatter;
        this.bid = this.bid.bind(this);
        this.incrementAmount = this.incrementAmount.bind(this);
        this.getCaptureAmount = this.getCaptureAmount.bind(this);
        this.getCaptureAmountRaw = this.getCaptureAmountRaw.bind(this);
    }

    componentDidMount() {
        qreq.get(this.props.item.type === 'Vehicle' ? '/api/vehicle/fees' : '/api/auction/appliance/fees', j => {
            if (j.item)
                this.setState({ fees: j.item });
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show) {
            this.setState({ info: { amount: this.props.item.currentBid }, success: false });
            if (this.props.show) {
                this.checkCards();
            }
        }
        if (prevProps.item !== this.props.item) {
            this.setState({ item: this.props.item });
            if (!this.state.info.amount)
                this.setState({ info: { amount: this.props.item.currentBid } });
        }
    }

    checkCards() {
        this.setState({ checking: true });
        qreq.post('/api/user/agreement/check', { documentName: 'TOSBuyers' }, r => {
            if (r.errorCode === 0) {
                qreq.get('/api/payment/card/list', j => {
                    if (j.list) {
                        if (j.list.length === 0)
                            this.setState({ showRegisterCard: true });
                        else {
                            this.setState({ showRegisterCard: false, hasCards: true, selectedCard: j.list[0] });
                        }
                    }
                    this.setState({ checking: false });
                });
            }
            else if (r.errorCode === 10) {
                this.setState({ showTOSModal: true, checking: false });
            }
            else {
                this.alert(r.errorMessage);
                this.setState({ checking: false });
            }

        }, () => {
            this.alert('An unknown error ocurred. Please try again.');
            this.setState({ checking: false });
        });
    }

    getCaptureAmountRaw() {
        if (!this.state.fees.buyersPercent)
            return 'N/A';
        var fee = this.state.info.amount * (this.state.fees.buyersPercent / 100);
        if (fee > this.state.fees.buyersMax)
            fee = this.state.fees.buyersMax;
        else if (fee < this.state.fees.buyersMin)
            fee = this.state.fees.buyersMin;
        return fee;
    }

    getCaptureAmount() {
        return this.formatter.format(this.getCaptureAmountRaw());
    }

    incrementAmount(n) {
        var info = { ...this.state.info };
        var amount = Number(info.amount);
        info.amount = (amount + n);
        this.setState({ info: info });
    }

    bid(e) {
        e.preventDefault();
        var info = { ...this.state.info };

        if (info.amount <= this.state.item.currentBid) {
            this.showError(<>Bid <strong>Amount</strong> must be higher than current bid.</>);
            return;
        }

        this.setState({ submitting: true });


        info.bidAmount = info.amount;
        info.itemID = this.state.item.id;
        info.paymentMethodID = this.state.selectedCard.id;
        info.itemType = this.state.item.type;

        qreq.post('/api/payment/bid', info, j => {
            if (j.errorCode)
                this.showError(j.errorMessage);
            else if (j.item) {
                this.setState({ success: true });
            }
            this.setState({ submitting: false });
        }, () => {
            alert('An unknown error ocurred. Please try again.');
            this.setState({ submitting: false });
        });
    }

    render() {
        var currentBid = this.state.item.currentBid;
        if (!currentBid)
            currentBid = 0;
        return <>
            <TOSModal type="TOSBuyers" show={this.state.showTOSModal} onToggle={() => { this.setState({ showTOSModal: false }); if (this.props.onToggle) this.props.onToggle(); }} onSuccess={() => { this.setState({ showTOSModal: false }); this.checkCards(); }} />
            <RegisterCardModal show={this.state.showRegisterCard} onToggle={() => { this.setState({ showRegisterCard: false }); if (this.props.onToggle) this.props.onToggle(); }} onSuccess={() => { this.setState({ showRegisterCard: false, hasCards: true }); this.checkCards(); }} />
            <Modal isOpen={this.props.show && !this.state.showRegisterCard} toggle={() => { if (this.props.onToggle) this.props.onToggle(); }}>
                <ModalBody>
                    <div className="ps-5 pe-5 pb-5 pt-3">
                        <div className="text-center">
                            <h1><L>Place Bid</L></h1>
                            {this.state.item.type === 'Vehicle' ? <p className="lead">{this.state.year} {this.state.make} {this.state.model}</p> : <p className="lead">{this.state.item.name}</p>}
                            <hr />
                        </div>
                        {this.state.hasCards ? (this.state.success ? <>
                            <h2><L>Your bid has been successfully placed!</L></h2>
                            <p><L>The amount of</L> {this.getCaptureAmount()} <L>that was charged will be refunded if you don't win the auction, or if it the auction is canceled.</L></p>
                        </> :
                            <form onSubmit={this.bid}>
                                <p><L>Current bid:</L> <strong>{this.formatter.format(currentBid)}</strong></p>

                                <div className="mb-2 d-flex justify-content-around">
                                    {this.props.item.type === 'Appliance' ? <button type="button" className="btn btn-secondary m-1" onClick={() => this.incrementAmount(10)}>+$10</button> : ''}
                                    <button type="button" className="btn btn-secondary m-1" onClick={() => this.incrementAmount(100)}>+$100</button>
                                    <button type="button" className="btn btn-secondary m-1" onClick={() => this.incrementAmount(500)}>+$500</button>
                                    <button type="button" className="btn btn-secondary m-1" onClick={() => this.incrementAmount(1000)}>+$1000</button>
                                    {this.props.item.type === 'Vehicle' ? <button type="button" className="btn btn-secondary m-1" onClick={() => this.incrementAmount(5000)}>+$5000</button> : ''}
                                </div>
                                <FormInput model={this.state.info} name="amount" label="Amount" type="number" required step="1" onChange={() => this.setState({ info: this.state.info })} className="currency" />
                                {this.state.info.amount < this.state.item.currentBid ? <p className="text-danger">Your bid is lower than the current bid.</p> : ''}
                                {this.state.info.amount ? <p><L>You are submitting a bid amount of:</L> <strong>{this.formatter.format(this.state.info.amount)}</strong></p> : ''}
                                {this.state.selectedCard ? <p><L>Using card ending with:</L> <strong>x{this.state.selectedCard.lastFour}</strong></p> : ''}

                                <p><L>Your card  will be charged (but not captured) for</L> {this.state.info.amount > 0 ? <strong>{this.getCaptureAmount()}</strong> : ''}
                                    {this.getCaptureAmountRaw() >= this.state.fees.buyersMax ? ' (max fee) ' : (this.getCaptureAmountRaw() <= this.state.fees.buyersMin ? ' (min fee) ' : ' (' + this.state.fees.buyersPercent + '%) ')}
                                    <L>of the bid amount.</L></p>
                                <p><L>The above amount will only be captured if you win the auction.</L></p>
                                <p><L>If the auction is canceled, or you do not win, this will be refunded.</L></p>
                                {this.state.info.feeCover ? <p><L>The seller has decided to cover the fee by discounting it from the sale price.</L></p> : ''}
                                <div className="mt-2">
                                    {this.state.checking ? <p className="lead">Loading...</p> : <>
                                        {this.state.submitting ? <p className="lead text-primary"><L>Please wait while we submit your bid...</L></p> :
                                            <button type="submit" className="btn btn-success btn-lg d-block w-100" disabled={!this.state.info.amount || this.state.submitting}>Place Bid</button>}
                                    </>}
                                </div>
                                {this.state.error ? <Alert message={this.state.error} type="danger" className="mt-2" /> : ''}
                            </form>) : <Alert message="Loading..." />}
                    </div>
                </ModalBody>
            </Modal></>;
    }
}