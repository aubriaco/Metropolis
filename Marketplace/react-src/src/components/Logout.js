/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import Alert from "./Alert";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import NativeNav from "./NativeNav";
import Globals from "../shared/Globals";

class Logout extends BaseCom {

    componentDidMount() {
        qreq.post('/api/auth/logout', {}, j => {
            window.location.replace('/');
        }, () => window.location.replace('/'));
    }

    render() {
        return <><NativeNav show={Globals.mobileView} noBack /><Alert message="Please wait..." /></>;
    }
}

export default withParamsAndNavigate(Logout);