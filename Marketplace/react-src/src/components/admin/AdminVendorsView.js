/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Globals from "../../shared/Globals";
import { qreq } from "../../shared/qrequest";
import AdminCom from "./AdminCom";
import BaseCom from "../BaseCom";
import Card from "../Card";
import Icon from "../Icon";
import LoadingAlert from "../LoadingAlert";
import { withParamsAndNavigate } from "../WithParamsAndNavigate";
import AdminVendorProducts from "./AdminVendorProducts";

class AdminVendorsView extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            vendor: null
        };
        this.load = this.load.bind(this);
        this.field = this.field.bind(this);
        this.approve = this.approve.bind(this);
        this.disable = this.disable.bind(this);
        this.decline = this.decline.bind(this);
    }

    componentDidMount() {
        this.load();
    }

    load() {
        qreq.get('/api/admin/vendor/' + this.props.params.vendorMID, j => {
            if (j.item)
                this.setState({ vendor: j.item });
            else
                this.alertI(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    field(a, b) {
        return <div className="col-md-6 my-1">
            <strong className="d-block">{a}</strong>
            <div>{b}</div>
        </div>;
    }

    approve() {
        qreq.post('/api/admin/vendor/approve', [ this.state.vendor.id ], j => {
            if(j.errorCode === 0) {
                this.success('Vendor activated.');
                this.load();
            }
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    disable(reset) {
        qreq.post('/api/admin/vendor/disable', [ this.state.vendor.id ], j => {
            if(j.errorCode === 0) {
                if(reset)
                    this.success('Vendor set to in review.');
                else
                    this.success('Vendor disabled.');
                this.load();
            }
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    decline() {
        qreq.post('/api/admin/vendor/decline', [ this.state.vendor.id ], j => {
            if(j.errorCode === 0) {
                this.success('Vendor declined.');
                this.load();
            }
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    render() {
        return <AdminCom subPath={[['/admin/vendors', 'Vendors'], [false, 'View']]}>
            <div className="container">
                {this.state.vendor ? <><Card title={this.state.vendor.name} headerButtons={<>
                    {this.state.vendor.isDeclined ? <button type="button" className="btn btn-success btn-lg" onClick={() => this.disable(true)}><Icon icon="faCircle" /> Pending Review</button> : !this.state.vendor.isActive ? <>
                        <button type="button" className="btn btn-success btn-lg" onClick={this.approve}><Icon icon="faCheck" /> Approve</button>
                        <button type="button" className="btn btn-danger btn-lg" onClick={this.decline}><Icon icon="faTimes" /> Decline</button>
                    </> : <button type="button" className="btn btn-secondary btn-lg" onClick={this.disable}><Icon icon="faTimes" /> Disable</button>}
                </>}>
                    <div className="row">
                        {this.field('Name', this.state.vendor.name)}
                        {this.field('MID', this.state.vendor.masterID)}
                        {this.field('Identity', this.state.vendor.ident)}
                        {this.field('Description', this.state.vendor.description)}
                        {this.field('Address', this.state.vendor.address ? <div>
                            <div>{this.state.vendor.address.line1}</div>
                            {this.state.vendor.address.line2 ? <div>{this.state.vendor.address.line2}</div> : ''}
                            <div>{this.state.vendor.city} {this.state.vendor.state} {this.state.vendor.country} {this.state.vendor.postalCode}</div>
                        </div> : <div>N/A</div>)}
                        {this.field('Phone', this.state.vendor.phone)}
                        {this.field('Email', this.state.vendor.email)}
                        {this.field('Image', <img src={Globals.imageUrl(this.state.vendor.imageUrl ?? '/img/noimage.png')} alt="" className="img-fluid" />)}
                    </div>
                </Card>
                {this.state.vendor.userInfo && <Card title="Owner">
                    <div className="row">
                        {this.field('MID', this.state.vendor.userInfo.masterID)}
                        {this.field('Name', this.state.vendor.userInfo.name)}
                        {this.field('Email', this.state.vendor.userInfo.email)}
                        {this.field('Phone', this.state.vendor.userInfo.phone)}
                    </div>
                </Card>}
                <Card title="Products">
                    <AdminVendorProducts vendorMID={this.state.vendor.masterID} />
                </Card>
                </> : <LoadingAlert />}
            </div>
        </AdminCom>;
    }
}

export default withParamsAndNavigate(AdminVendorsView);