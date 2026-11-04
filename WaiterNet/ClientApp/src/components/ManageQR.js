import { Alert } from "reactstrap";
import Auth from "../shared/Auth";
import BaseCom from "./BaseCom";
import L from "./Lang";
import SubNav from "./SubNav";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Link } from "react-router-dom";
import LoadingAlert from "./LoadingAlert";
import { qreq } from "../shared/qrequest";
import Globals from "../shared/Globals";
import Icon from "./Icon";

class ManageQR extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: []
        };
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if (!u)
                window.location.replace('/login');
            else {
                qreq.get('/api/waiter/qr/list', j => {
                    if (j.list)
                        this.setState({ list: j.list, loaded: true });
                    else if (j.errorCode)
                        this.alert(j.errorMessage);
                });
            }
        });
    }

    render() {
        return <div className="ManageQR">
            <h2><L>QR Codes</L></h2>
            <SubNav />

            <ol className="breadcrumb">
                <li className="breadcrumb-item active"><L>Qr Codes</L></li>
            </ol>
            {this.state.loaded ? this.state.list.length === 0 ? <Alert type="warning"><L>You have no QR Codes.</L></Alert> :
                <div className="list-group">
                    {this.state.list.map(i => <div key={i.id} className="d-flex list-group-item">
                        <a title="Print QR" href={Globals.serverUrl + '/api/waiter/qr/print/' + i.id} target="_blank" rel="noreferrer" className="flex-fill">
                            <div className="d-flex justify-content-start align-items-center">
                                <img src={Globals.serverUrl + '/api/waiter/qr/render/' + i.id} alt="" className="thumb img-fluid rounded" />
                                <h4 className="ms-3 fs-3">{i.name}</h4>
                            </div>
                        </a>
                        <a title="QR Only" href={Globals.serverUrl + '/api/waiter/qr/render/' + i.id} target="_blank" rel="noreferrer" role="button" className="btn btn-lg d-block fs-3 text-muted p-3"><Icon icon="faQrcode" /></a>
                    </div>)}
                </div> : <LoadingAlert />}
        </div>;
    }
}

export default withParamsAndNavigate(ManageQR);