import BaseCom from "./BaseCom";
import L from "./Lang";


export default class YesNoInput extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            item: props.item,
            value: props.item[props.name]
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.item !== this.props.item)
            this.setState({ item: this.props.item });
    }

    render() {
        return <><label>* <L>{this.props.label}</L></label>
            <div className={'mb-4 mt-2 ButtonInput'} id={'ButtonInput-' + this.props.name} data-name={this.props.name}>
                <button type="button" className={'btn' + (this.state.item[this.props.name] === 'True' ? ' btn-success' : ' btn-secondary')} onClick={() => { this.state.item[this.props.name] = 'True'; this.setState({ value: this.state.item[this.props.name], item: this.state.item }); if (this.props.onChange) this.props.onChange(this.state.item[this.props.name]); }}><L>Yes</L></button>
                <button type="button" className={'btn ms-2' + (this.state.item[this.props.name] === 'False' ? ' btn-success' : ' btn-secondary')} onClick={() => { this.state.item[this.props.name] = 'False'; this.setState({ value: this.state.item[this.props.name], item: this.state.item }); if (this.props.onChange) this.props.onChange(this.state.item[this.props.name]); }}><L>No</L></button>
            </div></>;
    }
}