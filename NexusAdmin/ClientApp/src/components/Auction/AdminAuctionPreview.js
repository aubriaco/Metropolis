//V: nexus
import Auth from "../../shared/Auth";
import AuctionView from "./AuctionView";
import BaseCom from "../BaseCom";
import L from "../Lang";
import { withParamsAndNavigate } from "../WithParamsAndNavigate";

class AdminAuctionPreview extends BaseCom {

    componentDidMount() {
        Auth.getLogin(j => {
            this.setState({ user: j });
        });
    }

    render() {
        if (!this.state.user)
            return <></>;

        return <>
            <div className="container">
                <div className="alert alert-warning"><L>This is a preview page of how the auction will look live.</L></div>
            </div>
            <AuctionView id={this.props.params.id} type={this.props.type} preview />
        </>
    }
}

export default withParamsAndNavigate(AdminAuctionPreview);