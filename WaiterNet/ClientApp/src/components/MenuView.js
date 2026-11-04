import { Link } from "react-router-dom";
import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import SubNav from "./SubNav";
import L from "./Lang";

class MenuView extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            qr: {},
            vendor: {},
            category: {},
            mainLevel: true
        }
        this.load = this.load.bind(this);
    }

    componentDidMount() {
        this.load();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.params.qr !== this.props.params.qr
            || prevProps.params.categoryID !== this.props.params.categoryID)
            this.load();
    }

    load() {
        if (this.props.params.qr) {
            this.setState({ list: [] });
            qreq.get('/api/waiter/qr/get?ident=' + this.props.params.qr, j => {
                if (j.item) {
                    var qr = j.item;
                    this.setState({ qr: j.item });
                    qreq.get('/api/vendor/get/public?id=' + j.item.vendorID, j => {
                        if (j.item) {
                            this.setState({ vendor: j.item });
                            if (qr.tableID) {
                                qreq.get('/api/waiter/table/get/public?vendorID=' + qr.vendorID + '&id=' + qr.tableID, j => {
                                    if (j.item)
                                        this.setState({ table: j.item });
                                });
                            }
                        }
                    });
                    if (this.props.params.categoryID) {
                        this.setState({ mainLevel: false });
                        qreq.get('/api/waiter/category/get/public?vendorID=' + j.item.vendorID + '&id=' + this.props.params.categoryID, j => {
                            if (j.item) {
                                this.setState({ category: j.item });
                                qreq.get('/api/waiter/item/list/public?vendorID=' + j.item.vendorID + '&categoryID=' + j.item.id, j => {
                                    if (j.list)
                                        this.setState({ list: j.list });
                                });
                            }
                        });
                    }
                    else {
                        this.setState({ mainLevel: true });
                        qreq.get('/api/waiter/category/list/public?vendorID=' + j.item.vendorID, j => {
                            if (j.list)
                                this.setState({ list: j.list });
                        });
                    }
                }
                else if (j.errorCode)
                    this.alert(j.errorMessage);
                this.setState({ loaded: true });
            });
        }
    }

    render() {

        if (this.props.params.categoryID) {
            return <div className="MenuView">
                <SubNav noBack={this.state.mainLevel} hideLeft showCart qr={this.props.params.qr} />
                <h1>{this.state.vendor.name} {this.state.table ? <span className="text-muted">{this.state.table.name}</span> : ''}</h1>
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">{this.state.vendor.name ?? '...'}</li>
                    <li className="breadcrumb-item active">{this.state.category.name ?? '...'}</li>
                </ol>
                <div className="list-group">
                    {this.state.list.map(i => <Link key={i.id} to={'/qr/' + this.props.params.qr + '/category/' + i.categoryID + '/item/' + i.id}>
                        <div className="list-group-item d-flex justify-content-start align-items-center">
                            <div className="DisplayImage">
                                <img src={i.imageURL ? Globals.serverUrl + i.imageURL : '/img/noimage.png'} alt="" className="thumb img-fluid rounded" />
                            </div>
                            <h4 className="ms-3 fs-3">{i.name}</h4>
                            <div className="ms-auto me-3 fs-3 text-secondary">{Globals.getFormatter().format(i.price)}</div>
                        </div>
                    </Link>)}
                </div>
            </div>;
        }

        return <div className="MenuView">
            <SubNav noBack={this.state.mainLevel} hideLeft showCart qr={this.props.params.qr} />
            <h1>{this.state.vendor.name} {this.state.table ? <span className="text-muted">{this.state.table.name}</span> : ''}</h1>
            <ol className="breadcrumb">
                <li className="breadcrumb-item active">{this.state.vendor.name ?? '...'}</li>
            </ol>
            <div className="list-group">
                {this.state.list.map(i => <Link key={i.id} to={'/qr/' + this.props.params.qr + '/category/' + i.id}>
                    <div className="list-group-item d-flex justify-content-start align-items-center">
                        <div className="DisplayImage">
                            <img src={i.imageURL ? Globals.serverUrl + i.imageURL : '/img/noimage.png'} alt="" className="thumb img-fluid rounded" />
                        </div>
                        <h4 className="ms-3 fs-3">{i.name}</h4>
                    </div>
                </Link>)}
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(MenuView);