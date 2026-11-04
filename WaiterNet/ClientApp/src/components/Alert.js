import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import * as React from 'react';

export default class Alert extends React.Component {

    render() {
        var n = 0;
        var icon = this.props.icon ?? 'InfoCircle';
        return (<div className={'alert alert-' + (this.props.type ?? 'info') + (this.props.className ? ' ' + this.props.className : '')}>
            {icon !== 'NONE' ? <FontAwesomeIcon icon={fa['fa' + icon]} className="me-2" /> : ''}
            {this.props.children ?? this.props.message}
        </div >);
    }
}

