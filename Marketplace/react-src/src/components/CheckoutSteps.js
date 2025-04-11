/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import { Link } from "react-router-dom";

export default class CheckoutSteps extends BaseCom {

    render() {
        return <div className="card bg-transparent rounded-0 shadow-none">
            <div className="card-body py-5 pb-md-3">
                <div className="steps steps-light">
                    <Link className={'step-item' + (this.props.step >= 1 ? ' active' : '') + (this.props.step === 1 ? ' current' : '')} to="/checkout/1">
                        <div className="step-progress"><span className="step-count">1</span>
                        </div>
                        <div className="step-label d-none d-md-block"><i className="bx bx-cart"></i>Cart</div>
                    </Link>
                    <Link className={'step-item' + (this.props.step >= 2 ? ' active' : '') + (this.props.step === 2 ? ' current' : '')} to="/checkout/2">
                        <div className="step-progress"><span className="step-count">2</span>
                        </div>
                        <div className="step-label d-none d-md-block"><i className="bx bx-user-circle"></i>Details</div>
                    </Link>
                    <Link className={'step-item' + (this.props.step >= 3 ? ' active' : '') + (this.props.step === 3 ? ' current' : '')} to="/checkout/3">
                        <div className="step-progress"><span className="step-count">3</span>
                        </div>
                        <div className="step-label d-none d-md-block"><i className="bx bx-cube"></i>Shipping</div>
                    </Link>
                    <Link className={'step-item' + (this.props.step >= 4 ? ' active' : '') + (this.props.step === 4 ? ' current' : '')} to="/checkout/4">
                        <div className="step-progress"><span className="step-count">4</span>
                        </div>
                        <div className="step-label d-none d-md-block"><i className="bx bx-credit-card"></i>Payment</div>
                    </Link>
                    <span className={'step-item' + (this.props.step >= 5 ? ' active' : '') + (this.props.step === 5 ? ' current' : '')}>
                        <div className="step-progress"><span className="step-count">4</span>
                        </div>
                        <div className="step-label d-none d-md-block"><i className="bx bx-receipt"></i>Receipt</div>
                    </span>
                </div>
            </div>
        </div>;
    }
}