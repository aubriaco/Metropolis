import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import * as React from 'react';

export default class Alert extends React.Component {

    constructor(props) {
        super(props);
        this.type = props.type ? props.type : 'info';
        this.state = {
            children: props.children,
            message: props.message
        };
        this.icon = props.icon ? props.icon : 'InfoCircle';
    }

    componentDidUpdate(prevProps) {
        if (prevProps.children !== this.props.children) {
            this.setState({ children: this.props.children });
        }
    }

    render() {
        var n = 0;
        return (<div className={'alert alert-' + this.type + (this.props.className ? ' ' + this.props.className : '')}>
            <FontAwesomeIcon icon={fa['fa' + this.icon]} className="me-2" />
            {this.state.children ? (this.state.children.map ? this.state.children.map((obj) => (<span key={n++}>{obj}</span>)) : this.state.children) : this.state.message}
        </div >);
    }
}

