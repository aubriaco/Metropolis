/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import FormInput from "./FormInput";

class SelectDeliveryTypes extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            info: this.listToTypesObject(this.props.info && this.props.info.deliverySettingsJsonData ? JSON.parse(this.props.info.deliverySettingsJsonData) : [])
        };
    }

    typesObjectToList(types) {
        var list = [];
        for(var k in types) {
            if(types[k])
                list.push(k);
        }
        return list;
    }

    listToTypesObject(list) {
        var types = {};
        if(list.forEach) {
            list.forEach(i => {
                types[i] = true;
            });
        }
        return types;
    }

    onChange() {
        this.props.onChange(JSON.stringify(this.typesObjectToList(this.state.info)));
    }

    render() {
        return <>
            <FormInput model={this.state.info} name="doordash" type="switch" label="Courier Delivery (Same Day/Next Day)" onChange={() => this.onChange()} />
            <FormInput model={this.state.info} name="usps-express" type="switch" label="USPS Priority Express (Next Day-2 Days)" onChange={() => this.onChange()} />
            <FormInput model={this.state.info} name="usps-priority" type="switch" label="USPS Priority (1-3 Days)" onChange={() => this.onChange()} />
            <FormInput model={this.state.info} name="usps-economy" type="switch" label="USPS Economy" onChange={() => this.onChange()} />
        </>;
    }
}

export default SelectDeliveryTypes;