/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import L from "./Lang";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class TOS extends BaseCom {
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
                <SubHeader title="Terms of Service" />
                <section class="py-4">
                    <div class="container">
                        <div class="product-detail-card">
                            <div class="product-detail-body">
                                <div class="markdown prose w-full break-words dark:prose-invert light">
                                    <div name="termly-embed" data-id="87594c28-a654-4730-9a04-388dfb07e947"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(TOS);