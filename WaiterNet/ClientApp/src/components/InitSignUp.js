import BaseCom from "./BaseCom";
import FormInput from "./FormInput";
import L from "./Lang";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import './InitSignUp.css';

class InitSignUp extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            regInfo: {}
        };
        this.register = this.register.bind(this);
    }

    register(e) {
        if (e) e.preventDefault();
        this.props.navigate('/signup/' + encodeURIComponent(btoa(JSON.stringify(this.state.regInfo))));
    }

    render() {
        return <section className="register InitSignUp">
            <div className="container my-5 py-5 text-center">
                <h2 className="text-secondary"><L>Get your own restaurant QR ordering system!</L></h2>
                <h3><L>Unlimited orders! Fixed monthly payment!</L></h3>
                <form onSubmit={this.register} className="mt-5">
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <FormInput model={this.state.regInfo} name="vendorName" label="Your Restaurant Name" labelAsPlaceholder required className="box-shadow" postAddon=<button type="submit" className="btn btn-primary btn-lg"><L>REGISTER</L></button> />
                        </div>
                    </div>
                </form>
            </div>
        </section>;
    }
}

export default withParamsAndNavigate(InitSignUp);