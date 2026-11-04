//V: nexus
import BaseCom from "../BaseCom";
import { NavLink } from 'react-router-dom';
import L from "../Lang";

export default class AdminNav extends BaseCom {
    render() {
        return <ul className="nav nav-pills mb-4">
            <li className="nav-item"><NavLink to="/auction/vehicle/list" className="nav-link"><L>Vehicle Listings</L></NavLink></li>
            <li className="nav-item"><NavLink to="/auction/appliance/list" className="nav-link"><L>Appliance Listings</L></NavLink></li>
            <li className="nav-item"><NavLink to="/auction/log" className="nav-link"><L>Log</L></NavLink></li>
        </ul>;
    }
}