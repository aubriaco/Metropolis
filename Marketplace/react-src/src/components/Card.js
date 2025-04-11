/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import * as React from "react";
import Globals from "../shared/Globals";

export default class Card extends React.Component {

    render() {
        return (<div className={'card my-5' + (this.props.className ? ' ' + this.props.className : '')} style={this.props.style}>
            {this.props.title ? (
                <div className="card-header">
                    {this.imgSrc ? (<img src={this.props.imgSrc} alt="" className="d-block img-fluid float-end" style={{ maxHeight: '1.35rem' }} />) : ''}
                    {this.props.headerButtons ? (<div className="float-end me-2">{this.props.headerButtons}</div>) : '' }
                    <h5 className={'card-title ' + (this.props.headerButtons ? 'text-start' : 'text-center')}>{Globals.getLang(this.props.title)}</h5>
                    <div className="card-subtitle">{this.props.subTitle}</div>
                </div>) : ''}
            <div className="card-body">
                {this.props.children}
            </div>
        </div>);
    }
}