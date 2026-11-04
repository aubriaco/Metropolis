import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import LoadingAlert from "./LoadingAlert";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class RefLink extends BaseCom {

    componentDidMount() {
        qreq.post('/api/referral/link', { ident: this.props.params.ident }, j => {
            if(j.item)
                this.props.navigate('/register/' + j.item.programIdent);
            else
                this.props.navigate('/');
        }, () => {
            this.props.navigate('/');
        });
    }

    render() {
        return <LoadingAlert />
    }
}

export default withParamsAndNavigate(RefLink);