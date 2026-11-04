import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import BaseCom from "./BaseCom";
import FormInput from './FormInput';
import L from './Lang';
import { qreq } from '../shared/qrequest';
import Alert from './Alert';
import { v4 as uuidv4 } from 'uuid';
import Auth from '../shared/Auth';
import UserInfoModal from './UserInfoModal';

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
        this.submitIntegrated = this.submitIntegrated.bind(this);
        this.checkInfo = this.checkInfo.bind(this);
    }

    componentDidMount() {

        qreq.get('/api/payment/stripe/session', j => {
            if (j.item) {
                this.setState({ paymentSettings: j.item });
            }
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

    submitIntegrated(e) {
        if (e) e.preventDefault();
        this.setState({ submitting: true });
        qreq.post('/api/integration/clover/card/add', this.state.info, j => {
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

    submit(e) {
        if (e) e.preventDefault();
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
            <UserInfoModal show={this.state.showUserInfoModal} onToggle={() => { this.setState({ showUserInfoModal: false }); if (this.props.onToggle) this.props.onToggle(); window.location.reload(); }} onSuccess={() => this.setState({ showUserInfoModal: false })} />
            <Modal isOpen={this.props.show && !this.state.showUserInfoModal} toggle={() => { if (this.props.onToggle) this.props.onToggle(); }}>
                <ModalHeader>
                    <L>Register Credit Card</L>
                </ModalHeader>
                <ModalBody>
                    {this.state.success && !this.props.wallet ? <><p><L>Thank you for registering your card!</L></p>
                    </> :
                        <form onSubmit={this.submit}>
                            <div className="bg-light rounded my-2 p-3">
                                <FormInput model={this.state.info} name="cardNumber" label="Card Number" type="text" placeholder="0000000000000000" required />
                                <div className="row">
                                    <div className="col-md">
                                        <label className="mb-2"><L>Expires</L></label>
                                        <div className="row">
                                            <div className="col">
                                                <FormInput model={this.state.info} name="expMonth" label="MM" type="select" options={this.state.months} labelAsPlaceholder required />
                                            </div>
                                            <div className="col">
                                                <FormInput model={this.state.info} name="expYear" label="YYYY" type="select" options={this.state.years} labelAsPlaceholder required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md">
                                        <FormInput model={this.state.info} name="cvc" label="CVC" type="number" required />
                                    </div>
                                </div>
                            </div>
                            <div className="mx-auto rounded my-2 text-center">
                                <img src="/img/stripe-badge-transparent.png" alt="" className="img-fluid" />
                            </div>
                            <div className="mt-2">
                                <button type="submit" className="btn btn-primary btn-lg d-block w-100" disabled={this.state.submitting}>Register</button>
                            </div>

                            {this.state.error ? <Alert message={this.state.error} type="danger" className="mt-2" /> : ''}
                        </form>}
                </ModalBody>
            </Modal>
        </>;
    }
}