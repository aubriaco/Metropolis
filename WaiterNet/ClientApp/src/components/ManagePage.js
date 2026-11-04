import Auth from "../shared/Auth";
import BaseCom from "./BaseCom";
import LoadingAlert from "./LoadingAlert";
import Manage from "./Manage";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class ManagePage extends BaseCom {

    componentDidMount() {
        Auth.getLogin(u => {
            if(!u)
                window.location.assign('/login');
            this.setState({ user: u });
        });
    }

    render() {
        if(!this.state.user)
            return <LoadingAlert />
        return <Manage mainView />
    }
}

export default withParamsAndNavigate(ManagePage);