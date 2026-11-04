import BaseCom from "./BaseCom";
import FormInput from "./FormInput";
import Card from "./Card";
import L from "./Lang";
import Icon from "./Icon";
import { qreq } from "../shared/qrequest";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import Auth from "../shared/Auth";
import Alert from "./Alert";
import { toast } from 'react-toastify';
import Globals from "../shared/Globals";
import { Link } from 'react-router-dom';

class RefLead extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: {
                address: {}
            }
        };
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            this.setState({ user: u });
        });
    }

    onSubmit(e) {
        if (e) e.preventDefault();
        this.setState({ submitting: true });
        qreq.post('/api/referral/lead/save', this.state.info, j => {
            if (j.errorCode === 0) {
                toast(Globals.getLang('Referral information saved.'));
                this.props.navigate('/dashboard');
            }
            else
                this.showError(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.showError(<L>Unknown error ocurred, please try again.</L>);
            this.setState({ submitting: false });
        });
    }

    render() {
        if (!this.state.user)
            return <></>;
        return <div className="RefLead container">
            <form onSubmit={this.onSubmit}>
                <Card title="Refer a friend">
                    <div className="RefLead">
                        <div className="row">
                            <div className="col-md-6">
                                <FormInput model={this.state.info} name="fullName" label="Lead full name" placeholder="Jose Rodriguez" type="text" required size="lg" />
                            </div>
                            <div className="col-md-6">
                                <FormInput model={this.state.info} name="phone" label="Lead phone number" placeholder="(XXX) XXX-XXXX" type="tel" required size="lg" />
                            </div>
                            <div className="col-md-6">
                                <FormInput model={this.state.info} name="email" label="Lead email address" placeholder="myemail@provider.com" type="email" size="lg" />
                            </div>
                            <div className="col-md-6">
                                <FormInput model={this.state.info.address} name="city" label="Lead city" placeholder="San Juan" type="text" size="lg" />
                            </div>
                        </div>
                    </div>
                </Card>
                <button type="submit" className="btn btn-primary btn-lg d-block w-100" disabled={this.state.submitting}><L>Submit</L> <Icon icon="faArrowRight" /></button>
                {this.state.error ? <Alert type="danger" className="mt-2"><L>{this.state.error}</L></Alert> : ''}
                <Link to="/dashboard" className="d-block p-3 my-3 text-center" role="button" disabled={this.state.submitting}><Icon icon="faArrowLeft" /> <L>Go back to Dashboard</L></Link>
            </form>
        </div>;
    }
}

export default withParamsAndNavigate(RefLead);