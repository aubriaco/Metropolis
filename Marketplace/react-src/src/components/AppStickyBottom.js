/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import './AppStickyBottom.css';

export default class AppStickyBottom extends BaseCom {
    render() {
        return <div className="app-sticky-bottom">
            {this.props.showGoBack && <button type="button" className="btn btn-secondary btn-lg d-block d-md-none" onClick={this.goBack}>Go Back</button>}
            {this.props.children}
        </div>;
    }
}