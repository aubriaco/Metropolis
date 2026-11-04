import { Link } from "react-router-dom";
import BaseCom from "./BaseCom";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import SubNav from "./SubNav";
import Icon from "./Icon";
import L from "./Lang";
import { qreq } from "../shared/qrequest";
import { Alert } from "reactstrap";
import LoadingAlert from "./LoadingAlert";
import Auth from "../shared/Auth";

class ManageTables extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: []
        };
        this.load = this.load.bind(this);
    }


    componentDidMount() {
        this.load();
    }


    load() {
        this.setState({ list: [], loaded: false });
        Auth.getLogin(u => {
            if (!u)
                window.location.replace('/login');
            else {

                qreq.get('/api/waiter/table/list', j => {
                    if (j.list)
                        this.setState({ list: j.list, loaded: true });
                });

            }
        });
    }

    render() {
        return <div className="ManageMenu">
            <h2><L>Manage Tables</L></h2>

            <SubNav>
                <Link to="/manage/tables/new" role="button" className="btn btn-primary btn-lg"><Icon icon="faPlus" /> <L>New Table</L></Link>
            </SubNav>
            <ol className="breadcrumb">
                <li className="breadcrumb-item active"><L>Tables</L></li>
            </ol>
            {this.state.loaded ? this.state.list.length === 0 ? <Alert type="warning"><L>You have no tables.</L> <Link to="/manage/tables/new"><L>Create your first table.</L></Link></Alert> :
                <div className="list-group">
                    {this.state.list.map(i => <div key={i.id} className="d-flex list-group-item">
                        <Link to={'/manage/tables/' + i.id + '/edit'} className="d-block flex-fill">
                            <div className="d-flex justify-content-start align-items-center">
                                <h4 className="ms-3 fs-3">{i.name}</h4>
                            </div>
                        </Link>
                    </div>)}
                </div> : <LoadingAlert />}

        </div>;
    }
}

export default withParamsAndNavigate(ManageTables);