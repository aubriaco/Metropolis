/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import './Logo.css';

export default class Logo extends BaseCom {
    render() {
        if(this.props.icon)
            return <img src="/img/icon.png" alt="Metropolis Market" className={'img-fluid logo-icon' + (this.props.className ? ' ' + this.props.className : '')} />;
        return <img src="/img/logo.png" alt="Metropolis Market" className={'img-fluid logo' + (this.props.className ? ' ' + this.props.className : '')} />;
    }
}