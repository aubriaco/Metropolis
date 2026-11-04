import Auth from "../shared/Auth";
import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import Address from "./Address";
import Alert from "./Alert";
import BaseCom from "./BaseCom";
import Card from "./Card";
import FormInput from "./FormInput";
import Icon from "./Icon";
import L from "./Lang";
import LoadingAlert from "./LoadingAlert";
import { Pop } from "./PopModal";
import SubNav from "./SubNav";
import Toggler from "./Toggler";
import UploadPad from "./UploadPad";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class VendorSettings extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: {
                settings: {},
                address: {}
            },
            uploads: {
                logo: []
            }
        };
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if (!u)
                window.location.assign('/login');
            else {
                qreq.get('/api/vendor/get/active', j => {
                    if (j.item)
                        this.setState({ info: j.item, loaded: true });
                    else
                        this.alert(j.errorMessage);
                });
            }
        });
    }

    submit(e) {
        if (e) e.preventDefault();
        qreq.post('/api/vendor/settings/save', { ...this.state.info }, j => {
            if (j.errorCode === 0) {
                Pop.show(<L>Information has been updated.</L>, <L>Success</L>);
            }
            else
                this.showError(j.errorMessage);
        });
    }

    render() {
        return <div className="VendorSettings">
            {!this.state.loaded ? <SubNav /> : ''}
            <h1><L>Settings</L></h1>
            {this.state.loaded ? <form onSubmit={this.submit}>
                <SubNav>
                    <button type="submit" className="btn btn-lg btn-primary" disabled={this.state.uploading || this.state.saving}><Icon icon="faSave" /> <span className="d-none d-md-inline"><L>Save</L></span></button>
                </SubNav>
                <div className="row">
                    <div className="col-md-6">
                        <Card title="Restaurant Information">
                            <FormInput model={this.state.info} name="name" label="Business Name" type="text" required />
                            <FormInput model={this.state.info} name="description" label="Business Description" type="textarea" />
                        </Card>
                    </div>
                    <div className="col-md-6">
                        <Card title="Logo">
                            <UploadPad item={this.state.uploads} name="logo" single onFileAdd={() => this.setState({ uploading: true, info: { ...this.state.info, imageUrl: null } })} onUploadEnd={item => this.setState({ uploading: false, info: { ...this.state.info, imageIdent: item.ident, imageUrl: null } })} />
                            {this.state.info.imageIdent && this.state.info.imageUrl ? <img src={Globals.serverUrl + this.state.info.imageUrl} alt="" className="img-thumbnail img-fluid d-block mx-auto my-2" style={{ maxWidth: '250px' }} /> : ''}
                        </Card>
                    </div>
                </div>
                <Address item={this.state.info.address} />
                <Card title="System Settings">
                    <Toggler model={this.state.info.settings} name="requireUpfrontPayment" label="Require the client to pay online before processing the order." />
                    <Toggler model={this.state.info.settings} name="rejectUnconfirmedLocation" label="Reject orders from unconfirmed phone location." />
                </Card>
                {!this.state.success ? <div className="btn-group mb-2">
                    <button type="submit" className="btn btn-lg btn-primary" disabled={this.state.uploading || this.state.saving}><L>Save</L></button>
                </div> : ''}
                {this.state.success ? <Alert type="success"><L>Information has been updated.</L></Alert> : ''}
                {this.state.error ? <Alert type="danger"><L>{this.state.error}</L></Alert> : ''}
            </form> : <LoadingAlert />}
        </div>;
    }
}

export default withParamsAndNavigate(VendorSettings);