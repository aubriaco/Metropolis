/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Auth from "../shared/Auth";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import L from "./Lang";
import LoadingAlert from "./LoadingAlert";
import { Tooltip } from 'react-tooltip';
import RegisterCardModal from "./RegisterCardModal";
import Icon from "./Icon";
import Globals from "../shared/Globals";
import NativeNav from "./NativeNav";
import Alert from './Alert';

export default class Wallet extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            selected: {}
        };
        this.load = this.load.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            this.setState({ user: u });
            if (u) {
                this.load();
            }
        });
    }

    load() {
        qreq.get('/api/payment/card/list', j => {
            if (j.list) {
                this.setState({ list: j.list, loaded: true });
                if(this.props.onSelect) {
                    j.list.forEach(i => {
                        if(i.isDefault) {
                            this.onSelect(i);
                        }
                    });
                }
            }
            else if (j.errorCode)
                this.alert(j.errorMessage);
        });
    }

    getCardImage(brand) {
        brand = brand.toLowerCase();
        if (brand === 'visa')
            return 'visa.png';
        else if (brand === 'mastercard' || brand === 'mc')
            return 'mc.png';
        else if (brand === 'discover')
            return 'discover.png';
        else
            return 'other.png';
    }

    onSelect(item) {        
        if (this.props.onSelect) {
            this.setState({ selected: item });
            this.props.onSelect(item);
        }
    }

    render() {
        if (!this.state.user)
            return <></>;

        if (!this.state.loaded)
            return <LoadingAlert />

        return <>
            <NativeNav show={Globals.mobileView} />
            <RegisterCardModal show={this.state.showRegisterCardModal} onToggle={() => this.setState({ showRegisterCardModal: false })} onSuccess={() => { this.setState({ showRegisterCardModal: false }); this.load(); } } wallet />
            <Tooltip anchorSelect=".tt-delete-default">
                Default card can not be deleted.
            </Tooltip>
            <div className="mb-2">
                <button type="button" className="btn btn-primary" onClick={() => this.setState({ showRegisterCardModal: true })}><Icon icon="faPlus" /> Add Card</button>
            </div>
            {this.state.list.length === 0 ? <Alert message="There are no payment methods registered." /> : ''}
            <div className="row">
                    {this.state.list.map(i =>
                        <div key={i.id} className="col-md-6">
                            <div className={'rounded p-3 m-1' + (i.id === this.state.selected.id ? ' bg-primary text-light' : ' bg-light')}>
                                <div className="row" onClick={() => this.onSelect(i)} style={this.props.onSelect ? { cursor: 'pointer', userSelect: 'none' } : {}}>
                                <div className="col-4">
                                    <img src={'/img/wallet/' + (this.getCardImage(i.brand))} alt="" className="img-fluid" />
                                </div>
                                <div className="col-8">
                                    <div className="brand">{i.brand}</div>
                                    <div className="desc"><L>Card ending in</L> &bull;&bull;&bull;&bull; {i.lastFour}</div>
                                    <div className="expires"><small><L>Expires:</L> {i.expMonth}/{i.expYear}</small></div>
                                    <div className="actions d-none">
                                        <button type="button" className="btn btn-sm btn-outline-danger" disabled><L>Delete</L></button>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>)}
            </div></>;
    }
}