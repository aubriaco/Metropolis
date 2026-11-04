import BaseCom from "./BaseCom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as fa from '@fortawesome/free-solid-svg-icons';

export default class Icon extends BaseCom {
    render() {
        var props = { ...this.props }
        delete props.icon;
        return <FontAwesomeIcon icon={fa[this.props.icon]} {...props} />
    }
}