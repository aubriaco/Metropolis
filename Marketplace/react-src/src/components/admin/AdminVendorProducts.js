/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link } from "react-router-dom";
import Globals from "../../shared/Globals";
import { qreq } from "../../shared/qrequest";
import BaseCom from "../BaseCom";
import DataTable from "../DataTable";
import { withParamsAndNavigate } from "../WithParamsAndNavigate";
import AdminCom from "./AdminCom";
import LoadingAlert from "../LoadingAlert";
import Alert from "../Alert";

class AdminVendorProducts extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            vendor: null,
            list: null
        };
        this.loadProducts = this.loadProducts.bind(this);
    }
    componentDidMount() {
        this.loadProducts(this.props.vendorMID ?? this.props.params.vendorMID);
    }

    loadProducts(vendorMID) {
        qreq.get('/api/admin/vendor/product/' + vendorMID + '/list', j => {
            if(j.list)
                this.setState({ list: j.list });
            else
                this.alertI(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    render() {
        if(!this.state.list)
            return <LoadingAlert />;
        if(this.state.list.length === 0)
            return <Alert type="danger">This vendor has no products.</Alert>   
        return <>
            {this.state.list.filter(a => a.status === 'Active').length === 0 && <Alert type="warning">This vendor has no active products.</Alert>}
            <DataTable data={this.state.list} columns={[
                {
                    name: 'name',
                    title: 'Product',
                    valueFunc: row => {
                        return <Link to={'/p/' + row.ident}>{row.name}</Link>;
                    }
                },
                {
                    name: 'price',
                    title: 'Price',
                    valueFunc: row => {
                        return Globals.formatPrice(row.price);
                    }
                },
                {
                    name: 'sku',
                    title: 'Stock',
                    className: 'd-none d-md-table-cell'
                },
                {
                    name: 'weight',
                    title: 'Weight',
                    valueFunc: row => {
                        return row.weight + ' lbs';
                    },
                    className: 'd-none d-md-table-cell'
                },
                {
                    name: 'status',
                    title: 'Status',
                    valueFunc: row => {
                        return row.goodStatus ? <span className="text-success">{row.status}</span> : <span className="text-danger">{row.status}</span>;
                    }
                },
                {
                    name: 'createdDate',
                    title: 'Created',
                    valueFunc: row => {
                        return Globals.toMDYHMAMPMLocalDateString(row.createdDate);
                    },
                    className: 'd-none d-md-table-cell'
                }
            ]} />
        </>;
    }
}

export default withParamsAndNavigate(AdminVendorProducts);