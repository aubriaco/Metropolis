/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import * as React from "react";


export default class Loader extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.loader = document.querySelector('.c-loader');
        this.increment = -0.3;
        this.effectInterval = setInterval(() => {
            if (!this.loader.style.opacity)
                this.loader.style.opacity = 1;
            var opacity = Number(this.loader.style.opacity);
            opacity += this.increment;
            this.loader.style.opacity = opacity;
            if (opacity <= 0)
                this.increment = 0.3;
            else if (opacity >= 1)
                this.increment = -0.3;
        }, 300);
    }

    componentWillUnmount() {
        clearInterval(this.effectInterval);
    }

    render() {
        return (<div className="c-loader">
            <img src="/img/loading.gif" alt="" />
        </div>);
    }
}