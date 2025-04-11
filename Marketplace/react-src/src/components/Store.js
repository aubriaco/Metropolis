/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Cart from "../shared/Cart";
import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import Alert from "./Alert";
import BaseCom from "./BaseCom";
import Card from "./Card";
import L from "./Lang";
import LoadingAlert from "./LoadingAlert";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Link } from "react-router-dom";
import "./Store.css";
import { WebGlobal } from "../layouts/Web";

class Store extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            vendor: {},
            products: [],
            announcement: null
        };
        this.getProducts = this.getProducts.bind(this);
        this.addToCart = this.addToCart.bind(this);
    }

    componentDidMount() {
        WebGlobal.setSearchVisible(true);
        this.setState({ loaded: false });
        qreq.get('/api/vendor/get?ident=' + this.props.params.vendorMID, j => {
            if (j.item) {
                this.setState({ vendor: j.item });
                this.getProducts(j.item.masterID);
            }
            else {
                this.setState({ error: j.errorMessage });
            }
            this.setState({ loaded: true });
        }, this.unkownErrorCallback);
    }

    getProducts(vendorMID) {
        qreq.get('/api/product/list?vendorMasterId=' + vendorMID, j => {
            if (j.list)
                this.setState({ products: j.list });
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    addToCart(a) {
        Cart.add(a.id);
    }

    render() {
        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title={this.state.error ? 'Error' : this.state.vendor.name} />
                <div className="container pt-3">
                    {!this.state.loaded ? <LoadingAlert /> : this.state.error ? <Alert type="danger">{this.state.error}</Alert> : <>
                        <Card className="Store-cover mt-0 mt-md-5" style={{ backgroundImage: 'url(\'' + (this.state.vendor.coverImageUrl ? Globals.imageUrl(this.state.vendor.coverImageUrl) : '/img/bg-default.png') + '\')', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center' }}>
                            <div className="Store-cover-gradient">
                                <div className="row align-items-center">
                                    <div className="col-md-2">
                                        <img src={this.state.vendor.imageUrl ? Globals.imageUrl(this.state.vendor.imageUrl) : '/img/noimage.png'} alt="" className="img-fluid px-2" />
                                    </div>
                                    <div className="col-md-10">
                                        <h2 className="Store-name mb-3 text-center text-md-start">
                                            <span>{this.state.vendor.name}</span>
                                        </h2>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {this.state.vendor.description ? <Card title={'About ' + this.state.vendor.name}>
                            {this.state.vendor.description}
                        </Card> : ''}

                        {this.state.announcement ? <Card title="Announcement">

                        </Card> : ''}

                        <div className="product-grid d-flex flex-column gap-4 mb-5">
                            {this.state.products.map(a => <div key={a.id} className="card rounded-0 border">
                                <div className="row g-0">
                                    <div className="col-md-4">
                                        <Link to={'/p/' + a.ident} className="bg-light d-block">
                                            <img src={Globals.imageUrl(a.displayImageUrl)} className="p-3" alt="..." style={{ display: 'block', maxHeight: '200px', width: 'auto', margin: '0 auto' }} />
                                        </Link>
                                    </div>
                                    <div className="col-md-8">
                                        <div className="card-body">
                                            <div className="product-info">
                                                <Link to={'/c/' + a.categoryIdent}>
                                                    <p className="product-catergory font-13 mb-1">{a.categoryName}</p>
                                                </Link>
                                                <Link to={'/v/' + this.state.vendor.ident + '/' + a.ident}>
                                                    <h6 className="product-name mb-2">{a.name}</h6>
                                                </Link>
                                                <p className="card-text">{a.shortDescription}</p>

                                                <div className="cursor-pointer" ng-bind-html="a.ratingHTML"></div>

                                                <div className="d-flex align-items-center">
                                                    <div className="mb-1 product-price">
                                                        {a.comparePrice && a.price !== a.comparePrice ? <span className="me-1 text-decoration-line-through">{Globals.formatter.format(a.comparePrice)}</span> : ''}
                                                        <span className="fs-5">{Globals.formatter.format(a.price)}</span>
                                                    </div>
                                                </div>
                                                <div className="product-action mt-2">
                                                    <div className="d-flex gap-2">
                                                        <button type="buton" className="btn btn-dark btn-ecomm" onClick={() => this.addToCart(a)}> <i className="bx bxs-cart-add"></i> <L>Add to Cart</L> </button>
                                                        <Link to={'/v/' + this.state.vendor.ident + '/' + a.ident} className="btn btn-light btn-ecomm"><i className="bx bx-zoom-in"></i> <L>View Product</L> </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>)}
                        </div>
                    </>}
                </div>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(Store);