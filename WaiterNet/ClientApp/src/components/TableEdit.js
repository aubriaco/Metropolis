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

class TableEdit extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            item: {}
        };
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if(!u)
                this.props.navigate('/login');
            else {
                if(this.props.params.tableID) {
                    qreq.get('/api/waiter/table/get?id=' + this.props.params.tableID, j => {
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
        this.setState({ saving: true });
        qreq.post('/api/waiter/table/save', item, j => {
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
        return <div className="TableEdit">
            <SubNav />
            <h2>Table</h2>
            <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/manage/menu"><L>Tables</L></Link></li>
                <li className="breadcrumb-item active">{this.state.item.name ? this.state.item.name : <L>Table</L>}</li>
            </ol>
            {!this.state.loaded ? <LoadingAlert /> : <form onSubmit={this.submit}>
                <Card title="Table Information" className="bg-light">
                    <FormInput model={this.state.item} name="name" label="Category Name" type="text" placeholder="A1" required />
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

export default withParamsAndNavigate(TableEdit);