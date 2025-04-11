/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import * as React from "react";
import Alert from "../../components/Alert"
import Card from "../../components/Card";

export default class ConnError extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            countdown: 5
        };
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            var countdown = this.state.countdown - 1;
            if (countdown === 0) {
                clearInterval(this.interval);
                window.location.replace('/');
            }
            else
                this.setState({ countdown: countdown });

        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return (<div className="container mt-3">
            <Card title="Error">
                <Alert type="danger" icon="ExclamationTriangle">Connection error... Auto-retry in {this.state.countdown}. < a href="/">Try Again</a></Alert>
            </Card>
        </div>);
    }
}
