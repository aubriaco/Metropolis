import Auth from "../shared/Auth";
import BaseCom from "./BaseCom";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Helmet } from "react-helmet";
import Globals from "../shared/Globals";
import L from "./Lang";
import Card from "./Card";
import { Link } from 'react-router-dom';
import NativeNav from "./NativeNav";

class SellSelect extends BaseCom {

    componentDidMount() {
        Auth.getLogin(j => {
            if (!j)
                this.props.navigate('/sell');
            this.setState({ user: j });
        });
    }

    render() {
        if (!this.state.user)
            return <></>;

        return <>
            <Helmet>
                <title>Bidea Online | {Globals.getLang('Select what to sell')}</title>
            </Helmet>
            <NativeNav show={Globals.mobileView} />
            <div className="container-narrow sell-select">
                <h1 className="mb-3"><L>Select what type of item you want to sell</L></h1>
                <Card>
                    <div className="row">
                        <div className="col-6">
                            <Link to="/sell/vehicle" className="p-2 p-md-5 btn btn-light text-center d-block w-100" role="button">
                                <img src="/img/sell/type/vehicle.png" alt="" className="img-fluid" />
                                <h4><L>Car/Truck</L></h4>
                            </Link>
                        </div>
                        <div className="col-6">
                            <Link to="/sell/appliance" className="p-2 p-md-5 btn btn-light text-center d-block w-100" role="button">
                                <img src="/img/sell/type/appliance.png" alt="" className="img-fluid" />
                                <h4><L>Appliance/Electronics</L></h4>
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        </>;
    }
}

export default withParamsAndNavigate(SellSelect);