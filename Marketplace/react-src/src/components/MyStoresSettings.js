/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import Address from "./Address";
import Card from "./Card";
import FormInput from "./FormInput";
import Icon from "./Icon";
import L from "./Lang";
import LoadingAlert from "./LoadingAlert";
import MyStoresCom from "./MyStoresCom";
import MyStoresPortal from "./MyStoresPortal";
import SelectDeliveryTypes from "./SelectDeliveryTypes";
import UploadPad from "./UploadPad";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Link } from "react-router-dom";

class MyStoresSettings extends MyStoresCom {
    constructor(props) {
        super(props);
        this.init();
        this.state.info = {
            address: {}
        };
        this.state.deliveryTypes = {};
        this.state.logoImage = null;
        this.state.uploads = {
            list: [],
            list2: []
        };
        this.submit = this.submit.bind(this);
    }


    componentDidMount() {
        this.pullVendor(v => {
            this.setState({ info: { ...v }, loaded: true });
        });
    }

    submit(e) {
        if (e) e.preventDefault();
        var info = { ...this.state.info };
        if (this.state.uploads.list.length > 0)
            info.imageIdent = this.state.uploads.list[0].ident;
        if (this.state.uploads.list2.length > 0)
            info.coverImageIdent = this.state.uploads.list2[0].ident;
        if (!info.ident && info.ident.length === 0)
            delete info.ident;
        qreq.post('/api/vendor/settings/save', info, j => {
            if (j.item) {
                this.success('Saved!');
                this.setState({ info: j.item, changeIdent: false });
            }
            else
                this.alert(j.errorMesage);
        }, this.unkownErrorCallback);
    }

    render() {
        return <MyStoresPortal vendor={this.state.vendor} subPath={[[false, 'Settings']]}>
            {this.state.loaded ?
                <form onSubmit={this.submit}>
                    <Card title="Settings" headerButtons={<div className="app-form-actions">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={this.state.uploading}><Icon icon="faSave" /> <span className="d-none d-md-inline-block"><L>Save</L></span></button>
                        <button type="button" className="btn btn-lg btn-secondary" disabled={this.state.uploading} onClick={this.goBack}><Icon icon="faBackward" /> <span className="d-none d-md-inline-block"><L>Go Back</L></span></button>
                    </div>}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label"><L>Logo</L></label>
                                    {this.state.info.imageUrl ? <><img src={Globals.imageUrl(this.state.info.imageUrl)} alt="" className="img-fluid" />
                                        <div className="d-grid gap-2">
                                            <button type="button" className="btn btn-primary" onClick={() => this.setState({ info: { ...this.state.info, imageUrl: null, uploads: { list: [] } } })}>Change Logo</button>
                                        </div>
                                    </> :
                                        <UploadPad item={this.state.uploads} name="list" single onUploadBegin={() => this.setState({ uploading: true })} onUploadEnd={v => {
                                            if (v)
                                                this.setState({ info: { ...this.state.info, imageUrl: v.url } });
                                            this.setState({ uploading: false });
                                        }} />}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label"><L>Cover Image</L></label>
                                    {this.state.info.coverImageUrl ? <><img src={Globals.imageUrl(this.state.info.coverImageUrl)} alt="" className="img-fluid" />
                                        <div className="d-grid gap-2">
                                            <button type="button" className="btn btn-primary" onClick={() => this.setState({ info: { ...this.state.info, coverImageUrl: null, uploads: { list2: [] } } })}>Change Cover Image</button>
                                        </div>
                                    </> :
                                        <UploadPad item={this.state.uploads} name="list2" single onUploadBegin={() => this.setState({ uploading: true })} onUploadEnd={v => {
                                            if (v)
                                                this.setState({ info: { ...this.state.info, coverImageUrl: v.url } });
                                            this.setState({ uploading: false });
                                        }} />}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label"><L>Store URL</L></label>
                                <div className="mb-3">
                                    {this.state.changeIdent ? <><FormInput model={this.state.info} name="ident" label="" labelAsPlaceholder type="text" preAddon={Globals.serverUrl + '/v/'} /><small className="d-block">Only alphanumeric characters 'a' to 'z' and '-' allowed.</small></> :
                                        <><Link to={'/v/' + this.state.info.ident}>{Globals.serverUrl}/v/{this.state.info.ident}</Link> <button type="button" className="badge bg-primary" onClick={() => this.setState({ changeIdent: true })}>change</button></>}
                                </div>

                                <FormInput model={this.state.info} name="name" label="Business Name" type="text" />
                                <FormInput model={this.state.info} name="phone" label="Phone" type="tel" />
                                <FormInput model={this.state.info} name="email" label="Support Email" type="email" />
                                <FormInput model={this.state.info} name="description" label="Business Details" type="textarea" rows="4" />
                            </div>
                        </div>
                    </Card>
                    <Card title="Delivery Settings" headerButtons={<button type="submit" className="btn btn-primary btn-lg" disabled={this.state.uploading}><Icon icon="faSave" /> <span className="d-none d-md-inline-block"><L>Save</L></span></button>}>
                        <SelectDeliveryTypes info={this.state.info} onChange={v => this.setState({ info: { ...this.state.info, deliverySettingsJsonData: v } })} />
                    </Card>
                    <Address item={this.state.info.address} headerButtons={<button type="submit" className="btn btn-primary btn-lg" disabled={this.state.uploading}><Icon icon="faSave" /> <span className="d-none d-md-inline-block"><L>Save</L></span></button>} />
                </form>
                : <LoadingAlert />}
        </MyStoresPortal>;
    }
}

export default withParamsAndNavigate(MyStoresSettings);