/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import Alert from "./Alert";
import Card from "./Card";
import Icon from "./Icon";
import L from "./Lang";
import LoadingAlert from "./LoadingAlert";
import MyStoresCom from "./MyStoresCom";
import MyStoresPortal from "./MyStoresPortal";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Link } from "react-router-dom";

class MyStoresProducts extends MyStoresCom {
    constructor(props) {
        super(props);
        this.init();
        this.state.list = [];
    }


    componentDidMount() {
        this.pullVendor(v => {
            qreq.get('/api/product/list?vendorMasterID=' + v.masterID + '&showHidden=true', j => {
                if (j.list)
                    this.setState({ list: j.list });
                else
                    this.toast().error(j.errorMessage);
                this.setState({ loaded: true });
            }, this.unkownErrorCallback)
        });
    }



    render() {
        return <MyStoresPortal vendor={this.state.vendor} subPath={[[false, 'Products']]}>
            <Card title="Product Catalog" headerButtons={<div className="app-actions">
                <Link to="./new" className="btn btn-lg btn-primary"><Icon icon="faPlus" /> <span className="d-none d-md-inline-block"><L>New Product</L></span></Link>
            </div>}>
                {!this.state.loaded ? <LoadingAlert /> : <>
                    {this.state.list.length === 0 ? <Alert><L>No products in catalog.</L></Alert> :
                        <ul className="list-group">
                            {this.state.list.map(i => <li key={i.id} className="list-group-item list-group-item-action">
                                <Link className="d-flex align-items-center" to={'./' + i.masterID}>
                                    <img src={Globals.imageUrl(i.displayImageUrl)} alt="" className="d-block thumb-smaller" />
                                    <div className="ms-3">{i.name}</div>
                                    <div className="flex-fill text-end">
                                        {Globals.formatter.format(i.price)}
                                    </div>
                                </Link>
                            </li>)}
                        </ul>}
                </>}
            </Card>
        </MyStoresPortal>;
    }
}

export default withParamsAndNavigate(MyStoresProducts);