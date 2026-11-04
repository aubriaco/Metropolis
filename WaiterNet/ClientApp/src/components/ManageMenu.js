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
import Globals from "../shared/Globals";
import './ManageMenu.css';

class ManageMenu extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            category: {}
        };
        this.load = this.load.bind(this);
    }


    componentDidMount() {
        this.load();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.params.categoryID !== this.props.params.categoryID)
            this.load();
    }

    load() {
        this.setState({ list: [], category: {}, loaded: false });
        Auth.getLogin(u => {
            if (!u)
                window.location.replace('/login');
            else {
                if (this.props.params.categoryID) {
                    qreq.get('/api/waiter/category/get?id=' + this.props.params.categoryID, j => {
                        if (j.item) {
                            this.setState({ category: j.item });
                            qreq.get('/api/waiter/item/list?categoryID=' + this.props.params.categoryID, j => {
                                if (j.list)
                                    this.setState({ list: j.list, loaded: true });
                                else if (j.errorCode)
                                    this.alert(j.errorMessage);
                            });
                        }
                        else if (j.errorCode)
                            this.alert(j.errorMessage);
                    });
                }
                else {
                    qreq.get('/api/waiter/category/list', j => {
                        if (j.list)
                            this.setState({ list: j.list, loaded: true });
                    });
                }
            }
        });
    }

    render() {
        return <div className="ManageMenu">
            <h2><L>Manage Menu</L> {this.state.category.name ? <> <L>for</L> {this.state.category.name}</> : ''}</h2>
            {this.props.params.categoryID ? <>
                <SubNav>
                    <Link to={'/manage/menu/category/' + this.state.category.id + '/new-item'} role="button" className="btn btn-primary btn-lg"><Icon icon="faPlus" /> <L>New Item</L></Link>
                </SubNav>
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/manage/menu"><L>Categories</L></Link></li>
                    <li className="breadcrumb-item active">{this.state.category.name ?? '...'}</li>
                </ol>
                {this.state.loaded ? this.state.list.length === 0 ? <Alert type="warning"><L>This category has no menu items. <Link to={'/manage/menu/category/' + this.state.category.id + '/new-item'}><L>Create your first menu item inside this category.</L></Link></L></Alert> :
                    <div className="list-group">
                        {this.state.list.map(i => <Link key={i.id} to={'/manage/menu/category/' + this.props.params.categoryID + '/item/' + i.id} className="list-group-item">
                            <div className="d-flex justify-content-start align-items-center">
                                <div className="DisplayImage">
                                    <img src={i.imageURL ? Globals.serverUrl + i.imageURL : '/img/noimage.png'} alt="" className="thumb img-fluid rounded" />
                                </div>
                                <h4 className="ms-3 fs-3">{i.name}</h4>
                                <div className="ms-auto me-3 fs-3 text-secondary">{Globals.getFormatter().format(i.price)}</div>
                            </div>
                        </Link>)}
                    </div> : <LoadingAlert />}
            </> : <>
                <SubNav>
                    <Link to="/manage/menu/new-category" role="button" className="btn btn-primary btn-lg"><Icon icon="faPlus" /> <L>New Category</L></Link>
                </SubNav>
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active"><L>Categories</L></li>
                </ol>
                {this.state.loaded ? this.state.list.length === 0 ? <Alert type="warning"><L>You have no categories.</L> <Link to="/manage/menu/new-category"><L>Create your first category.</L></Link></Alert> :
                    <div className="list-group">
                        {this.state.list.map(i => <div key={i.id} className="d-flex list-group-item">
                            <Link to={'/manage/menu/category/' + i.id} className="d-block flex-fill">
                                <div className="d-flex justify-content-start align-items-center">
                                    <div className="DisplayImage">
                                        <img src={i.imageURL ? Globals.serverUrl + i.imageURL : '/img/noimage.png'} alt="" className="thumb img-fluid rounded" />
                                    </div>
                                    <h4 className="ms-3 fs-3">{i.name}</h4>
                                </div>
                            </Link>
                            <Link to={'/manage/menu/category/' + i.id + '/edit'} role="button" className="btn btn-lg d-block fs-2 text-muted p-3"><Icon icon="faPencil" /></Link>
                        </div>)}
                    </div> : <LoadingAlert />}
            </>}
        </div>;
    }
}

export default withParamsAndNavigate(ManageMenu);