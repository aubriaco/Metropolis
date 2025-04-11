/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link } from "react-router-dom";
import Cart from "../shared/Cart";
import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import Alert from "./Alert";
import BaseCom from "./BaseCom";
import L from "./Lang";
import LoadingAlert from "./LoadingAlert";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import SubHeader from "./SubHeader";
import { getLang } from "../shared/GLang";
import { WebGlobal } from "../layouts/Web";

class ProductList extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            filter: {},
            list: [],
            categories: [],
            paging: [],
            page: 1,
            currentCategory: {},
            categoryIDList: []
        };
        this.load = this.load.bind(this);
        this.toggleCategory = this.toggleCategory.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
    }

    componentDidMount() {
        WebGlobal.setSearchVisible(true);
        this.load();
    }

    componentDidUpdate(prevProps) {
        if(this.props.params.categoryIdent !== prevProps.params.categoryIdent || this.props.params.terms !== prevProps.params.terms)
            this.load();
    }

    load(categoryIDList, filter) {
        if(!categoryIDList)
            categoryIDList = [...this.state.categoryIDList];
        if(!filter)
            filter = {...this.state.filter};
        if (this.props.params.categoryIdent || this.props.params.terms) {
            var r = {};
            if(this.props.params.categoryIdent)
                r.categoryIdent = this.props.params.categoryIdent;
            else if(this.props.params.terms)
                r.terms = this.props.params.terms.replace(/-/g, ' ');
            if(categoryIDList.length > 0)
                r.categoryIDList = categoryIDList;
            if(filter)
                r.filter = filter;
            qreq.post('/api/product/search', r, j => {
                if (j.list)
                    this.setState({ list: j.list, loaded: true });
                else
                    this.alert(j.errorMessage);
            }, this.unkownErrorCallback);

            qreq.get('/api/category/list', j => {
                if(j.list)
                    this.setState({ categories: j.list, currentCategory: j.list.find(a => a.ident === r.categoryIdent) });
                else
                    this.alert(j.errorMessage);
            }, this.unkownErrorCallback);
        }
        else
            this.setState({ loaded: true });
        
    }

    toggleCategory(item) {
        var list = [...this.state.categoryIDList];
        var idx = list.indexOf(item.id);
        if(idx >= 0)
            list.splice(idx, 1);
        else
            list.push(item.id);
        this.setState({ categoryIDList: list });
        this.load(list);
    }

    applyFilter(name, val) {
        var filter = {...this.state.filter};
        filter[name] = val;
        var msg = null;
        if(filter.priceStart && filter.priceEnd) {
            if(Number(filter.priceStart) > Number(filter.priceEnd))
                msg = getLang('Invalid price range.');
        }
        this.setState({ filter: filter, filterError: msg });
        this.load(null, filter);
    }

    render() {
        return <><div className="page-wrapper">
            <div className="page-content">
                <SubHeader title={this.props.params.terms ? this.props.params.terms : (this.state.currentCategory ? this.state.currentCategory.name : '')} path={this.props.params.terms ? [[false, 'Search']] : null} />
                <section className="py-4">
                    <div className="container">
                        <div className="btn btn-dark btn-ecomm d-xl-none position-fixed top-50 start-0 translate-middle-y z-index-1 d-none" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbarFilter"><span><i className="bx bx-filter-alt me-1"></i> <L>Filters</L> </span></div>
                        <div className="row">
                            <div className="col-12 col-xl-3 filter-column">
                                <nav className="navbar navbar-expand-xl flex-wrap p-0">
                                    <div className="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbarFilter" aria-labelledby="offcanvasNavbarFilterLabel">
                                        <div className="offcanvas-header">
                                            <h5 className="offcanvas-title mb-0 fw-bold" id="offcanvasNavbarFilterLabel"> <L>Filters</L> </h5>
                                            <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                                        </div>
                                        <div className="offcanvas-body">
                                            <div className="filter-sidebar">
                                                <div className="card rounded-0 shadow-none border">
                                                    <div className="card-header d-none d-xl-block bg-transparent">
                                                        <h5 className="mb-0 fw-bold"> <L>Filters</L> </h5>
                                                    </div>
                                                    <div className="card-body">
                                                        {!this.props.params.categoryIdent ? <div>
                                                            <h6 className="p-1 fw-bold bg-light"> <L>Categories</L> </h6>
                                                            <div className="categories">
                                                                <div className="categories-wrapper height-1 p-1">
                                                                    {this.state.categories.map(a => <div key={a.id} className="form-check">
                                                                        <input className="form-check-input" type="checkbox" checked={this.state.categoryIDList.indexOf(a.id) >= 0} onChange={() => this.toggleCategory(a)} />
                                                                        <label className="form-check-label">
                                                                            <span>{a.name}</span>
                                                                        </label>
                                                                    </div>)}

                                                                </div>
                                                            </div>
                                                            <hr />
                                                        </div> : ''}
                                                        <div className="Price">
                                                            <h6 className="p-1 fw-bold bg-light"> <L>Price</L> </h6>
                                                            <div className="Price-wrapper p-1">
                                                                <div className="input-group">
                                                                    <input type="number" value={this.state.filter.minPrice} className="form-control rounded-0" placeholder="$10" onChange={e => this.applyFilter('priceStart', e.target.value)} />
                                                                    <span className="input-group-text bg-section-1 border-0"> <L>-</L> </span>
                                                                    <input type="number" value={this.state.filter.maxPrice} className="form-control rounded-0" placeholder="$10000" onChange={e => this.applyFilter('priceEnd', e.target.value)} />
                                                                    <button ng-click="applyFilter(Filter)" type="button" className="btn btn-outline-dark rounded-0 ms-2"><i className="bx bx-chevron-right me-0"></i></button>
                                                                </div>
                                                            </div>
                                                            {this.state.filterError ? <Alert type="danger">{this.state.filterError}</Alert> : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </nav>
                            </div>
                            <div className="col-12 col-xl-9">
                                <div className="product-wrapper">
                                    <div className="toolbox d-flex align-items-center mb-3 gap-2 border p-3 d-none">
                                        <div className="d-flex flex-wrap flex-grow-1 gap-1">
                                            <div className="d-flex align-items-center flex-nowrap">
                                                <p className="mb-0 font-13 text-nowrap"> <L>Sort By:</L> </p>
                                                <select className="form-select ms-3 rounded-0">
                                                    <option value="menu_order" selected="selected"> <L>Default sorting</L> </option>
                                                    <option value="popularity"> <L>Sort by popularity</L> </option>
                                                    <option value="rating"> <L>Sort by average rating</L> </option>
                                                    <option value="date"> <L>Sort by newness</L> </option>
                                                    <option value="price"> <L>Sort by price: low to high</L> </option>
                                                    <option value="price-desc"> <L>Sort by price: high to low</L> </option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="product-grid d-flex flex-column gap-4">

                                        {!this.state.loaded ? <LoadingAlert /> : this.state.list.length === 0 ? <Alert><L>No products found under this search/category.</L></Alert> :
                                            this.state.list.map(a => <div key={a.id} className="card rounded-0 border">

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
                                                                <Link to={'/p/' + a.ident}>
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
                                                                        <span role="button" onClick={() => Cart.add(a.id)} className="btn btn-dark btn-ecomm"> <i className="bx bxs-cart-add"></i> <L>Add to Cart</L> </span>
                                                                        <Link to={'/p/' + a.ident} className="btn btn-light btn-ecomm"><i className="bx bx-zoom-in"></i> <L>View Product</L> </Link>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>)}





                                    </div>
                                    <hr />
                                    <nav className="d-flex justify-content-between" aria-label="Page navigation">
                                        <ul className="pagination">
                                            {this.state.paging.map(a => <li key={a.id} className="page-item {{a.current ? 'active' : ''}} d-none d-sm-block" ng-repeat="a in Paging">
                                                <a href="{{getPageLoc(a.page)}}" className="page-link">{a.page}<span ng-show="a.current" className="visually-hidden"> <L>(current)</L> </span></a>
                                            </li>)}
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
        </>
    }
}

export default withParamsAndNavigate(ProductList);