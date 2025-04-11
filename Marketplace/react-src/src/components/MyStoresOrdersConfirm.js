/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import Card from "./Card";
import FormInput from "./FormInput";
import Icon from "./Icon";
import L from "./Lang";
import MyStoresCom from "./MyStoresCom";
import MyStoresPortal from "./MyStoresPortal";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class MyStoresOrdersConfirm extends MyStoresCom {
    constructor(props) {
        super(props);
        this.init();
        this.state.order = {
            items: []
        };
        this.toggleItem = this.toggleItem.bind(this);
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        this.pullVendor(v => {
            this.setState({ vendor: v });
            qreq.get('/api/order/get?masterID=' + this.props.params.orderMID, j => {
                if (j.item) {
                    j.item.items.forEach(i => {
                        i.selected = true;
                    });
                    this.setState({ order: j.item });
                }
                else
                    this.alert(j.errorMessage);
            }, this.unkownErrorCallback);
        });
    }

    toggleItem(item, val) {
        var order = { ...this.state.order };
        var found = order.items.find(a => a.id === item.id);
        if (found) {
            found.selected = !found.selected;
            this.setState({ order: order });
        }
    }

    submit(e) {
        if(e) e.preventDefault();
        var list = [];
        this.state.order.items.forEach(i => {
            if(i.selected)
                list.push(i);
        });
    }

    render() {
        return <MyStoresPortal vendor={this.state.vendor} subPath={[['/my/stores/manage/' + this.state.vendor.masterID + '/orders', 'Orders'], ['/my/stores/manage/' + this.state.vendor.masterID + '/orders/' + this.state.order.masterID, this.state.order.ident], [false, 'Package']]}>
            <section className="py-4">
                <div className="container">
                    <form onSubmit={this.submit}>
                    <Card title={'Confirm ' + this.state.order.ident} headerButtons={<button type="submit" className="btn btn-primary btn-lg"><Icon icon="faCheck" /> <span className="d-none d-md-inline"><L>Confirm</L></span></button>}>
                        {this.state.order.items.map(i => <li key={i.id} className={'list-group-item p-2' + (i.selected ? ' bg-primary text-light' : '')}>
                            <div className="d-flex align-items-center" onClick={() => this.toggleItem(i)}>
                                <div className="mx-3"><input type="checkbox" checked={i.selected} readOnly /></div>
                                <img src={Globals.imageUrl(i.product.displayImageUrl)} alt="" className="d-block thumb-smaller" />
                                <div className="ms-3">{i.product.name}</div>
                                <div className="flex-fill text-end">
                                    <span className="fs-3">
                                        x
                                        <span> {i.quantity} </span>
                                    </span>
                                </div>
                            </div>
                        </li>)}
                    </Card>
                    </form>
                </div>
            </section>
        </MyStoresPortal>;
    }
}

export default withParamsAndNavigate(MyStoresOrdersConfirm);