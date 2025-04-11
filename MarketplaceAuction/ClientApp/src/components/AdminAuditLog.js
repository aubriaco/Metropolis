import Auth from "../shared/Auth";
import BaseCom from "./BaseCom";
import L from "./Lang";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Link } from 'react-router-dom';
import AdminNav from "./AdminNav";
import { qreq } from "../shared/qrequest";

class AdminAuditLog extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: []
        };
        this.load = this.load.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(j => {
            this.setState({ user: j });
            if (j)
                this.load();
            else
                this.props.navigate('/');
        });
    }

    load() {
        qreq.get('/api/admin/auditlog/list', j => {
            if (j.list)
                this.setState({ list: j.list });
        });
    }

    render() {
        if (!this.state.user)
            return <></>;
        return <div className="container">
            <AdminNav />
            <h1 className="mb-5"><L>Administration: Audit Log</L></h1>
            <div className="auditlog">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>App</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.list.map(i => <tr key={i.id}>
                            <td>{i.userID ? <>{i.username} ({i.email})</> : <i>System</i>}</td>
                            <td>{i.appName}</td>
                            <td>
                                {i.location ? <Link to={i.location}>{i.message}</Link> : i.message}
                            </td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    }
}

export default withParamsAndNavigate(AdminAuditLog);