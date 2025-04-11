/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import * as React from "react"
import withRouter from './WithRouter';

class ScrollToTop extends React.Component {
    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            window.scrollTo(0, 0);
            var body = document.getElementsByTagName('body');
            if(body.length > 0)
                body[0].scrollTop = 0;
        }
    }

    render() {
        return this.props.children;
    }
}

export default withRouter(ScrollToTop)