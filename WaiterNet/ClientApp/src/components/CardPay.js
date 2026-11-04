import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import Card from "./Card";
import FormInput from "./FormInput";
import L from "./Lang";

class CardPay extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            order: props.order,
            info: {},
            months: [],
            years: []
        };
        var n;

        for (n = 1; n <= 12; n++)
            this.state.months.push({ id: n, name: n });

        var y = new Date().getFullYear();

        for (n = y; n <= (y + 20); n++)
            this.state.years.push({ id: n, name: n });
        this.submit = this.submit.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.order !== this.props.order)
            this.setState({ order: this.props.order });
    }

    submit(e) {
        if (e) e.preventDefault();
        this.setState({ submitting: true });
        qreq.post('/api/waiter/order/pay', { ...this.state.order, email: this.state.info.email, payment: { ...this.state.info } }, j => {
            if (j.errorCode === 0) {
                this.setState({ success: true });
                this.props.onSuccess();
            }
            else
                this.showError(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.showError('Unknown error ocurred. Please try again!');
            this.setState({ submitting: false });
        });

    }

    render() {
        return <div className="CardPay">
            <form onSubmit={this.submit}>
                <Card title="Pay for order">
                    <FormInput model={this.state.info} name="email" label="Email Address" type="email" required />
                    <FormInput model={this.state.info} name="cardNumber" label="Card Number" type="text" required placeholder="0000 0000 0000 0000" />
                    <div className="row">
                        <div className="col-md">
                            <label className="mb-2">Expires</label>
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
                    <div className="mt-2 d-grid gap-2">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={this.state.submitting}><L>Pay</L></button>
                    </div>
                </Card>
            </form>
        </div>;
    }
}

export default CardPay;