import { Link } from "react-router-dom";
import BaseCom from "./BaseCom";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import "./My.css";
import NativeNav from "./NativeNav";
import Globals from "../shared/Globals";
import L from "./Lang";
import Auth from "../shared/Auth";
import LoadingAlert from "./LoadingAlert";

class My extends BaseCom {

    componentDidMount() {
        Auth.getLogin(u => {
            this.setState({ user: u });
            if(!u)
                this.props.navigate('/login');
        });
    }

    render() {

        if(!this.state.user)
            return <LoadingAlert />

        return <div className="My">
            <NativeNav show={Globals.mobileView} noBack />
            <div className="container-narrow">
                <h1><L>My Account</L></h1>
                <ul className="list-group">
                    {this.state.user.isAdmin ? <li className="list-group-item">
                        <Link to="/admin/listings/vehicle"><L>Administration</L></Link>
                    </li> : ''}
                    <li className="list-group-item">
                        <Link to="/my/profile"><L>My Profile</L></Link>
                    </li>
                    <li className="list-group-item">
                        <Link to="/my/listings"><L>My Listings</L></Link>
                    </li>
                    <li className="list-group-item">
                        <Link to="/my/wallet"><L>Payment Methods</L></Link>
                    </li>
                    <li className="list-group-item">
                        <Link to="/logout"><L>Logout</L></Link>
                    </li>
                </ul>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(My);