/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link } from "react-router-dom";
import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import Paging from "./Paging";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import './Blog.css';
import L from "./Lang";
import LoadingAlert from "./LoadingAlert";
import Alert from "./Alert";

class Blog extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            pageCount: 1,
            page: 1,
            loaded: false
        }
    }

    componentDidMount() {
        qreq.get('/api/blog/list', j => {
            if(j.list)
                this.setState({ list: j.list, totalCount: j.totalCount, pageCount: j.pageCount, loaded: true });
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    render() {
        return <div className="page-wrapper">
        <div className="page-content">
            <SubHeader title="Blog" />
            <section className="py-4">
                <div className="container">
                    {this.state.loaded ? this.state.list.length === 0 ? <Alert><L>There are no articles.</L></Alert> :
                    <div className="row">
                        <div className="col-12 col-lg-12">
                            <div className="blog-right-sidebar">
                                {this.state.list.map(i => <div className="card mb-4 rounded-0 border shadow-none">
                                    <img src={Globals.imageUrl(i.displayImageUrl)} className="card-img-top rounded-0 d-none" alt="" />
                                    <div className="Blog-image" style={{backgroundImage: 'url(\'' + Globals.imageUrl(i.displayImageUrl) + '\')'}}></div>
                                    <div className="card-body">
                                        <div className="list-inline">	<a href="javascript:;" className="list-inline-item"><i className="bx bx-user me-1"></i><L>By</L> {i.createdByUserName}</a>
                                            <a href="javascript:;" className="list-inline-item"><i className="bx bx-calendar me-1"></i>{Globals.toLocaleDateString(i.publishedDate)}</a>
                                        </div>
                                        <h4 className="mt-4 mb-3"><Link to={'/blog/' + i.ident}>{i.title}</Link></h4>
                                        <div className="mb-3 mx-1">{i.shortDescription}</div>
                                        <div>
                                        <Link to={'/blog/' + i.ident} className="btn btn-dark btn-ecomm"><L>Read More</L> <i className="bx bx-chevrons-right"></i></Link>
                                        </div>
                                    </div>
                                </div>)}
                                <hr />
                                <Paging pageCount={this.state.pageCount} currentPage={this.state.page} />
                            </div>
                        </div>
                    </div> : <LoadingAlert />}
                </div>
            </section>
        </div>
    </div>;
    }
}

export default withParamsAndNavigate(Blog);