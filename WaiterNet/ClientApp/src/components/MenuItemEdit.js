import { Link } from "react-router-dom";
import BaseCom from "./BaseCom";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import SubNav from "./SubNav";
import Auth from "../shared/Auth";
import { qreq } from "../shared/qrequest";
import LoadingAlert from "./LoadingAlert";
import FormInput from "./FormInput";
import L from "./Lang";
import Card from "./Card";
import UploadPad from "./UploadPad";
import Alert from "./Alert";
import Icon from "./Icon";

class MenuItemEdit extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            item: {
                images: []
            },
            category: {}
        };
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if(!u)
                window.location.replace('/login');
            else {
                qreq.get('/api/waiter/category/get?id=' + this.props.params.categoryID, j => {
                    if(j.item) {
                        this.setState({ category: j.item });
                        if(this.props.params.itemID) {
                            qreq.get('/api/waiter/item/get?id=' + this.props.params.itemID, j => {
                                if(j.item)
                                    this.setState({ item: j.item, loaded: true });
                                else if(j.errorCode)
                                    this.alert(j.errorMessage);
                            });
                        }
                        else {
                            qreq.get('/api/user/extra', j => {
                                if(j.item) {
                                    this.setState({ item: { ...this.state.item, vendorID: j.item.activeVendorID } });
                                }
                            });
                            this.setState({ loaded: true });
                        }
                    }
                    else if(j.errorCode)
                        this.alert(j.errorMessage);
                });   
            }
        });
    }

    submit(e) {
        if(e)
            e.preventDefault();
        var item = {...this.state.item};
        item.categoryID = this.state.category.id;
        item.images.forEach(i => {
            i.base64Content = null;
        });
        delete item.imagesJson;
        item.imageID = 0;
        this.setState({ saving: true });
        qreq.post('/api/waiter/item/save', item, j => {
            if(j.errorCode === 0)
                this.goBack();
            else
                this.showError(j.errorMessage);
            this.setState({ saving: false });
        }, () => {
            this.showError('Unknown error ocurred. Please try again.');
            this.setState({ saving: false });
        });
    }

    render() {
        return <div className="MenuItemEdit">
            {!this.state.loaded ? <SubNav /> : ''}
            <h2>Menu Item</h2>
            <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/manage/menu"><L>Categories</L></Link></li>
                <li className="breadcrumb-item"><Link to="/manage/menu/category/1">{this.state.category.name ?? '...'}</Link></li>
                <li className="breadcrumb-item active">{this.state.item.name ? this.state.item.name : <L>Menu Item</L>}</li>
            </ol>
            {!this.state.loaded ? <LoadingAlert /> : <form onSubmit={this.submit}>
                <SubNav>
                    <button type="submit" className="btn btn-lg btn-primary" disabled={this.state.uploading || this.state.saving}><Icon icon="faSave" /> <span className="d-none d-md-inline"><L>Save</L></span></button>
                </SubNav>
                <Card title="Menu Item" className="bg-light">
                    <FormInput model={this.state.item} name="name" label="Menu Item Name" type="text" placeholder="House Margarita" required />
                    <div className="row row-cols-2 row-cols-md-6">
                        <div className="col">
                            <FormInput model={this.state.item} name="price" label="Price" type="number" step="0.01" placeholder="0.00" required preAddon='$' />
                        </div>
                    </div>
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

export default withParamsAndNavigate(MenuItemEdit);