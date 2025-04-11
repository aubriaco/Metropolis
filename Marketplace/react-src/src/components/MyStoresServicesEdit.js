/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import ReactQuill from "react-quill";
import { qreq } from "../shared/qrequest";
import Card from "./Card";
import FormInput from "./FormInput";
import Icon from "./Icon";
import L from "./Lang";
import LoadingAlert from "./LoadingAlert";
import MyStoresCom from "./MyStoresCom";
import MyStoresPortal from "./MyStoresPortal";
import TagsInput from "./TagsInput";
import UploadPad from "./UploadPad";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class MyStoresServicesEdit extends MyStoresCom {
    constructor(props) {
        super(props);
        this.init();
        this.state.item = {
            images: [],
            mTags: []
        };
        this.maxAllowedShortDescription = 200;
        this.onChange = this.onChange.bind(this);
        this.submit = this.submit.bind(this);
        this.delete = this.delete.bind(this);
    }


    componentDidMount() {
        this.pullVendor(v => {
            if (this.props.params.serviceMID === 'new') {
                this.setState({ loaded: true });
            }
            else {
                qreq.get('/api/product/item?masterId=' + this.props.params.serviceMID, j => {
                    if (j.item)
                        this.setState({ item: j.item });
                    else
                        this.toast().error(j.errorMessage);
                    this.setState({ loaded: true });
                }, this.unkownErrorCallback)
            }
        });
    }

    onChange(v) {
        this.setState({ item: { ...this.state.item } });
    }

    submit(e) {
        if (e) e.preventDefault();
        delete this.state.item.tags;
        var item = { ...this.state.item, vendorID: this.state.vendor.id, isService: true };
        item.images.forEach(i => {
            delete i.base64Content;
        });
        qreq.post('/api/product/save', item, j => {
            if (j.item)
                this.success('Saved!');
            else
                this.alert(j.errorMesage);
        }, this.unkownErrorCallback);
    }

    delete() {
        if (!window.confirm('Are you sure you want to delete this service?'))
            return;
        qreq.post('/api/product/delete', { ...this.state.item }, j => {
            if (j.errorCode === 0) {
                this.success('Item has been deleted.');
                this.props.navigate('/my/stores/manage/' + this.state.vendor.masterID + '/services', { replace: true });
            }
            else
                this.alert(j.errorMessage);
        });
    }

    render() {

        return <MyStoresPortal vendor={this.state.vendor} subPath={[[this.state.vendor.masterID ? '/my/stores/manage/' + this.state.vendor.masterID + '/services' : false, 'Services'], [false, this.state.item.id ? this.state.item.name : 'New Service']]}>
            {this.state.loaded ?
                <form onSubmit={this.submit}>
                    <Card title={this.state.item.id ? <L>Edit Service</L> : <L>New Service</L>} headerButtons={<div className="app-form-actions">
                        <button type="submit" className="btn btn-lg btn-success"><Icon icon="faSave" /> <span className="d-none d-md-inline-block"><L>Save</L></span></button>
                        <button type="button" className="btn btn-lg btn-secondary" disabled={this.state.uploading} onClick={this.goBack}><Icon icon="faBackward" /> <span className="d-none d-md-inline-block"><L>Go Back</L></span></button>
                    </div>}>
                        {!this.state.loaded ? <LoadingAlert /> : <>
                            <div className="row">
                                <div className="col-lg-8">
                                    <h4 className="mb-3">Basic Information</h4>
                                    <FormInput model={this.state.item} name="name" label="Title" type="text" required />
                                    <FormInput model={this.state.item} name="shortDescription" label="Short Description" type="textarea" required onChange={this.onChange} />
                                    <small className="d-block mb-4">Length: {this.state.item.shortDescription ? this.state.item.shortDescription.length : 0} | Maximum: {this.maxAllowedShortDescription}</small>
                                    <div className="pb-4 mb-5">
                                        <div id="quill-toolbar"></div>
                                        <ReactQuill theme="snow" modules={{
                                            toolbar: [
                                                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                                [{ 'font': [] }],
                                                ['bold', 'italic', 'underline', 'strike'],
                                                ['blockquote', 'code-block'],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                [{ 'script': 'sub' }, { 'script': 'super' }],
                                                [{ 'indent': '-1' }, { 'indent': '+1' }],
                                                [{ 'direction': 'rtl' }],
                                                [{ 'color': [] }, { 'background': [] }],
                                                [{ 'align': [] }],
                                                ['clean']]
                                        }} defaultValue={this.state.item.description} onChange={v => this.setState({ item: { ...this.state.item, description: v } })} style={{ height: '200px' }} />
                                    </div>
                                    <h4 className="mb-3">Media</h4>
                                    <UploadPad item={this.state.item} name="images" onUploadBegin={() => this.setState({ uploading: true })} onUploadEnd={() => this.setState({ uploading: false })} />
                                    <h4 className="mb-3">Pricing</h4>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <FormInput model={this.state.item} name="price" label="Minimum Price" type="number" step="0.01" required preAddon="$" />
                                            <small className="text-muted"><L>Leave emtpy for unspecified.</L></small>
                                        </div>
                                        <div className="col-md-6">
                                            <FormInput model={this.state.item} name="price" label="Maximum Price" type="number" step="0.01" required preAddon="$" />
                                            <small className="text-muted"><L>Leave emtpy for unspecified.</L></small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <h4 className="mb-3">Service Settings</h4>
                                    <label className="form-label"></label>
                                    <FormInput model={this.state.item} name="isActive" label="Active" type="switch" size="lg" />
                                    <TagsInput tags={this.state.item.mTags} />
                                </div>
                            </div>
                            <div className="d-grid justify-content-end">
                                <button type="button" className="btn btn-lg btn-danger" disabled={this.state.uploading}><Icon icon="faTrash" /> <span className="d-none d-md-inline-block"><L>Delete</L></span></button>
                            </div>
                        </>}
                    </Card>
                </form> : <LoadingAlert />}
        </MyStoresPortal>;
    }
}

export default withParamsAndNavigate(MyStoresServicesEdit);