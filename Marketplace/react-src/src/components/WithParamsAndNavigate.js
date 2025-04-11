/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { useParams, useNavigate, useLocation } from "react-router-dom";

export function withParamsAndNavigate(Component) {
    return (props) => (
        <Component {...props} params={useParams()} navigate={useNavigate()} location={useLocation()} />
    );
}