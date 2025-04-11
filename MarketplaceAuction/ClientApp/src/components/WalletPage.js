import Auth from "../shared/Auth";
import BaseCom from "./BaseCom";
import L from "./Lang";
import Wallet from "./Wallet";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class WalletPage extends BaseCom {

    componentDidMount() {
        Auth.getLogin(u => {
            if (!u)
                this.props.navigate('/login');
        });
    }

    render() {
        return <div className="container-narrow">
            <h1 className="mb-5"><L>Payment Methods</L></h1>
            <Wallet />
        </div>
    }
}

export default withParamsAndNavigate(WalletPage);