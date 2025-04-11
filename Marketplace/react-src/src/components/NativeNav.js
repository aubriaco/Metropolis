/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import Icon from "./Icon";
import Logo from "./Logo";

export default class NativeNav extends BaseCom {

    componentDidMount() {
        this.pw = document.getElementById('page-wrapper');
        if(this.pw) {
            if(!this.pw.classList.contains('has-native-toolbar'))
                this.pw.classList.add('has-native-toolbar');
        }
    }

    componentWillUnmount() {
        if(this.pw) {
            if(this.pw.classList.contains('has-native-toolbar'))
                this.pw.classList.remove('has-native-toolbar');
        }
    }

    render() {
        return <></>;
        /*
        if(!this.props.show)
            return <></>;
        return <nav className="navbar-native">
            <div className="container-fluid text-end">
                {this.props.noBack ? '' :
                <button type="button" className="btn btn-lg btn-light float-start" onClick={() => this.goBack()}>
                    <Icon icon="faArrowLeft" />
                </button>}
                <Logo icon className="ms-2" />
            </div>
        </nav>;*/
    }
}