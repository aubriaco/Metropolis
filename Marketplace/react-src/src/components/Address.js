/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
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
        this.state = {
            item: props.item
        };
        this.title = props.title;
        if (!this.title)
            this.title = 'Address';
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
        if (this.props.onChange)
            this.props.onChange(obj);
    }


    render() {
        if (this.state.readOnly) {
            return (<Card title={this.props.title ?? 'Address'} headerButtons={this.props.headerButtons}>
                <div className="row">
                    <div className="col">
                        <FormLabel model={this.state.item.line1} label="Address Line 1" name="line1" type="text" required={this.props.required} />
                    </div>
                    <div className="col">
                        <FormLabel model={this.state.item.line2} label="Address Line 2" name="line2" type="text" required={false} />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <FormLabel model={this.state.item.city} label="City" name="city" type="text" required={this.props.required} />
                    </div>
                    <div className="col">
                        <FormLabel model={this.state.item.state} label="State" name="state" type="text" required={this.props.required} />
                    </div>
                    <div className="col">
                        <FormLabel model={this.state.item.country} label="Country" name="country" type="text" required={this.props.required} />
                    </div>
                    <div className="col">
                        <FormLabel model={this.state.item.postalCode} label="Postal Code" name="zipCode" type="text" required={this.props.required} />
                    </div>
                </div>  
                {this.props.children}
            </Card>);
        }

        return (
            <Card title={this.props.title ?? 'Address'} headerButtons={this.props.headerButtons}>
                <div className="row">
                    <div className="col-md">
                        <FormInput model={this.state.item} label="Address Line 1" name="line1" type="text" required={this.props.required} onChange={this.props.onChange} autoFocus={this.props.autoFocus} />
                    </div>
                    <div className="col-md">
                        <FormInput model={this.state.item} label="Address Line 2" name="line2" type="text" required={false} onChange={this.props.onChange} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md">
                        <FormInput model={this.state.item} label="City" name="city" type="text" required={this.props.required} onChange={this.props.onChange} />
                    </div>
                    <div className="col-md">
                        {(this.state.item.country === 'USA' || this.state.item.country === 'Canada') ?
                            <FormInput model={this.state.item} label="State/Province" name="state" type="select" required={this.props.required} onChange={this.props.onChange} disabled options={this.state.item.country === 'USA' ? statesUSA.list : this.state.item.country === 'Canada' ? statesCanada.list : []} /> : ''}
                    </div>
                    <div className="col-md">
                        <FormInput model={this.state.item} label="Country" name="country" type="select" required={this.props.required} onChange={this.onCountryChange} disabled options={countries.list} />
                    </div>
                    <div className="col-md">
                        <FormInput model={this.state.item} label="Postal Code" name="postalCode" type="text" required={this.props.required} onChange={this.props.onChange} />
                    </div>
                </div>
                {this.props.children}
            </Card>
           );
    }
}