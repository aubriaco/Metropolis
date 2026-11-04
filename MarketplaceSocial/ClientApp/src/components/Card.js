import * as React from "react";
import L from "./Lang";

export default class Card extends React.Component {

    constructor(props) {
        super(props);
        this.title = props.title;
        this.state = {
            children: props.children,
            style: props.style ?? {}
        };
        this.imgSrc = props.imgSrc;
        this.headerButtons = props.headerButtons;            
    }

    componentDidUpdate(prevProps) {
        if (prevProps.children !== this.props.children) {
            this.setState({ children: this.props.children });
        }
        if (prevProps.style !== this.props.style) {
            this.setState({ style: this.props.style });
        }
    }

    render() {
        return (<div className="card mb-3" style={this.state.style}>
            {this.title ? (
                <div className="card-header">
                    {this.imgSrc ? (<img src={this.imgSrc} alt="" className="d-block img-fluid float-end" style={{ maxHeight: '1.35rem' }} />) : ''}
                    {this.headerButtons ? (<div className="float-end">{this.headerButtons}</div>) : ''}
                    <h5 className="card-title"><L>{this.title}</L></h5>
                </div>) : ''}
            <div className="card-body">
                {this.state.children}
            </div>
        </div>);
    }
}