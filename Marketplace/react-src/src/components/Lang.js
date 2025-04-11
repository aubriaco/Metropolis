/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import React from 'react';
import Globals from '../shared/Globals';
import { getCurrentLangItem, getLang, getLanguages } from "../shared/GLang";

export default class L extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: props.text ?? props.children,
            currentLang: Globals.currentLang ?? 'en'
        };
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.text !== this.props.text)
            this.setState({ text: this.props.text });
        else if (prevProps.children !== this.props.children)
            this.setState({ text: this.props.children });

        if (prevState.currentLang !== Globals.currentLang)
            this.setState({ currentLang: Globals.currentLang });
    }

    render() {
        return getLang(this.state.text);
    }
}