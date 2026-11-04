import { NavLink } from "react-router-dom";
import BaseCom from "./BaseCom";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import L from "./Lang";
import Auth from "../shared/Auth";
import Alert from "./Alert";
import Login from "./Login";
import LoadingAlert from "./LoadingAlert";

class Manager extends BaseCom {

    constructor(props) {
        super(props);
        this.setShowMobileSidebar = this.props.setShowMobileSidebar ?? function (b) { };
        this.onMenuClick = this.onMenuClick.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            this.setState({ user: u, loaded: true });
        });
    }

    onMenuClick(e) {
        this.setShowMobileSidebar(false);
    }

    render() {
        if (!this.state.loaded)
            return <LoadingAlert />
        if (!this.state.user)
            return <Login />
        return <div className="Manager">
            <div className={'menu' + (this.props.mainView ? 'd-block d-md-none' : '')}>
                {this.state.user && !this.state.user.isViewMode ? <>
                    <div className="menu-title"><L>Main Menu</L></div>
                    <NavLink to="/manage/menu" role="button" className="menu-item" onClick={this.onMenuClick}><L>Manage Menu</L></NavLink>
                    <NavLink to="/manage/tables" role="button" className="menu-item" onClick={this.onMenuClick}><L>Manage Tables</L></NavLink>
                    <NavLink to="/manage/qr" role="button" className="menu-item" onClick={this.onMenuClick}><L>QR Codes</L></NavLink>
                </> : ''}
                <div className="menu-title mt-4"><L>Business</L></div>
                <NavLink to="/manage/settings" role="button" className="menu-item" onClick={this.onMenuClick}><L>Settings</L></NavLink>
                <NavLink to="/manage/connect" role="button" className="menu-item" onClick={this.onMenuClick}><L>Connect Bank</L></NavLink>
                <NavLink to="/manage/subscription" role="button" className="menu-item" onClick={this.onMenuClick}><L>Subscription</L></NavLink>
                <div className="menu-title mt-4"><L>Orders</L></div>
                <NavLink to="/manage/orders" role="button" className="menu-item" onClick={this.onMenuClick}><L>Orders List</L></NavLink>
                <div className="menu-title mt-4"><L>Session</L></div>
                <NavLink to="/logout" role="button" className="menu-item" onClick={this.onMenuClick}><L>Logout</L></NavLink>
            </div>
            {this.props.mainView ? <div className="d-none d-md-block">
                <h1 className="mb-2"><L>Management</L></h1>
                <Alert icon="NONE" type="light"><L>Please select an option on the left menu.</L></Alert>
            </div> : ''}
        </div>
    }
}

export default withParamsAndNavigate(Manager);