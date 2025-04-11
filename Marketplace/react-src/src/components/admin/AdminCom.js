/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link, NavLink } from "react-router-dom";
import Auth from "../../shared/Auth";
import BaseCom from "../BaseCom";
import L from "../Lang";
import SubHeader from "../SubHeader";
import { withParamsAndNavigate } from "../WithParamsAndNavigate";
import LoadingAlert from "../LoadingAlert";
import Alert from "../Alert";

class AdminCom extends BaseCom {

    componentDidMount() {
        Auth.getLogin(u => {
            if (u && u.isAdmin)
                this.setState({ loaded: true });
            else
                this.setState({ error: <><L>No access.</L> <Link to="/login">Login</Link></> })
        });
    }

    render() {
        return <>
            <nav className="navbar navbar-expand navbar-light bg-light fs-6">
                <div className="container">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <NavLink to="/admin/vendors" className="nav-link">Vendors</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/admin/blog" className="nav-link">Blog</NavLink>
                        </li>
                    </ul>
                </div>
            </nav>
            <SubHeader title="Admin" titleLink="/admin" subPath={this.props.subPath} />
            <div className="my-3">
                {this.state.error ? <div className="container"><Alert type="danger">{this.state.error}</Alert></div> : this.state.loaded ? <>
                    {this.props.children}
                </> : <LoadingAlert />}
            </div>
        </>;
    }
}

export default withParamsAndNavigate(AdminCom);