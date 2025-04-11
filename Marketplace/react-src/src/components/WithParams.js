/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { useParams } from "react-router-dom";

export default function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
}