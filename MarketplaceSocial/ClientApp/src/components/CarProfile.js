import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import L from "./Lang";
import LoadingAlert from "./LoadingAlert";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import './CarProfile.css'
import { Link } from 'react-router-dom';
import LoadingModal from "./LoadingModal";
import AddCarModal from "./AddCarModal";
import Icon from "./Icon";
import Auth from "../shared/Auth";
import ImageGallery from "./ImageGallery";
import { Helmet } from 'react-helmet';
import ShareModal from "./ShareModal";

class CarProfile extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            item: {}
        };
        this.load = this.load.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(j => {
            this.setState({ user: j });
        });
        this.load();
    }

    load() {
        qreq.get('/api/garage/item/' + this.props.params.id, j => {
            if (j.item)
                this.setState({ item: j.item });
            this.setState({ loaded: true });
        }, () => {
            this.setState({ loaded: true });
        });
    }

    render() {
        if (!this.state.loaded)
            return <LoadingModal show message="Loading car info..." />
        var item = this.state.item;
        return <>
            <Helmet>
                <title>{Globals.appName + ' | ' + item.username + '\'s Garage | ' + item.year + ' ' + item.make + ' ' + item.model}</title>
            </Helmet>
            <AddCarModal item={this.state.item} show={this.state.showAddCarModal} onToggle={() => this.setState({ showAddCarModal: false })} onSave={() => { this.setState({ showAddCarModal: false }); this.load(); }} />
            <ShareModal location={'garage/' + item.username + '/' + this.props.params.id} show={this.state.showShareModal} onToggle={() => this.setState({ showShareModal: false })} />
            <div className="car-profile container">
                <h4 className="mb-3"><Link to={'/u/' + item.username}>{item.username}'s <L>garage</L></Link></h4>
                <div className="float-end mb-2 text-end">
                    <button type="button" className="btn btn-lg btn-primary mt-2" onClick={() => this.setState({ showShareModal: true })}><Icon icon="faShareFromSquare" /> <L>Share</L></button>
                </div>
                <h2 className="align-middle mb-4">{item.year} {item.make} {item.model} {this.state.user && this.state.item.userID === this.state.user.id ? <button type="button" className="btn btn-primary" onClick={() => this.setState({ showAddCarModal: true })}><Icon icon="faPencil" /></button> : ''}</h2>
                <section>
                    <div className="container">
                        <div className="row profile align-items-stretch">
                            <div className="col-md-4 photo" style={{ backgroundImage: 'url(\'' + Globals.serverUrl + item.displayPhoto.url + '\')' }}>

                            </div>
                            <div className="col-md-8 p-5">
                                <h3>{item.year} {item.make} {item.model}</h3>
                                <h5><L>Owned by:</L> <Link to={'/u/' + item.username}>{item.username}</Link></h5>
                                <p>{item.mods ? <p>{item.mods}</p> : <L>All Stock</L>}</p>
                                <div className="mt-2">
                                    <ImageGallery list={item.photos} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>;
    }
}

export default withParamsAndNavigate(CarProfile);