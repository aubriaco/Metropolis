/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { qreq } from "../shared/qrequest";
import Alert from "./Alert";
import BaseCom from "./BaseCom";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class Session extends BaseCom {
    componentDidMount() {
        qreq.post('/api/auth/session', { sessionID: this.props.params.sessionID }, j => {
            if(j.errorCode)
                this.setState({ error: j.errorMessage });
            else
                window.location.replace('/my/stores');
        }, this.unkownErrorCallback);
    }

    render() {
        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title="Session" path={[['/my', 'Session']]} />
                <div className="container py-5">
                    {this.state.error ? <Alert type="danger">{this.state.error}</Alert> : <h2>Loading...</h2>}
                </div>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(Session);