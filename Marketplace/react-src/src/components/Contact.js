/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class Contact extends BaseCom {
    render() {
        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title="Contact Us" />
                <section className="py-5">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-2 fs-5">
                                Email
                            </div>
                            <div className="col-md-10">
                                <a href="mailto:support@metropolis.market">support@metropolis.market</a>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-md-2 fs-5">
                                Phone
                            </div>
                            <div className="col-md-10">
                                <a href="tel:+17873023141">(787) 302-3141</a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(Contact);