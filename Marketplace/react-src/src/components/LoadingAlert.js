/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import BaseCom from './BaseCom';

export default class LoadingAlert extends BaseCom {

    constructor(props) {
        super(props);
        if (props.message)
            this.message = props.message;
        else
            this.message = 'Loading...';
    }

    render() {
        return <div className="container"><div className="alert alert-info"><FontAwesomeIcon icon={fa.faInfoCircle} /> {this.message}</div></div>;
    }
}
