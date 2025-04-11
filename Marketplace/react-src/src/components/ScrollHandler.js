/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import React from "react";
import BaseCom from "./BaseCom";
import Tick from "./Tick";

export default class ScrollHandler extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            endOfList: false
        };
        this.eleRef = React.createRef();
        this.scrollHandler = this.scrollHandler.bind(this);
        this.tick = this.tick.bind(this);
    }

    componentDidMount() {
        document.addEventListener('scroll', this.scrollHandler);
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.scrollHandler);
    }

    scrollHandler(e) {
        if (!this.eleRef.current)
            return;
        const bottom = this.eleRef.current.getBoundingClientRect().bottom - 50 <= window.innerHeight;
        if (bottom) {
            if (this.props.end)
                return;
            this.setState({ signal: true });
        }
    }

    tick() {
        if(this.state.signal) {
            this.setState({ signal: false });
            if(this.props.onScroll)
                this.props.onScroll();
        }
    }

    render() {
        return <div ref={this.eleRef}>
            <Tick onTick={this.tick} />
        </div>;
    }
}