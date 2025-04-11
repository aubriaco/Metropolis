/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import * as React from "react";
import Alert from "../../components/LoadingAlert";
import BaseCom from "../../components/BaseCom";

export default class NotFound extends BaseCom {
    render() {
        return (<Alert type="danger">Page not found...</Alert>);
    }
}