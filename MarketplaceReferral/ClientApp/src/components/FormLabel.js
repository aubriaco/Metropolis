import { Link } from "react-router-dom";
import Globals from "../shared/Globals";
import BaseCom from "./BaseCom";

export default class FormLabel extends BaseCom {

    constructor(props) {
        super(props);
        this.title = props.label;
        this.state = {
            value: props.model
        };
        this.link = props.link;
        if (typeof (props.model) === 'object') {
            if (props.model instanceof Date) {
                this.state.value = Globals.toMDYDateString(props.model);
            }
        }
        else if (typeof (props.model) === 'string') {
            var regex = /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d/g;
            if (regex.test(props.model)) {
                this.state.value = Globals.toMDYDateString(new Date(props.model));
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.model !== this.props.model) {
            this.setState({ value: this.props.model });
        }
    }

    render() {
        return (<div className="c-formlabel mb-3">
            <h5>{this.title}</h5>
            <div className="c-value">{this.link ? <Link to={this.link}>{this.state.value ?? '(none)'}</Link> : (this.state.value ?? '(none)')}</div>
        </div>)
    }
}
