import { Link } from "react-router-dom";
import BaseCom from "./BaseCom";
import Icon from "./Icon";
import './SubNav.css';
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { qreq } from "../shared/qrequest";
import Globals from "../shared/Globals";

class SubNav extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            cartCount: Globals.get('cartCount') ?? 0
        };
        this.tick = this.tick.bind(this);
    }

    componentDidMount() {
        this.wrapper = document.getElementById('wrapper');
        if(this.wrapper) {
            if(!this.wrapper.classList.contains('subnav-active'))
                this.wrapper.classList.add('subnav-active');
        }
        this.tick();
        //this.interval = setInterval(() => { this.tick(); }, 5000);
    }

    componentWillUnmount() {
        if(this.wrapper) {
            if(this.wrapper.classList.contains('subnav-active'))
                this.wrapper.classList.remove('subnav-active');
        }
        //clearInterval(this.interval);
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevState.href !== document.location.href) {
            this.setState({ href: document.location.href });
            this.tick();
        }
    }

    tick() {
        if(this.props.showCart) {
            qreq.get('/api/waiter/order/cart/count', j => {
                if(j.errorCode === 0) {
                    Globals.set('cartCount', j.item);
                    this.setState({ cartCount: j.item });
                }
            });
        }
    }

    render() {
        return <nav className="SubNav">
            <div className="d-flex">
                {this.props.hideLeft ? <div className="mx-1"></div> : <div className="d-none d-md-block left-side"></div>}
                {!this.props.noBack ? <div className="py-2 ps-2 ps-md-0">
                    <button type="button" className="btn btn-primary btn-lg" onClick={this.goBack}><Icon icon="faAngleLeft" /></button>
                </div> : ''}
                <div className="SubNav-content py-2 ps-2 text-end text-md-start flex-fill">
                    {this.props.children}
                </div>
                {this.props.showCart ? <div className="p-2"><Link to={'/qr/' + this.props.qr + '/cart'} role="button" className="btn btn-primary btn-lg me-2"><Icon icon="faCartShopping" /> {this.state.cartCount !== 0 ? <span className="badge bg-white text-dark">{this.state.cartCount}</span> : ''}</Link></div> : ''}
            </div>
        </nav>;
    }
}

export default withParamsAndNavigate(SubNav);