/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom"
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Globals from "../shared/Globals";
import L from "./Lang";

export default class SubHeader extends BaseCom {
    render() {
        return <section className="py-3 border-bottom border-top d-flex bg-light m-offset">
            <div className="container">
                <div className="page-breadcrumb d-flex align-items-center">
                    <h3 className="breadcrumb-title pe-3">{Globals.getLang(this.props.title)}</h3>
                    <div className="ms-auto d-none d-md-block">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0 p-0">
                                <li className="breadcrumb-item">
                                    <Link to="/"><i className="bx bx-home-alt"></i><L>Home</L></Link>
                                </li>
                                {this.props.path ? this.props.path.map(i => <li key={uuidv4()} className="breadcrumb-item">
                                    <Link to={i[0]}>{Globals.getLang(i[1])}</Link>
                                </li>) : ''}
                                <li className={'breadcrumb-item' + (this.props.subPath && this.props.subPath.length > 0 ? '' : ' active')}>
                                    {this.props.titleLink ? <Link to={this.props.titleLink}>{Globals.getLang(this.props.title)}</Link> : Globals.getLang(this.props.title)}
                                </li>
                                {this.props.subPath ? this.props.subPath.map(i => <li key={uuidv4()} className={'breadcrumb-item' + (this.props.subPath.indexOf(i) === this.props.subPath.length - 1 ? ' active' : '')}>
                                    {i[0] ? <Link to={i[0]}>{Globals.getLang(i[1])}</Link> : Globals.getLang(i[1])}
                                </li>) : ''}
                            </ol>
                        </nav>
                    </div>
                </div>
                {this.props.path && this.props.path.length > 0 ? <div className="d-block d-md-none fs-6">
                    <Link to={this.props.path[this.props.path.length - 1][0]}>{this.props.path[this.props.path.length - 1][1]}</Link>
                </div> : ''}
            </div>
        </section>;
    }
}