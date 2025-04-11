/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class AcceptableUsePolicy extends BaseCom {
    componentDidMount() {
        this.script = document.createElement('script');
        this.script.src = 'https://app.termly.io/embed-policy.min.js';
        document.body.appendChild(this.script);
    }

    componentWillUnmount() {
        if (this.script)
            document.body.removeChild(this.script);
    }
    render() {
        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title="Acceptable Use Policy" />
                <section class="py-4">
                    <div class="container">
                        <div class="product-detail-card">
                            <div class="product-detail-body">
                                <div name="termly-embed" data-id="d72122fa-1e35-4c88-b3f1-817c3e2510b7"></div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(AcceptableUsePolicy);