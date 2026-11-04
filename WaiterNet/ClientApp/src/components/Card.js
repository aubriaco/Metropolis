import * as React from "react";
import L from "./Lang";
import './Card.css';

export default class Card extends React.Component {

    render() {
        return (<div className={'card mb-3' + (this.props.className ? ' ' + this.props.className : '')} style={this.props.style}>
            {this.props.title ? (
                <div className="card-header">
                    {this.props.imgSrc ? (<img src={this.props.imgSrc} alt="" className="d-block img-fluid float-end" style={{ maxHeight: '1.35rem' }} />) : ''}
                    {this.props.headerButtons ? (<div className="float-end">{this.props.headerButtons}</div>) : ''}
                    <h5 className="card-title"><L>{this.props.title}</L></h5>
                </div>) : ''}
            <div className="card-body">
                {this.props.children}
            </div>
        </div>);
    }
}