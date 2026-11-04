//V: nexus
import BaseCom from "../BaseCom";
import { withParamsAndNavigate } from "../WithParamsAndNavigate";
import L from "../Lang";
import { Link } from 'react-router-dom';
import { qreq } from "../../shared/qrequest";
import Globals from "../../shared/Globals";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import './AuctionView.css';
import Auth from "../../shared/Auth";
import { Helmet } from "react-helmet";
import Alert from "../Alert";
import LoadingModal from "../LoadingModal";


class AuctionView extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            item: {
                photos: [],
                displayPhoto: {}
            },
            displayPhoto: {},
            bidLoading: false
        };
        this.load = this.load.bind(this);
        this.showBid = this.showBid.bind(this);
        this.formatter = Globals.formatter;
    }

    componentDidMount() {
        Auth.getLogin(j => {
            if (j)
                this.setState({ user: j });
        });
        this.load();
        this.timer = setInterval(this.load, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    load() {
        if (this.load_process)
            return;
        this.load_process = true;
        qreq.get((this.props.type === 'appliance' ? '/api/auction/appliance/item?id=' : '/api/vehicle/item?id=') + (this.props.id ?? this.props.params.id) + (this.props.preview ? '&preview=true' : ''), j => {
            if (j.item) {
                this.setState({ item: j.item, error: null });
                if (!this.state.displayPhoto.id)
                    this.setState({ displayPhoto: j.item.displayPhoto });
            }
            else if (j.errorCode !== 0)
                this.setState({ error: j.errorMessage });
            this.load_process = false;
        }, () => {
            this.load_process = false;
        });
    }

    showBid() {
        this.setState({ bidLoading: true });
        Auth.getLogin(j => {
            if (j)
                this.setState({ showBidModal: true });
            else
                this.setState({ showSignupModal: true });
            this.setState({ bidLoading: false });
        });
    }

    render() {
        if (this.state.error) {
            return <Alert type="danger"><L>There was an error loading this auction:</L> {Globals.getLang(this.state.error)}</Alert>
        }
        var item = this.state.item;
        if (!item.id)
            return <LoadingModal message="Auction is loading..." />
        return <>
            <Helmet>
                <title>{'Bidea Online | ' + (item.type === 'vehicle' ? item.year + ' ' + item.make + ' ' + item.model : item.name)}</title>
                <meta name="description" value={Globals.getLang('Discover Bidea Online, the ultimate car auction platform that brings together buyers and sellers. Bid, buy, and sell with ease. Join now and experience the thrill of car auctions.')} />
                <meta property="og:title" content={'Bidea Online | ' + (item.type === 'vehicle' ? item.year + ' ' + item.make + ' ' + item.model : item.name)} />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={Globals.serverUrl + this.state.displayPhoto.url} />
                <meta property="og:description" content={item.type === 'vehicle' ? 'Descubre Bidea Online, la plataforma de subastas de coches definitiva que reúne a compradores y vendedores. Bidea, compra y vende con facilidad. Únase ahora y experimente la emoción de las subastas de automóviles.' : item.description} />
            </Helmet>
            <div className="container auction-view">
                {item.type === 'vehicle' ? <>
                    <h1>{item.year} {item.make} {item.model}</h1>
                    <p className="lead">~{item.milage} <L>Miles</L>, {item.transmission} {item.modType}</p></> :
                    <><h1>{item.name}</h1>
                        <p className="lead">{item.condition ? item.condition.name : ''}</p>
                    </>}
                <div className="row">
                    <div className="col-md-8 pt-2">
                        <div className="gallery-image d-flex justify-content-center bg-light drop-shadow" style={{ backgroundImage: 'url(\'' + Globals.serverUrl + this.state.displayPhoto.url + '\')' }}>
                            <img src={Globals.serverUrl + this.state.displayPhoto.url} alt="" className="img-fluid" />
                        </div>
                    </div>
                    <div className="col-md-4 pt-2">
                        <div className="gallery-thumblist">
                            <div className="row">
                                {item.photos.map(i => <div key={i.id} className="col-6 mt-3">
                                    <div className="gallery-thumb d-flex justify-content-center bg-light drop-shadow pointer" style={{ backgroundImage: 'url(\'' + Globals.serverUrl + i.thumbUrl + '\')' }} onClick={() => this.setState({ displayPhoto: i })}>
                                        <img src={Globals.serverUrl + i.thumbUrl} alt="" className="" />
                                    </div>
                                </div>)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-8">
                        <div className="auction-sticky">
                            <div className="row align-items-center">
                                <div className="col-sm-10 pt-2">
                                    <div className="p-2 bg-dark text-light fs-5 rounded text-center">
                                        {item.ended ? <span className="me-4"><FontAwesomeIcon icon={fa.faClock} /> <L>Ended:</L> <strong>{Globals.toMDYHMLocalDateString(item.endDate)}</strong></span> : item.awaitingStartDate ? <span className="me-4"><FontAwesomeIcon icon={fa.faClock} /> <L>Starts on:</L> <strong>{Globals.toMDYDateString(item.startDate)}</strong></span> : <span className="me-4"><FontAwesomeIcon icon={fa.faClock} /> <L>Time Left:</L> <strong>{item.timeLeft}</strong></span>}
                                        {item.awaitingStartDate ? '' : <span className="me-4"><FontAwesomeIcon icon={fa.faArrowUp} /> <L>Current Bid:</L> <strong>{this.formatter.format(item.currentBid)}</strong></span>}
                                        {item.awaitingStartDate ? '' : <span><FontAwesomeIcon icon={fa.faHashtag} /> <L>of Bids:</L> <strong>{item.bidCount}</strong></span>}
                                    </div>
                                </div>
                                <div className="col-sm-2 pt-2">
                                    {!item.ended && !item.awaitingStartDate ? <button type="button" className="btn btn-success btn-lg d-block w-100" onClick={() => this.showBid()} disabled={this.state.bidLoading}><L>Bid Now</L></button>
                                        : !item.ended ? <button type="button" className="btn btn-primary btn-lg d-block w-100" onClick={() => this.setState({ showShareModal: true })}><L>Share</L> <FontAwesomeIcon icon={fa.faShareFromSquare} /></button>
                                            : ''}
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 text-muted mt-3">
                            Ending {Globals.toMDYHMLocalDateString(item.endDate)}
                        </div>

                        {item.type === 'Vehicle' ? <div className="row mt-2">
                            <div className="col-md">
                                <table className="table table-bordered auction-table">
                                    <tbody>
                                        <tr>
                                            <th><L>Make</L></th><td>{item.make}</td>
                                        </tr><tr>
                                            <th><L>Model</L></th><td>{item.model}</td>
                                        </tr>
                                        <tr>
                                            <th><L>Year</L></th><td>{item.year}</td>
                                        </tr><tr>
                                            <th><L>Milage</L></th><td>~{item.milage}</td>
                                        </tr>
                                        <tr>
                                            <th><L>Transmission</L></th><td>{item.transmission}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-md">
                                <table className="table table-bordered auction-table">
                                    <tbody>
                                        <tr>
                                            <th><L>VIN</L></th><td>{item.vin}</td>
                                        </tr>
                                        <tr>
                                            <th><L>Title Status</L></th><td>{item.titleStatus}</td>
                                        </tr><tr>
                                            <th><L>Condition</L></th><td>{item.cosmeticFlaws ? 'See details' : 'None'}</td>
                                        </tr>
                                        <tr>
                                            <th><L>Seller Type</L></th><td>{item.sellerType}</td>
                                        </tr><tr>
                                            <th><L>Seller</L></th><td>{item.createdByUserName} <a href="#"><L>Contact</L></a></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div> : ''}

                        {item.type === 'Vehicle' ? <div className="auction-details">
                            {item.highlights ? <><h4><L>Highlights</L></h4>
                                <div>{item.highlights}</div></> : ''}
                            {item.features ? <><h4><L>Options and features</L></h4>
                                <div>{item.features}</div></> : ''}
                            {this.state.item.modType === 'Modified' ? <h4><L>Modifications</L></h4> : ''}
                            <div>{item.mods}</div>
                            {item.cosmeticFlaws ? <><h4><L>Known flaws</L></h4>
                                <div>{item.cosmeticFlawsDetail}</div></> : ''}
                            <h4><L>Ownership details</L></h4>
                            {!this.state.titleOwnership ? <div><L>This title is owner by the seller.</L></div> :
                                <div>{item.titleOwnershipRel}</div>}
                        </div> : ''}

                        {item.mapImageID ? <div className="mt-2 mb-2">
                            <div className="d-block mx-auto p-3 bg-light" style={{ maxWidth: '500px' }}>
                                <img src={Globals.serverUrl + item.mapImage.url} alt="" className="img-fluid" />
                            </div>
                        </div> : ''}

                        <div className="auction-current mt-4 border">
                            <div className="row m-3">
                                <div className="col-md-6">
                                    {!item.ended && !item.awaitingStartDate ?
                                        item.currentBidUserID ? <div><L>Current bid:</L> <strong>{item.currentBidUserName}</strong></div> : <div><L>No current bid</L></div> : ''}
                                    {!item.ended && !item.awaitingStartDate ? <div className="fs-1 fw-500">{item.currentBid ? this.formatter.format(item.currentBid) : 'NONE'}</div> : (item.ended || item.timeLeft === 'Ended' ? <div className="fs-1 fw-500"><L>Ended on:</L> {Globals.toMDYDateString(item.endDate)}</div> : <div className="fs-1 fw-500"><L>Starts on:</L> {Globals.toMDYDateString(item.startDate)}</div>)}
                                    {!item.ended && !item.awaitingStartDate ?
                                        this.state.item.bidCount === 0 ? <a href="#" role="button" onClick={e => { e.preventDefault(); this.showBid() }} disabled={this.state.bidLoading}><L>Be the first one to bid!</L></a> : '' : ''}
                                </div>
                                <div className="col-md-6">
                                    <table>
                                        <tbody>
                                            <tr><th><L>Seller</L></th><td>{item.createdByUserName}</td></tr>
                                            <tr><th><L>Ends</L></th><td><FontAwesomeIcon icon={fa.faCalendar} className="text-muted" /> {Globals.toLocaleDateString(item.endDate)}</td></tr>
                                            {!item.ended && !item.awaitingStartDate ? <tr><th><L>Bids</L></th><td><FontAwesomeIcon icon={fa.faHashtag} className="text-muted" /> {item.bidCount}</td></tr> : ''}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="bg-light p-3">
                                <div className="row align-items-center">
                                    <div className="col-md-4 pt-4 pt-md-0">
                                        {!item.ended && !item.awaitingStartDate ? <button type="button" className="btn btn-success btn-lg" onClick={() => this.showBid()} disabled={this.state.bidLoading}><L>Place Bid</L></button> : ''}
                                        {!item.ended ? <button type="button" className="btn btn-primary btn-lg ms-2" onClick={() => this.setState({ showShareModal: true })}><L>Share</L> <FontAwesomeIcon icon={fa.faShareFromSquare} /></button> : ''}
                                    </div>
                                    <div className="col-md-4 pt-4 pt-md-0">
                                        <Link to="/about/how-it-works" className="text-muted text-decoration-none"><FontAwesomeIcon icon={fa.faCircleQuestion} className="text-muted" /> How buying works</Link>
                                    </div>
                                    <div className="col-md-4 pt-4 pt-md-0">
                                        <a href="#" className="text-muted text-decoration-none" onClick={e => e.preventDefault()}><FontAwesomeIcon icon={fa.faEye} className="text-muted" /> Watch this auction</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 pt-2">
                    </div>
                </div>
            </div></>;
    }
}

export default withParamsAndNavigate(AuctionView);