import BaseCom from "./BaseCom";
import { NavLink } from 'react-router-dom';
import L from "./Lang";

export default class AdminNav extends BaseCom {
    render() {
        return <ul className="nav nav-pills mb-4">
            <li className="nav-item"><NavLink to="/admin/listings/vehicle" className="nav-link"><L>Vehicle Listings</L></NavLink></li>
            <li className="nav-item"><NavLink to="/admin/listings/appliance" className="nav-link"><L>Appliance Listings</L></NavLink></li>
            <li className="nav-item"><NavLink to="/admin/auditlog" className="nav-link"><L>Log</L></NavLink></li>
        </ul>;
    }
}