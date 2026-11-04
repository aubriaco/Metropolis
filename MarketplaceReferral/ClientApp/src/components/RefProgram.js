import Address from "./Address";
import BaseCom from "./BaseCom";
import Card from "./Card";
import LoadingAlert from "./LoadingAlert";
import FormInput from "./FormInput";
import L from "./Lang";
import Icon from "./Icon";
import { qreq } from "../shared/qrequest";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import Auth from "../shared/Auth";

class RefProgram extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            info: {},
            step: 0
        };

        this.state.info = {
        };

        this.goOnboarding = this.goOnboarding.bind(this);
        this.goRegister = this.goRegister.bind(this);
    }

    componentDidMount() {
        qreq.get('/api/referral/program?ident=' + this.props.params.ident, j => {
            if (j.item) {
                this.setState({ info: j.item });
                Auth.getLogin(u => {
                    if (u)
                        this.props.navigate('/dashboard');
                });
            }
            this.setState({ loaded: true });
        }, () => {
            this.setState({ loaded: true });
        });
    }


    goOnboarding() {
        this.props.navigate('/onboarding/' + this.props.params.ident);
    }

    goRegister() {
        this.props.navigate('/register/' + this.props.params.ident);
    }

    render() {
        if (!this.state.loaded)
            return <LoadingAlert />;
        return <div className="container RefProgram">
            <div className="row">
                <div className="col-md-6 mt-3">
                    <h1 className="text-center">Home Power</h1>
                    <Card>
                        <p><L>Home Power Sun Energy is a Puerto Rican company dedicated to the energy transformation of Puerto Rico. We provide expert guidance, installation, servicing, and maintenance of renewable photovoltaic energy systems with backup batteries. Our experienced teams have over 12 years of expertise, continuous professional education, and have successfully installed more than 260,400 photovoltaic panels in residences, businesses, and industries.</L></p>
                    </Card>
                    <h2 className="text-center"><L>Register for the service</L></h2>
                    <div className="mx-2 d-grid gap-2">
                        <button type="button" className="btn btn-success btn-lg box-shadow" onClick={this.goRegister}><Icon icon="faSun" /> <L>Register for the best solar energy service in Puerto Rico</L></button>
                    </div>
                    <h2 className="text-center mt-4"><L>Referral Program</L></h2>
                    <div className="mx-2 d-grid gap-2">
                        <button type="button" className="btn btn-primary btn-lg box-shadow" onClick={this.goOnboarding}><Icon icon="faSackDollar" /> <L>Win $500 for each referral</L></button>
                    </div>
                </div>
                <div className="col-md-6 mt-3">
                    <img src="/img/ref-program/home-power.png" alt="" className="img-fluid" />
                </div>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(RefProgram);