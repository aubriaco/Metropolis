/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Card from "./Card";
import MyStoresCom from "./MyStoresCom";
import MyStoresPortal from "./MyStoresPortal";
import { Link } from "react-router-dom";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import Icon from "./Icon";
import LoadingAlert from "./LoadingAlert";
import { qreq } from "../shared/qrequest";
import { Pop } from "./PopModal";
import L from "./Lang";

class MyStoresPayouts extends MyStoresCom {
    constructor(props) {
        super(props);
        this.state.info = {
            active: false
        };
        this.state.loaded = false;
        this.init();
        this.connect = this.connect.bind(this);
    }

    componentDidMount() {
        this.setState({ loaded: false });
        this.pullVendor(v => {
            this.setState({ vendor: v });

            qreq.get('/api/payout/status?vendorID=' + v.id, j => {
                if (j.errorCode !== 0 && j.errorCode !== 2)
                    this.alert(j.errorMessage);
                else {
                    this.setState({ info: j.item });
                }
                this.setState({ loaded: true });
            }, () => {
                this.unkownErrorCallback();
            });
        });
    }

    connect() {
        Pop.show(<p><L>Navigating to</L> <strong>Stripe Connect</strong> <L>for account setup.</L></p>, 'Loading', true);
        qreq.post('/api/payout/setup?vendorID=' + this.state.vendor.id, {}, j => {
            if (j.item) {
                window.location.assign(j.item);
            }
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    render() {
        return <MyStoresPortal vendor={this.state.vendor} subPath={[[false, 'Payouts']]}>
            <Card title="Payouts" headerButtons={!this.state.loaded ? '' : this.state.info && this.state.info.active ? null : <button type="button" onClick={() => this.connect()} className="btn btn-lg btn-primary"><Icon icon="faPlug" /> <span className="d-none d-md-inline-block">Connect Bank</span></button>}>
                {!this.state.loaded ? <LoadingAlert /> : <>
                    {this.state.info && this.state.info.active ? <>
                        <h3>Stripe Connected</h3>
                        <div className="my-3 border-top"></div>
                        <p><L>Your connection to Stripe is active.</L></p>
                    </> : <>
                        <h3><L>What is</L> Stripe Connect?</h3>
                        <div className="my-3 border-top"></div>
                        <p>Stripe Connect <L>is a powerful platform that enables seamless payment processing, simplified financial management, and enhanced security for your transactions. By connecting your platform to Stripe, you gain access to a robust set of tools and features that streamline payments, reduce friction, and provide a more efficient way to manage funds.</L></p>
                        <div className="mt-3">
                            <button type="button" onClick={() => this.connect()} className="btn btn-lg btn-primary"><Icon icon="faPlug" /> <span><L>Connect Bank</L></span></button>
                        </div>
                    </>}
                </>}
            </Card>
        </MyStoresPortal>
    }
}

export default withParamsAndNavigate(MyStoresPayouts);