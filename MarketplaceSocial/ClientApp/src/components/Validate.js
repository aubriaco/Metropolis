import { qreq } from "../shared/qrequest";
import LoadingAlert from "./LoadingAlert";
import BaseCom from "./BaseCom";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import L from "./Lang";
import Alert from "./Alert";

class Validate extends BaseCom {

    
    componentDidMount() {
        qreq.post('/api/auth/verify-email', { code: this.props.params.code }, j => {
            if (j.errorCode)
                this.setState({ error: j.errorMessage, loaded: true });
            else {
                this.setState({ success: true, loaded: true });
                document.location.replace('/');
            }
        });
    }

    render() {
        return <div className="container"><h1 className="mb-4"><L>Verify Account</L></h1>{this.state.loaded ? this.state.success ? <Alert message={<L>Redirecting...</L>} /> : <Alert type="danger" message={this.state.error} /> : <LoadingAlert />}</div>;
    }
}


export default withParamsAndNavigate(Validate);