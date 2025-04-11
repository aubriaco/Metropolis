/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import Card from "./Card";
import MyStoresCom from "./MyStoresCom";
import MyStoresPortal from "./MyStoresPortal";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class MyStoresOrdersPackage extends MyStoresCom {
    constructor(props) {
        super(props);
        this.init();
        this.state.order = {
            items: []
        };
    }

    componentDidMount() {
        this.pullVendor(v => {
            this.setState({ vendor: v });
            qreq.get('/api/order/get?masterID=' + this.props.params.orderMID, j => {
                if (j.item)
                    this.setState({ order: j.item });
                else
                    this.alert(j.errorMessage);
            }, this.unkownErrorCallback);
        });
    }

    render() {
        return <MyStoresPortal vendor={this.state.vendor} subPath={[['/my/stores/manage/' + this.state.vendor.masterID + '/orders', 'Orders'], ['/my/stores/manage/' + this.state.vendor.masterID + '/orders/' + this.state.order.masterID, this.state.order.ident], [false, 'Package']]}>
            <section className="py-4">
                <div className="container">
                    <Card title={'Packge ' + this.state.order.masterID}>
                        
                    </Card>
                </div>
            </section>
        </MyStoresPortal>;
    }
}

export default withParamsAndNavigate(MyStoresOrdersPackage);