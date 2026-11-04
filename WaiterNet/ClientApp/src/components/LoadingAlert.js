import BaseComponent from "./BaseCom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'

export default class LoadingAlert extends BaseComponent {

    constructor(props) {
        super(props);
        if (props.message)
            this.message = props.message;
        else
            this.message = 'Loading...';
    }

    render() {
        return <div className="alert fs-4"><FontAwesomeIcon icon={fa.faInfoCircle} /> {this.message}</div>;
    }
}