/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link } from "react-router-dom";
import { qreq } from "../../shared/qrequest";
import AdminCom from "./AdminCom";
import BaseCom from "../BaseCom";
import { withParamsAndNavigate } from "../WithParamsAndNavigate";
import Alert from "../Alert";
import LoadingAlert from "../LoadingAlert";
import Globals from "../../shared/Globals";
import Icon from "../Icon";

class AdminBlog extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            list: null
        };
    }

    componentDidMount() {
        qreq.get('/api/admin/blog/list', j => {
            if(j.list)
                this.setState({ list: j.list });
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback)
    }

    render() {
        return <AdminCom subPath={[[false, 'Blog']]}>
            <div className="container">
            <div className="mb-3 d-flex justify-content-end align-items-center gap-1">
                <h3 className="flex-fill">Posts</h3>
                <Link to="/admin/blog/new" className="btn btn-primary btn-lg"><Icon icon="faPlus" /> New Post</Link>
            </div>
            {this.state.list ? this.state.list.length !== 0 ? <div className="list-group">
                {this.state.list.map(i => <Link key={i.id} to={'/admin/blog/edit/' + i.masterID} className="list-group-item list-group-item-action d-flex align-items-center">
                    <div className="fs-5 text-primary flex-fill">{i.title}</div>
                    <span className="text-muted">{Globals.toMDYHMAMPMLocalDateString(i.createdDate)}</span>
                </Link>)}
            </div> : <Alert>No blog posts in system.</Alert> : <LoadingAlert />}
            </div>
        </AdminCom>;
    }
}

export default withParamsAndNavigate(AdminBlog);