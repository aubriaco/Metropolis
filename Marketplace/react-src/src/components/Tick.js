/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";

export default class Tick extends BaseCom {
    constructor(props) {
        super(props);
        this.tick = this.tick.bind(this);
    }

    componentDidMount() {
        this.tickInterval = setInterval(() => this.tick(), this.props.interval ?? 1000);
    }

    componentWillUnmount() {
        clearInterval(this.tickInterval);
    }

    tick() {
        if(this.props.onTick)
            this.props.onTick();
    }

    render() {
        return null;
    }
}