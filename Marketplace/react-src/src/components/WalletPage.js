/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Auth from "../shared/Auth";
import BaseCom from "./BaseCom";
import Card from "./Card";
import L from "./Lang";
import SubHeader from "./SubHeader";
import Wallet from "./Wallet";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class WalletPage extends BaseCom {

    componentDidMount() {
        Auth.getLogin(u => {
            if (!u)
                this.props.navigate('/login');
        });
    }

    render() {
        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title="Wallet" path={[['/my', 'My Account']]} />
                <div className="container">
                    <Card title="Payment Methods">
                        <Wallet />
                    </Card>
                </div>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(WalletPage);