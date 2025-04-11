/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import L from "./Lang";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class PrivacyPolicy extends BaseCom {

    componentDidMount() {
        this.script = document.createElement('script');
        this.script.src = 'https://app.termly.io/embed-policy.min.js';
        document.body.appendChild(this.script);
    }

    componentWillUnmount() {
        if(this.script)
            document.body.removeChild(this.script);
    }

    render() {
        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title="Privacy Policy" />
                <section className="py-4">
                    <div className="container">
                        <div className="product-detail-card">
                            <div className="product-detail-body">
                                <div className="markdown prose w-full break-words dark:prose-invert light">
                                    <div name="termly-embed" data-id="53afc298-0345-41c7-b01b-d53246457617"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(PrivacyPolicy);