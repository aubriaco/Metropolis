/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link } from "react-router-dom";
import Auth from "../shared/Auth";
import Cart from "../shared/Cart";
import { getLang } from "../shared/GLang";
import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import Rating from "./Rating";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import LoadingAlert from "./LoadingAlert";
import { Alert } from "reactstrap";
import L from "./Lang";

class MyWishlist extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            list: []
        };
        this.remove = this.remove.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            if (!u)
                this.props.navigate('/login', { replace: true });
            qreq.get('/api/wishlist/list', j => {
                if (j.list)
                    this.setState({ list: j.list, loaded: true });
                else
                    this.alert(j.errorMessage);
            }, this.unkownErrorCallback);
        });
    }

    remove(id) {
        qreq.post('/api/wishlist/remove', { productID: id }, j => {
            if(j.errorCode === 0){
                var list = [...this.state.list];
                var found = list.find(a => a.id === id);
                if(found) {
                    list.splice(list.indexOf(found), 1);
                    this.setState({ list: list});
                }
            }
            else
                this.alert(j.errorMessage);                
        }, this.unkownErrorCallback);
    }

    render() {
        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title="Wishlist" path={[['/my', 'My Account']]} />
                <section className="py-4">
                    <div className="container">
                        <div className="product-grid">
                            {!this.state.loaded ? <LoadingAlert /> : this.state.list.length === 0 ? <Alert><L>There are no products in your wishlist.</L></Alert> : <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                                {this.state.list.map(a => <div key={a.id} className="col">
                                    <div className="card rounded-0 border">
                                        <Link to={'/p/' + a.ident} style={{ minHeight: '175px;' }} className="bg-light">
                                            <img src={Globals.imageUrl(a.displayImageUrl)} className="card-img-top" alt="..." style={{ display: 'block', maxHeight: '175px', width: 'auto', margin: '0 auto'}} />
                                        </Link>
                                        <div className="card-body">
                                            <div className="product-info">
                                                <Link to={'/c/' + a.categoryIdent}>
                                                    <p className="product-catergory font-13 mb-1">{a.categoryName}</p>
                                                </Link>
                                                <Link to={'/p/' + a.ident}>
                                                    <h6 className="product-name mb-2">{a.name}</h6>
                                                </Link>
                                                <div className="d-flex align-items-center">
                                                    <div className="mb-1 product-price">
                                                        {a.comparePrice && a.comparePrice !== a.price ? <span className="me-1 text-decoration-line-through">{Globals.formatter.format(a.comparePrice)}</span> : ''}
                                                        <span className="fs-5">{Globals.formatter.format(a.price)}</span>
                                                    </div>
                                                    <div className="ms-auto"><Rating rating={a.rating} /></div>
                                                </div>
                                                <div className="product-action mt-2">
                                                    <div className="d-grid gap-2">
                                                        <span rolw="button" onClick={() => Cart.add(a.id)} className="btn btn-dark btn-ecomm"><i className="bx bxs-cart-add"></i> {getLang('Add to Cart')} </span>
                                                        <span rolw="button" onClick={() => this.remove(a.id)} className="btn btn-light btn-ecomm"><i className="bx bx-zoom-in"></i> {getLang('Remove From List')} </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>)}
                            </div>}
                        </div>
                    </div>
                </section>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(MyWishlist);