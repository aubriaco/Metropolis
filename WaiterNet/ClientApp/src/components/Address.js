import BaseCom from "./BaseCom";
import Card from "./Card";
import FormInput from "./FormInput";
import countries from "../dicts/countries.json"
import statesUSA from "../dicts/states-usa.json"
import statesCanada from "../dicts/states-canada.json"

export default class Address extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            item: props.item,
            title: props.title ?? 'Address'
        };

        if (!this.state.item.country)
            this.state.item.country = 'USA';
        if (!this.state.item.state && this.state.item.country === 'USA')
            this.state.item.state = 'PR';

        this.onCountryChange = this.onCountryChange.bind(this);
        this.onChange = this.onChange.bind(this);
        this.getJoined = this.getJoined.bind(this);
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
    }

    onCountryChange(obj) {
        this.state.item.country = obj;
        this.setState({ item: this.state.item });
        if (this.props.onChange)
            this.props.onChange(obj);
    }

    onChange(obj) {
        this.setState({ item: this.state.item });
        if (this.props.onChange)
            this.props.onChange(obj);
    }

    getJoined() {
        return (this.state.item.line1 ?? '') + ' ' + (this.state.item.city ?? '')
            + (this.state.item.state ?? '') + ' ' + (this.state.item.country ?? '') + ' ' + (this.state.item.postalCode ?? '');
    }

    render() {

        return (
            <Card title={this.title}>
                <div className="row">
                    <div className="col">
                        <FormInput model={this.state.item} label="Line 1" name="line1" type="text" required={this.props.required} onChange={this.onChange} />
                    </div>
                    <div className="col">
                        <FormInput model={this.state.item} label="Line 2" name="line2" type="text" required={false} onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <FormInput model={this.state.item} label="City" name="city" type="text" required={this.props.required} onChange={this.onChange} />
                    </div>
                    <div className="col">
                        <FormInput model={this.state.item} label="Country" name="country" type="select" required={this.props.required} onChange={this.onCountryChange} options={countries.list} />
                    </div>
                    <div className="col">
                        {(this.state.item.country === 'USA' || this.state.item.country === 'Canada') ?
                            <FormInput model={this.state.item} label="State/Province" name="state" type="select" required={this.props.required} onChange={this.onChange} options={this.state.item.country === 'USA' ? statesUSA.list : this.state.item.country === 'Canada' ? statesCanada.list : []} /> : ''}
                    </div>
                    <div className="col">
                        <FormInput model={this.state.item} label="Postal Code" name="postalCode" type="text" required={this.props.required} onChange={this.onChange} />
                    </div>
                </div>
                {this.state.item.city && this.state.item.country && this.state.item.state ?
                    <iframe title="map" width="100%" height="450" style={{ border: '0' }} loading="lazy" allowFullScreen
                        src={'https://www.google.com/maps/embed/v1/place?q=' + encodeURIComponent(this.getJoined()) + '&key=GOOGLEMAPSAPIKEY'}></iframe> : ''}
            </Card>
        );
    }
}