/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import './Blog.css';
import L from "./Lang";

class BlogPost extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            item: {}
        };
    }

    componentDidMount() {
        qreq.get('/api/blog/get?ident=' + this.props.params.ident, j => {
            if(j.item)
                this.setState({ item: j.item });
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    render() {
        return <div className="page-wrapper">
        <div className="page-content">
            <SubHeader title="Article" path={[['/blog', 'Blog']]} />
            <section className="py-4">
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-lg-12">
                            <div className="blog-right-sidebar p-3">
                                <div className="card shadow-none bg-transparent">
                                    <img src={Globals.imageUrl(this.state.item.displayImageUrl)} className="img-fluid d-none" alt="" />
                                    <div className="Blog-image" style={{backgroundImage: 'url(\'' + Globals.imageUrl(this.state.item.displayImageUrl) + '\')'}}></div>
                                    <div className="card-body p-0">
                                        <div className="list-inline mt-4 px-3">	<a href="javascript:;" className="list-inline-item"><i class="bx bx-user me-1"></i><L>By</L> {this.state.item.createdByUserName}</a>
                                            <a href="javascript:;" className="list-inline-item"><i class='bx bx-calendar me-1'></i>{Globals.toLocaleDateString(this.state.item.publishedDate)}</a>
                                        </div>
                                        <h4 className="mt-4 px-3">{this.state.item.title}</h4>
                                        <div className="px-3 py-4" dangerouslySetInnerHTML={{ __html: this.processHTML(this.state.item.body, true) }}>
                                            
                                        </div>
                                        <div className="d-flex align-items-center gap-2 py-4 border-top border-bottom px-3 d-none">
                                            <div className="">
                                                <h6 className="mb-0 text-uppercase">Share This Post</h6>
                                            </div>
                                            <div className="list-inline blog-sharing">	<a href="javascript:;" className="list-inline-item"><i class='bx bxl-facebook'></i></a>
                                                <a href="javascript:;" className="list-inline-item"><i class='bx bxl-twitter'></i></a>
                                                <a href="javascript:;" className="list-inline-item"><i class='bx bxl-linkedin'></i></a>
                                                <a href="javascript:;" className="list-inline-item"><i class='bx bxl-instagram'></i></a>
                                                <a href="javascript:;" className="list-inline-item"><i class='bx bxl-tumblr'></i></a>
                                            </div>
                                        </div>
                                        <div className="author d-flex align-items-center gap-3 py-4 px-3">
                                            <img src={Globals.imageUrl('/img/noimage.png')} alt="" width="80" />
                                            <div className="">
                                                <h6 className="mb-0">{this.state.item.createdByUserName}</h6>
                                                <p className="mb-0">{this.state.item.createdByUserSlogan}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>;
    }
}

export default withParamsAndNavigate(BlogPost);