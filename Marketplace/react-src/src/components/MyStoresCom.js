/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Auth from "../shared/Auth";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";

export default class MyStoresCom extends BaseCom {

    constructor(props) {
        super(props);
        this.pullVendor = this.pullVendor.bind(this);
    }

    init() {
        this.state = {
            user: {},
            vendor: {}
        };
        Auth.getLogin(u => {
            if(u)
                this.state.user = u;
            else
                window.location.replace('/login');
        });
    }

    pullVendor(successCallback) {
        qreq.get('/api/vendor/get?masterId=' + this.props.params.vendorMID + '&manage=true', j => {
            if (j.item) {
                this.setState({ vendor: j.item });
                if (successCallback)
                    successCallback(j.item);
            }
            else {
                this.toast().error(j.errorMessage);
                if(j.errorCode === 5)
                    this.props.navigate('/login');
            }
        }, this.unkownErrorCallback);
    }
}

