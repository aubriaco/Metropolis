/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import L from "./Lang";
import Globals from "../shared/Globals";
import SubHeader from "./SubHeader";
import LoadingAlert from "./LoadingAlert";
import { qreq } from "../shared/qrequest";
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import Alert from "./Alert";
import Cart from "../shared/Cart";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Reviews from "./Reviews";
import { Link } from "react-router-dom";
import Wishlist from "../shared/Wishlist";
import Rating from "./Rating";
import { WebGlobal } from "../layouts/Web";

class Product extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            vendor: {},
            item: {
                tags: []
            },
            category: {},
            reviews: [],
            similar: [],
            tab: 'description'
        };

    
        this.getProduct = this.getProduct.bind(this);
        this.addToCart = this.addToCart.bind(this);
    }

    componentDidMount() {
        WebGlobal.setSearchVisible(true);
        this.setState({ loaded: false });
        if (this.props.params.productMID && !this.props.params.vendorMID) {
            this.getProduct(0, item => {
                qreq.get('/api/vendor/get?id=' + item.vendor.id, j => {
                    if (j.item) {
                        this.setState({ vendor: j.item });
                        this.props.navigate('/v/' + j.item.ident + '/' + item.ident, { replace: true });
                    }
                    else {
                        this.setState({ error: j.errorMessage, errorCode: j.errorCode });
                    }
                }, this.unkownErrorCallback);
            });
        }
        else {
            qreq.get('/api/vendor/get?ident=' + this.props.params.vendorMID, j => {
                if (j.item) {
                    this.setState({ vendor: j.item });
                    this.getProduct(j.item.id);
                }
                else {
                    this.setState({ error: j.errorMessage, errorCode: j.errorCode });
                }
            }, this.unkownErrorCallback);
        }
    }


    getProduct(vendorID, callback) {
        console.log('getProduct');
        qreq.get('/api/product/view?ident=' + this.props.params.productMID, j => {
            if (j.item) {
                if (vendorID !== 0 && j.item.vendor.id !== vendorID) {
                    this.setState({ error: 'This item does not belong to this vendor. URL link error.' });
                }
                else {
                    this.setState({ item: j.item });
                    if(callback)
                        callback(j.item);
                }
            }
            else {
                this.alert(j.errorMessage);
                this.setState({ error: j.errorMessage, errorCode: j.errorCode });
            }
            this.setState({ loaded: true });
        }, this.unkownErrorCallback);
    }

    addToCart() {
        Cart.add(this.state.item.id);
    }

    render() {        
        return <>
            <div className="page-wrapper">
                <div className="page-content">
                    <SubHeader title={this.state.item.id ? this.state.item.name : this.state.errorCode ? <L>Error</L> : <L>Loading...</L>} path={this.state.vendor.id ? [['/v/' + this.state.vendor.ident, this.state.vendor.name]] : null} />

                    {!this.state.loaded ? <LoadingAlert /> : this.state.errorCode ? <section className="py-4">
                        <div className="container">
                            <div className="product-detail-card">
                                <div className="product-detail-body">
                                    <h3 className="mt-3 mt-lg-0 mb-0"> <L>{this.state.error}</L> </h3>
                                    <hr />
                                    <p className="mb-3"> <L>This vendor is currently not active.</L> </p>
                                    <Link role="button" className="btn btn-primary" to="/"><i className="bx bx-home"></i> <L>Back to Home Page</L> </Link>
                                </div>
                            </div>
                        </div>
                    </section> : this.state.error ? <section className="py-4">
                        <div className="container">
                            <div className="product-detail-card">
                                <div className="product-detail-body">
                                    <h3 className="mt-3 mt-lg-0 mb-0"> <L>{this.state.error}</L> </h3>
                                    <hr />
                                    <p className="mb-3"> <L>Please check the URL or try your search again.</L> </p>
                                    <a className="btn btn-primary" href="/"><i className="bx bx-home"></i> <L>Back to Home Page</L> </a>
                                </div>
                            </div>
                        </div>
                    </section> : this.state.item ? <>

                        <section className="py-4">
                            <div className="container">
                                <div className="product-detail-card">
                                    <div className="product-detail-body">
                                        <div className="row g-0">
                                            <div className="col-12 col-lg-5">
                                                <div className="image-zoom-section p-3">

                                                    <OwlCarousel className="owl-theme" loop items={1} nav margin={10}>
                                                        {this.state.item.images ? this.state.item.images.map(a => <div key={a.id} className="item">
                                                            <div className="item">
                                                                <img src={Globals.imageUrl(a.url)} className="img-fluid" alt="" />
                                                            </div>
                                                        </div>) : ''}
                                                    </OwlCarousel>
                                                    <p className="text-center">Drag left or right to view more images.</p>
                                                </div>
                                            </div>
                                            <div className="col-12 col-lg-7">
                                                <div className="product-info-section p-3">
                                                    {!this.state.item.isActive ? <div className="mt-3 alert alert-danger">
                                                        <i className="bx bx-info-circle"></i>
                                                        <L>This product is still not active in</L>
                                                        <span ng-show="User.isAdmin"> <L>the vendors product management.</L></span> <a ng-show="!User.isAdmin" href="/my/vendors"><L>product management.</L></a>
                                                    </div> : ''}
                                                    {this.state.item.vendor && !this.state.item.vendor.isActive ? <div className="mt-3 alert alert-danger">
                                                        <i className="bx bx-info-circle"></i>
                                                        <L>This vendor is still not active.</L>
                                                    </div> : ''}
                                                    <h3 className="mt-3 mt-lg-0 mb-0">{this.state.item.name}</h3>
                                                    <div>
                                                        <Link to={'/v/' + this.state.vendor.ident}>{this.state.vendor.name}</Link>
                                                    </div>
                                                    <div className="product-rating d-flex align-items-center mt-2">
                                                        <div className="rates cursor-pointer font-13">
                                                            <Rating rating={this.state.item.rating} />
                                                        </div>
                                                        <div className="ms-1">
                                                            <p className="mb-0">({this.state.item.reviewCount} Reviews)</p>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center mt-3 gap-2">
                                                        {this.state.item.comparePrice && this.state.item.price !== Product.comparePrice ? <h5 className="mb-0 text-decoration-line-through text-light-3">{Globals.formatter.format(this.state.item.comparePrice)}</h5> : ''}
                                                        <h4 className="mb-0">{Globals.formatter.format(this.state.item.price)}</h4>
                                                    </div>
                                                    <div className="mt-3">
                                                        <h6> <L>Description:</L> </h6>
                                                        <p className="mb-0">{this.state.item.shortDescription}</p>
                                                    </div>
                                                    <dl className="row mt-3">
                                                        <dt className="col-sm-3"> <L>Product ID</L> </dt>
                                                        <dd className="col-sm-9">{this.state.item.masterID}</dd>
                                                        <dt className="col-sm-3"> <L>Delivery</L> </dt>
                                                        <dd className="col-sm-9"> <L>Puerto Rico</L> </dd>
                                                    </dl>

                                                    <div className="d-flex gap-2 mt-3">
                                                            <button type="button" onClick={this.addToCart} className="btn btn-dark btn-ecomm"><i className="bx bxs-cart-add"></i> <L>Add to Cart</L> </button>
                                                        <button type="button" onClick={() => Wishlist.add(this.state.item.id)} className="btn btn-light btn-ecomm"><i className="bx bx-heart"></i> <L>Add to Wishlist</L> </button>
                                                    </div>
                                                    <hr />
                                                    <div className="product-sharing d-none">
                                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                                            <div className="">
                                                                <button type="button" className="btn-social bg-twitter"><i className="bx bxl-twitter"></i></button>
                                                            </div>
                                                            <div className="">
                                                                <button type="button" className="btn-social bg-facebook"><i className="bx bxl-facebook"></i></button>
                                                            </div>
                                                            <div className="">
                                                                <button type="button" className="btn-social bg-linkedin"><i className="bx bxl-linkedin"></i></button>
                                                            </div>
                                                            <div className="">
                                                                <button type="button" className="btn-social bg-youtube"><i className="bx bxl-youtube"></i></button>
                                                            </div>
                                                            <div className="">
                                                                <button type="button" className="btn-social bg-pinterest"><i className="bx bxl-pinterest"></i></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section className="py-4">
                            <div className="container">
                                    <div className="product-more-info">
                                        <Tabs
                                            id="product-tabs"
                                            className="mb-0"
                                            onSelect={k => this.setState({ tab: k })}
                                            activeKey={this.state.tab}
                                        >
                                            <Tab eventKey="description" title={<span className="tab-title text-uppercase fw-500"><L>Description</L></span>}>
                                                <div className="pt-3" dangerouslySetInnerHTML={{ __html: this.processHTML(this.state.item.description) }}></div>
                                            </Tab>
                                            <Tab eventKey="profile" title={<span className="tab-title text-uppercase fw-500"><L>Tags</L></span>}>
                                                <div className="tags-box d-flex flex-wrap gap-2 pt-3">
                                                    {this.state.item.category ? <Link to={'/c/' + this.state.item.category.ident} className="btn btn-ecomm btn-outline-dark">{this.state.item.category.name}</Link> : ''}
                                                    {this.state.item.tags ? this.state.item.tags.map(a => <Link key={a} to={'/s/' + Globals.formatTagIdent(a)} className="btn btn-ecomm btn-outline-dark">{a}</Link>) : ''}
                                                </div>
                                            </Tab>
                                            <Tab eventKey="contact" title={<span className="tab-title text-uppercase fw-500"><L>Reviews</L></span>}>
                                                <Reviews item={this.state.item} />
                                            </Tab>
                                        </Tabs>

                                </div>
                            </div>
                        </section>
                        <section className="py-4">
                            <div className="container">
                                <div className="separator pb-4">
                                    <div className="line"></div>
                                    <h5 className="mb-0 fw-bold separator-title"> <L>Similar Products</L> </h5>
                                    <div className="line"></div>
                                </div>
                                <div className="product-grid">
                                    <div className="similar-products owl-carousel owl-theme position-relative owl-loaded owl-drag">







                                        <div className="owl-stage-outer">
                                            <div className="owl-stage" style={{ transform: 'translate3d(0px, 0px, 0px)', transition: 'all 0s ease 0s', width: '1848px' }} >
                                                {this.state.similar.map(a => <div key={a.id} className="owl-item active" style={{ width: '240px', marginRight: '24px' }} >
                                                    <div className="item">
                                                        <div className="card">
                                                            <div className="position-relative overflow-hidden" style={{ height: '200px' }} >
                                                                <div className="add-cart position-absolute top-0 end-0 mt-3 me-3">
                                                                    <button type="button" ng-click="Cart.add(a.id)"><i className="bx bx-cart-add"></i></button>
                                                                </div>
                                                                <div className="quick-view position-absolute start-0 bottom-0 end-0">
                                                                    <Link to={'/p/' + a.ident}> <L>View Product</L> </Link>
                                                                </div>
                                                                <Link to={'/p/' + a.ident}>
                                                                    <img src={Globals.imageUrl(a.images[0].url)} className="img-fluid" alt="..." />
                                                                </Link>
                                                            </div>
                                                            <div className="card-body px-0">
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    <div className="">
                                                                        <p className="mb-1 product-short-name">{a.categoryName}</p>
                                                                        <h6 className="mb-0 fw-bold product-short-title">{a.name}</h6>
                                                                    </div>
                                                                    <div className="icon-wishlist">
                                                                        <button type="button" onClick={() => this.wishlistAdd(a.id)}><i className="bx bx-heart"></i></button>
                                                                    </div>
                                                                </div>
                                                                <div className="cursor-pointer rating mt-2" ng-bind-html="a.ratingHTML"></div>
                                                                <div className="product-price d-flex align-items-center justify-content-start gap-2 mt-2">
                                                                    {a.comparePrice && a.price !== a.comparePrice ? <div className="h6 fw-light fw-bold text-secondary text-decoration-line-through">{Globals.formatter.format(a.comparePrice)}</div> : ''}
                                                                    <div className="h6 fw-bold">{Globals.formatter.format(a.price)}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>)}


                                            </div>
                                        </div><div className="owl-nav"><button type="button" role="presentation" className="owl-prev disabled"><i className="bx bx-chevron-left"></i></button><button type="button" role="presentation" className="owl-next"><i className="bx bx-chevron-right"></i></button></div><div className="owl-dots disabled"></div><div className="owl-thumbs"></div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </> : <Alert type="danger">Unknown error ocurred. Please try again.</Alert>}
                </div>
            </div>
        </>;
    }
}

export default withParamsAndNavigate(Product);