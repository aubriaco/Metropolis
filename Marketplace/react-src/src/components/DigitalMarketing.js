/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import Icon from "./Icon";
import L from "./Lang";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class DigitalMarketing extends BaseCom {
    render() {
        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title="Digital Marketing" />

                <section className="py-5 bg-info bg-opacity-25">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-md-3 border border-primary bg-white p-3 bg-opacity-100 text-center">
                                <h5><L>Digital Marketing</L></h5>
                                <hr />
                                <span className="badge bg-primary text-uppercase mb-2"><L>Register Now</L></span>
                                <div className="my-1"><Icon icon="faCheck"  className="text-success" /> <L>Google Ads or Meta Ads</L></div>
                                <div className="my-1"><Icon icon="faCheck"  className="text-success" /> <L>Built-in Analytics</L></div>
                                <div className="my-1"><L>For your store on Metropolis</L></div>
                                <div className="my-3"><strong>$120/<L>month</L></strong></div>
                            </div>
                            <div className="col-md-3 border border-light bg-white p-3 bg-opacity-100 text-center">
                                <h5><L>Custom Marketing</L></h5>
                                <hr />
                                <span className="badge bg-secondary text-uppercase mb-2"><L>Register Now</L></span>
                                <div className="my-1"><Icon icon="faCheck"  className="text-success" /> <L>Google/Meta+ Ads</L></div>
                                <div className="my-1"><Icon icon="faCheck"  className="text-success" /> <L>Built-in Analytics</L></div>
                                <div className="my-1"><L>For your Business</L></div>
                                <div className="my-3"><strong><L>Contact Us</L></strong></div>
                           </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(DigitalMarketing);