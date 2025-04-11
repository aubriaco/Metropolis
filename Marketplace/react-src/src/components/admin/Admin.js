/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link } from "react-router-dom";
import AdminCom from "./AdminCom";
import BaseCom from "../BaseCom";
import { withParamsAndNavigate } from "../WithParamsAndNavigate";

class Admin extends BaseCom {
    render() {
        return <AdminCom>
            <div className="container">
                <ul className="list-group fs-5">
                    <li className="list-group-item">
                        <Link to="/admin/vendors" className="d-block">Vendors</Link>
                    </li>
                    <li className="list-group-item">
                        <Link to="/admin/blog" className="d-block">Blog</Link>
                    </li>
                </ul>
            </div>
        </AdminCom>;
    }
}

export default withParamsAndNavigate(Admin);