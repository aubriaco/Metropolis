import BaseCom from "./BaseCom";
import L from "./Lang";
import './Toggler.css';

class Toggler extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            checked: props.model[props.name] ?? false
        };
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        this.props.model[this.props.name] = e.target.checked;
        this.setState({ checked: e.target.checked });
    }

    render() {
        return <div className={'my-2 d-flex justify-content-start align-items-center' + (this.props.className ? ' ' + this.props.className : '')}><label className={'Toggler d-block' + (this.state.checked ? ' checked' : '')}>
            <input type="checkbox" onChange={this.onChange} checked={this.state.checked} />
            <span className="__slider round"></span>
        </label>
            <div className="ms-2"><L>{this.props.label}</L></div>
        </div>;
    }
}

export default Toggler;