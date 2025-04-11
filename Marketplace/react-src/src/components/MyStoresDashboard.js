/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link } from "react-router-dom";
import { qreq } from "../shared/qrequest";
import Alert from "./Alert";
import BaseCom from "./BaseCom";
import Card from "./Card";
import L from "./Lang";
import LoadingAlert from "./LoadingAlert";
import MyStoresCom from "./MyStoresCom";
import MyStoresPortal from "./MyStoresPortal";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import Globals from "../shared/Globals";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import SelectDeliveryTypesModal from "./SelectDeliveryTypesModal";

class MyStoresDashboard extends MyStoresCom {

    constructor(props) {
        super(props);
        this.init();
        this.state.ordersByDay = [];
        this.state.loaded = false;
    }

    componentDidMount() {
        this.pullVendor(v => {
            qreq.get('/api/order/chart/orders-by-day?vendorID=' + v.id, j => {
                if (j.list)
                    this.setState({ ordersByDay: j.list });
                else
                    this.alert(j.errorMessage);
                this.setState({ loaded: true });
            }, this.unkownErrorCallback);
        });
    }

    render() {
        if(!this.state.vendor.id)
            return <></>;
        return <MyStoresPortal vendor={this.state.vendor} subPath={[[false, 'Dashboard']]}>
            <SelectDeliveryTypesModal vendor={this.state.vendor} autoShow />
            <div className="container">
                <Card title="Dashboard">
                    {this.state.loaded ? <>
                        <h6 className="text-center m-3">Orders by Day</h6>
                        <ResponsiveContainer width="100%" aspect="2.1">
                            <BarChart
                                width={100}
                                height={300}
                                data={this.state.ordersByDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dt" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar type="monotone" dataKey="pendingCount" name="Pending" fill="#ffc107" />
                                <Bar type="monotone" dataKey="processedCount" name="Processed" fill="#8884d8" />
                                <Bar type="monotone" dataKey="confirmedCount" name="Confirmed" fill="#88d888" />
                            </BarChart>
                        </ResponsiveContainer>
                    </> : <LoadingAlert />}

                </Card>
            </div>
        </MyStoresPortal>;
    }
}

export default withParamsAndNavigate(MyStoresDashboard);