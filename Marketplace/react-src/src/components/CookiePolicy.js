/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class CookiePolicy extends BaseCom {
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
                <SubHeader title="Cookie Policy" />
                <section class="py-4">
                    <div class="container">
                        <div class="product-detail-card">
                            <div class="product-detail-body">
                                <div name="termly-embed" data-id="0dc78f5a-7441-4cd3-a82f-cc6d287a8006"></div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(CookiePolicy);