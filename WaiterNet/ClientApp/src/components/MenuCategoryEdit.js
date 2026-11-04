import FormInput from "./FormInput";
import BaseCom from "./BaseCom";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import Card from "./Card";
import L from "./Lang";
import SubNav from "./SubNav";
import { qreq } from "../shared/qrequest";
import Auth from "../shared/Auth";
import Alert from "./Alert";
import UploadPad from "./UploadPad";
import { Link } from "react-router-dom";
import LoadingAlert from "./LoadingAlert";
import Icon from "./Icon";

class MenuCategoryEdit extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            item: {
                images: []
            }
        };
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if(!u)
                window.location.replace('/login');
            else {
                if(this.props.params.categoryID) {
                    qreq.get('/api/waiter/category/get?id=' + this.props.params.categoryID, j => {
                        if(j.item)
                            this.setState({ item: j.item, loaded: true });
                        else if(j.errorCode)
                            this.alert(j.errorMessage);
                    });
                }
                else {
                    qreq.get('/api/user/extra', j => {
                        if(j.item) {
                            this.setState({ item: { ...this.state.item, vendorID: j.item.activeVendorID }, loaded: true });
                        }
                    });
                }
            }
        });
    }

    submit(e) {
        if (e)
            e.preventDefault();
        var item = {...this.state.item};
        item.images.forEach(i => {
            i.base64Content = null;
        });
        delete item.imagesJson;
        item.imageID = 0;
        this.setState({ saving: true });
        qreq.post('/api/waiter/category/save', item, j => {
            if(j.item)
                this.goBack();
            else if(j.errorCode)
                this.showError(j.errorMessage);
            this.setState({ saving: false });
        }, () => {
            this.showError('Unknown error ocurred. Please try again.');
            this.setState({ saving: false });
        });
    }

    render() {
        return <div className="MenuCategoryEdit">
            {!this.state.loaded ? <SubNav /> : ''}
            <h2>Category</h2>
            <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/manage/menu"><L>Categories</L></Link></li>
                <li className="breadcrumb-item active">{this.state.item.name ? this.state.item.name : <L>Category</L>}</li>
            </ol>
            {!this.state.loaded ? <LoadingAlert /> : <form onSubmit={this.submit}>
                <SubNav>
                    <button type="submit" className="btn btn-lg btn-primary" disabled={this.state.uploading || this.state.saving}><Icon icon="faSave" /> <span className="d-none d-md-inline"><L>Save</L></span></button>
                </SubNav>
                <Card title="Category Information" className="bg-light">
                    <FormInput model={this.state.item} name="name" label="Category Name" type="text" placeholder="Drinks" required />
                    <UploadPad item={this.state.item} name="images" onUploadBegin={() => this.setState({ uploading: true })} onUploadEnd={() => this.setState({ uploading: false })} squareThumb />
                </Card>
                <div className="btn-group mb-2">
                    <button type="submit" className="btn btn-lg btn-primary" disabled={this.state.uploading || this.state.saving}><L>Save</L></button>
                    <button type="button" className="btn btn-lg btn-secondary" onClick={this.goBack} disabled={this.state.uploading || this.state.saving}><L>Go Back</L></button>
                </div>
                {this.state.uploading ? <Alert type="info"><L>Uploading... Please wait...</L></Alert> : ''}
                {this.state.error ? <Alert type="danger"><L>{this.state.error}</L></Alert> : ''}
            </form>}
        </div>;
    }
}

export default withParamsAndNavigate(MenuCategoryEdit);