import BaseCom from "./BaseCom";
import Card from "./Card";
import FormInput from "./FormInput";
import FormLabel from "./FormLabel";
import countries from "../dicts/countries.json"
import statesUSA from "../dicts/states-usa.json"
import statesCanada from "../dicts/states-canada.json"

export default class Address extends BaseCom {

    constructor(props) {
        super(props);
        if (!props.item.country)
            props.item.country = 'Puerto Rico';
        this.state = {
            item: props.item
        };
        this.title = props.title;
        if (!this.title)
            this.title = 'Address';
        this.required = props.required ? props.required : false;
        this.state.readOnly = props.readOnly ? props.readOnly : false;
        this.onChange = props.onChange;
        this.onCountryChange = this.onCountryChange.bind(this);
    }


    componentDidUpdate(prevProps) {
        if (this.props.item !== prevProps.item) {
            this.setState({ item: this.props.item });
        }
        else {
            for (var k in this.props.item) {
                if (this.props.item[k] !== prevProps.item[k])
                    this.setState({ item: this.props.item });
            }
        }
        if (this.props.readOnly !== prevProps.readOnly) {
            this.setState({ readOnly: this.props.readOnly });
        }
    }

    onCountryChange(obj) {
        this.state.item.country = obj;
        this.setState({ item: this.state.item });
        if (this.onChange)
            this.onChange(obj);
    }


    render() {
        if (this.state.readOnly) {
            return (<Card title={this.props.title}>
                <div className="row">
                    <div className="col">
                        <FormLabel model={this.state.item.address1} label="Address Line 1" name="line1" type="text" required={this.required} size="lg" />
                    </div>
                    <div className="col">
                        <FormLabel model={this.state.item.address2} label="Address Line 2" name="line2" type="text" required={false} size="lg" />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <FormLabel model={this.state.item.city} label="City" name="city" type="text" required={this.required} size="lg" />
                    </div>
                    <div className="col d-none">
                        <FormLabel model={this.state.item.state} label="State" name="state" type="text" required={this.required} size="lg" />
                    </div>
                    <div className="col">
                        <FormLabel model={this.state.item.country} label="Country" name="country" type="text" required={this.required} size="lg" />
                    </div>
                    <div className="col">
                        <FormLabel model={this.state.item.zipCode} label="Postal Code" name="postalCode" type="text" required={this.required} size="lg" />
                    </div>
                </div>  
            </Card>);
        }

        return (
            <Card title={this.props.title}>
                <div className="row">
                    <div className="col-md-6">
                        <FormInput model={this.state.item} label="Address Line 1" name="line1" type="text" required={this.required} onChange={this.onChange} size="lg" />
                    </div>
                    <div className="col-md-6">
                        <FormInput model={this.state.item} label="Address Line 2" name="line2" type="text" required={false} onChange={this.onChange} size="lg" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-md-4">
                        <FormInput model={this.state.item} label="City" name="city" type="text" required={this.required} onChange={this.onChange} size="lg" />
                    </div>
                    <div className="col-6 col-md-4 d-none">
                        {(this.state.item.country === 'USA' || this.state.item.country === 'Canada') ?
                            <FormInput model={this.state.item} label="State/Province" name="state" type="select" required={this.required} onChange={this.onChange} options={this.state.item.country === 'USA' ? statesUSA.list : this.state.item.country === 'Canada' ? statesCanada.list : []} size="lg" /> : ''}
                    </div>
                    <div className="col-6 col-md-4">
                        <FormInput model={this.state.item} label="Country" name="country" type="select" required={this.required} onChange={this.onCountryChange} options={countries.list} size="lg" disabled />
                    </div>
                    <div className="col-6 col-md-4">
                        <FormInput model={this.state.item} label="Postal Code" name="postalCode" type="text" required={this.required} onChange={this.onChange} size="lg" />
                    </div>
                </div>  
            </Card>
           );
    }
}