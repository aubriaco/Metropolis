import Auth from "../shared/Auth";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import L from "./Lang";
import LoadingAlert from "./LoadingAlert";
import RegisterCardModal from "./RegisterCardModal";
import Icon from "./Icon";
import Alert from './Alert';
import SubNav from "./SubNav";

export default class Wallet extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            item: props.item ?? {},
            selected: null
        };
        this.load = this.load.bind(this);
        this.selectCard = this.selectCard.bind(this);
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
                if (j.list.length > 0) {
                    this.selectCard(j.list[0]);
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

    selectCard(obj) {
        if (!this.props.select)
            return;
        this.setState({ selected: obj });
        if (this.props.select)
            this.props.select(obj);
    }

    render() {
        if (!this.state.user)
            return <></>;

        if (!this.state.loaded)
            return <LoadingAlert />

        return <div className={'Wallet bg-light rounded p-3' + (this.props.className ? ' ' + this.props.className : '')}>
            <RegisterCardModal show={this.state.showRegisterCardModal} onToggle={() => this.setState({ showRegisterCardModal: false })} onSuccess={() => { this.setState({ showRegisterCardModal: false }); this.load(); }} wallet />
            <div className="mb-2">
                <button type="button" className="btn btn-primary" onClick={() => this.setState({ showRegisterCardModal: true })}><Icon icon="faPlus" /> <L>Add Card</L></button>
            </div>
            {this.state.list.length === 0 ? <Alert message="There are no payment methods registered." /> : ''}
            <div className="row">
                {this.state.list.map(i =>
                    <div key={i.id} className="col-md-6">
                        <div className={'rounded p-2 m-1' + (this.state.selected === i ? ' bg-warning' : '')} role={this.props.select ? 'button' : ''} onClick={() => this.selectCard(i)}>
                            <div className="row">
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
            </div></div>;
    }
}