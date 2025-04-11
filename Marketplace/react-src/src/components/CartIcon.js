/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Cart from "../shared/Cart";
import Globals from "../shared/Globals";
import BaseCom from "./BaseCom";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import L from "./Lang";

class CartIcon extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            total: 0,
            loaded: false
        };
        this.tick = this.tick.bind(this);
        this.remove = this.remove.bind(this);
    }

    componentDidMount() {
        this.tick();
        this.interval = setInterval(() => this.tick(), 3000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    componentDidUpdate() {
        if (this.state.total !== Cart.total) {
            this.setState({ total: Cart.total });
        }
    }

    tick() {
        Cart.refresh((list, total) => {
            this.setState({ list: list, total: total, loaded: true });
        });
    }

    remove(a) {
        this.setState({ list: Cart.remove(a.id, a.quantity) });
    }

    render() {
        return <>
            <Dropdown className="dropdown-large" show={this.state.showDropdown} onToggle={() => this.setState({ showDropdown: !this.state.showDropdown })}>
                <Dropdown.Toggle as="a" className="nav-link cart-link">
                    {this.state.loaded ? <span className="alert-count">{this.state.list.length}</span> : ''}
                    <i className="bx bx-shopping-bag"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu className="cart-dropdown">
                    <Link to="/checkout" onClick={() => this.setState({ showDropdown: false })}>
                        <div className="cart-header">
                            <p className="cart-header-title mb-0">{this.state.list.length} ITEMS</p>
                            <p className="cart-header-clear ms-auto mb-0"> {Globals.getLang('VIEW CART')} </p>
                        </div>
                    </Link>
                    <div className="cart-list">
                        {this.state.list.map(a => <button key={a.id} type="button" className="dropdown-item">
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                    <Link to={'/p/' + a.ident} onClick={() => this.setState({ showDropdown: false })}>
                                        <h6 className="cart-product-title">{a.name}</h6>
                                    </Link>
                                    <p className="cart-product-price">{a.cart.quantity} x ${a.price} <L>ea</L></p>
                                </div>
                                <div className="position-relative">
                                    <div onClick={() => this.remove(a)} className="cart-product-cancel position-absolute">
                                        <i className="bx bx-x"></i>
                                    </div>
                                    <div className="cart-product">
                                        <img src={Globals.imageUrl(a.displayImageUrl)} className="" alt="" />
                                    </div>
                                </div>
                            </div>
                        </button>)}

                    </div>
                    <Link to="/checkout" onClick={() => this.setState({ showDropdown: false })}>
                        <div className="text-center cart-footer d-flex align-items-center">
                            <h5 className="mb-0"> {Globals.getLang('TOTAL')} </h5>
                            <h5 className="mb-0 ms-auto">{Globals.formatter.format(this.state.total)}</h5>
                        </div>
                    </Link>
                    <div className="d-grid p-3 border-top">
                        <Link to="/checkout" className="btn btn-dark btn-ecomm" onClick={() => this.setState({ showDropdown: false })}> {Globals.getLang('CHECKOUT')} </Link>
                    </div>

                </Dropdown.Menu>
            </Dropdown>

        </>;
    }
}

export default withParamsAndNavigate(CartIcon);