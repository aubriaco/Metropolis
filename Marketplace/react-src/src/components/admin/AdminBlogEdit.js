/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link } from "react-router-dom";
import AdminCom from "./AdminCom";
import BaseCom from "../BaseCom";
import FormInput from "../FormInput";
import { withParamsAndNavigate } from "../WithParamsAndNavigate";
import Icon from "../Icon";
import UploadPad from "../UploadPad";
import { qreq } from "../../shared/qrequest";
import { Pop } from "../PopModal";
import L from "../Lang";
import ReactQuill from "react-quill";
import LoadingAlert from "../LoadingAlert";

class AdminBlogEdit extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            info: {
                images: []
            },
            uploading: 0
        };
        this.load = this.load.bind(this);
        this.submit = this.submit.bind(this);
        this.delete = this.delete.bind(this);
    }

    componentDidMount() {
        if (this.props.params.blogPostMID) {
            this.load(this.props.params.blogPostMID);
        }
        else
            this.setState({ loaded: true });
    }

    load(masterID) {
        qreq.get('/api/admin/blog/get/' + masterID, j => {
            if (j.item)
                this.setState({ info: j.item, loaded: true });
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    delete() {
        Pop.showConfirm(<L>Are you sure you want to delete this blog post?</L>, 'Delete Post', () => {
            qreq.post('/api/admin/blog/delete', { id: this.state.info.id }, j => {
                if (j.errorCode === 0) {
                    this.success('Post has been deleted.');
                    this.props.navigate('/admin/blog');
                }
                else
                    this.alert(j.errorMessage);
            }, this.unkownErrorCallback);
        });
    }

    submit(e) {
        if (e) e.preventDefault();
        var info = { ...this.state.info };
        info.images.forEach(i => {
            i.base64Content = null;
        });
        this.setState({ saving: true });
        qreq.post('/api/admin/blog/save', info, j => {
            if (j.item) {
                this.success('Blog post has been saved.');
                this.props.navigate('/admin/blog/edit/' + j.item.masterID, { replace: true });
                this.load(j.item.masterID);
            }
            else
                this.alert(j.errorMessage);
            this.setState({ saving: false });
        }, () => {
            this.unkownErrorCallback();
            this.setState({ saving: false });
        });
    }

    render() {
        return <AdminCom subPath={[['/admin/blog', 'Blog'], [false, 'Post']]}>
            <div className="container">
                <form onSubmit={this.submit}>
                    <div className="mb-3 d-flex justify-content-end align-items-center gap-1">
                        <h3 className="flex-fill">Post {this.state.info.id ? <button type="button" onClick={() => this.delete()} className="btn btn-danger"><Icon icon="faTrash" /></button> : ''}</h3>
                        <button type="submit" className="btn btn-success btn-lg" disabled={this.state.saving || this.state.uploading !== 0}><Icon icon="faSave" /> Save</button>
                        <button type="button" onClick={this.goBack} className="btn btn-danger btn-lg" disabled={this.state.saving || this.state.uploading !== 0}><Icon icon="faArrowLeft" /> Go Back</button>
                    </div>
                    <FormInput model={this.state.info} name="title" label="Title" type="text" required />
                    {this.state.loaded ? <div className="mb-5">
                        <div id="quill-toolbar"></div>
                        <ReactQuill theme="snow" modules={{
                            toolbar: [
                                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                [{ 'font': [] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                ['blockquote', 'code-block'],
                                ['link'],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                [{ 'script': 'sub' }, { 'script': 'super' }],
                                [{ 'indent': '-1' }, { 'indent': '+1' }],
                                [{ 'direction': 'rtl' }],
                                [{ 'color': [] }, { 'background': [] }],
                                [{ 'align': [] }],
                                ['clean']]
                        }} defaultValue={this.state.info.body} onChange={v => this.setState({ info: { ...this.state.info, body: v } })} style={{ height: '200px' }} />
                    </div> : <LoadingAlert />}
                    <UploadPad item={this.state.info} name="images" onUploadBegin={() => this.setState({ uploading: this.state.uploading + 1 })} onUploadEnd={() => this.setState({ uploading: this.state.uploading - 1 })} />
                    <div className="mb-3 d-flex justify-content-end align-items-center gap-1">
                        <button type="submit" className="btn btn-success btn-lg" disabled={this.state.saving || this.state.uploading !== 0}><Icon icon="faSave" /> Save</button>
                        <button type="button" onClick={this.goBack} className="btn btn-danger btn-lg" disabled={this.state.saving || this.state.uploading !== 0}><Icon icon="faArrowLeft" /> Go Back</button>
                    </div>
                </form>
            </div>
        </AdminCom>;
    }
}

export default withParamsAndNavigate(AdminBlogEdit);