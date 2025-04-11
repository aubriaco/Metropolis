/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class Rating extends BaseCom {
    render() {
        var content = [];

        for(var n = 1; n <= 5; n++) {
            content.push(<i key={n} className={'bx bxs-star ' + (this.props.rating <= 5 ? 'text-warning' : 'text-light-4')}></i>);
        }

        return content;
    }
}

export default withParamsAndNavigate(Rating);