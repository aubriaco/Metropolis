import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import Alert from "./Alert";
import BaseCom from "./BaseCom";
import Card from "./Card";
import FormInput from "./FormInput";
import Icon from "./Icon";
import L from "./Lang";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class SignUp extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            info: {}
        };
        this.submit = this.submit.bind(this);
        this.checkPasswordValidity = this.checkPasswordValidity.bind(this);
    }

    componentDidMount() {
        if (this.props.params.data)
            this.setState({ info: JSON.parse(atob(this.props.params.data)) })
    }

    checkPasswordValidity(v) {
        if(!v || v.length < 8)
            this.setState({ passwordError: Globals.getLang('Password is too short.'), disabled: true });
        else if(v.toLowerCase() === v)
            this.setState({ passwordError: Globals.getLang('Password must have at least one UPPERCASE character.'), disabled: true  });
        else if(v.toUpperCase() === v)
            this.setState({ passwordError: Globals.getLang('Password must have at least one lowercase character.'), disabled: true  });
        else if(v.replace(/[A-Za-z0-9]/g, '').length === 0)
            this.setState({ passwordError: Globals.getLang('Password must have at least one symbol: (! @ # ...)'), disabled: true  });
        else
            this.setState({ passwordError: null, disabled: false });
    }

    submit(e) {
        if (e) e.preventDefault();
        var info = {...this.state.info};
        info.username = info.email;
        this.setState({ submitting: true });
        qreq.post('/api/signup/submit/basic', info, j => {
            if(j.errorCode === 0)
                document.location.assign('/manage');
            else
                this.showError(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.showError('Unknown error ocurred. Please try again.');
            this.setState({ submitting: false });
        });
    }

    render() {
        return <div className="SignUp container">
            <h1 className="pt-5 my-5"><span><L>Get Access</L></span></h1>
            <div className="row justify-content-center mb-5">
                <div className="col-md-6">
                    <form onSubmit={this.submit}>
                        <Card title="Sign Up">
                            <FormInput model={this.state.info} name="vendorName" label="Restaurant Name" type="text" required labelAsPlaceholder preAddon={<Icon icon="faBuilding" />} />
                            <div className="row">
                                <div className="col-6">
                                    <FormInput model={this.state.info} name="firstName" label="First Name" type="text" required labelAsPlaceholder preAddon={<Icon icon="faUser" />} />
                                </div>
                                <div className="col-6">
                                    <FormInput model={this.state.info} name="lastName" label="Last Name" type="text" required labelAsPlaceholder preAddon={<Icon icon="faUser" />} />
                                </div>
                            </div>
                            <FormInput model={this.state.info} name="email" label="Email Address" type="email" required labelAsPlaceholder preAddon={<Icon icon="faEnvelope" />} />
                            <FormInput model={this.state.info} name="password" label="Password" type="password" required labelAsPlaceholder preAddon={<Icon icon="faKey" />} onChange={this.checkPasswordValidity} />
                            {this.state.passwordError ? <p className="text-danger">{this.state.passwordError}</p> : ''}
                            <div className="mt-2 d-grid gap-2">
                                <button type="submit" className="btn btn-primary btn-lg" disabled={this.state.disabled || this.state.submitting}><L>Continue</L></button>
                            </div>

                            <div className="mt-2 text-center">
                                <L>By pressing "Continue" you accept the</L> <L>End User License Agreement</L> <L>and</L> <L>Privacy Policy</L>.
                            </div>
                            {this.state.error ? <Alert type="danger">{this.state.error}</Alert> : ''}
                        </Card>
                    </form>
                </div>
            </div>

        </div>;
    }
}

export default withParamsAndNavigate(SignUp);