import BaseCom from "./BaseCom";
import FormInput from "./FormInput";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import L from "./Lang";
import { Link } from 'react-router-dom';
import { qreq } from "../shared/qrequest";
import Globals from "../shared/Globals";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import './AuctionBrowser.css';
import NativeNav from "./NativeNav";

class AuctionBrowser extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            filter: {},
            transmissions: [
                { id: 'All', name: 'All' },
                { id: 'Automatic', name: 'Automatic' },
                { id: 'Manual', name: 'Manual' }
            ],
            bodyTypes: [],
            bodyTypesNames: ['All', 'Coupe', 'Convertible', 'Hatchback', 'Sedan', 'SUV/Crossover', 'Truck', 'Van/Minivan', 'Wagon'],
            years: []
        };


        this.state.bodyTypesNames.forEach(i => {
            this.state.bodyTypes.push({ id: i, name: i });
        });

        for (var n = Number(new Date().getFullYear()); n >= 1981; n--) {
            this.state.years.push({ id: n, name: n });
        }

        this.load = this.load.bind(this);
        this.filter = this.filter.bind(this);
    }

    componentDidMount() {
        this.load();
        this.timer = setInterval(this.load, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    load(filter) {
        if (this.load_process)
            return;
        this.load_process = true;
        if (!filter)
            filter = { ...this.state.filter };
        if (this.props.type === "appliance") {
            qreq.post('/api/auction/appliance/list', filter, j => {
                if (j.list) {
                    this.setState({ list: j.list });
                    if (j.list.length === 0)
                        this.props.navigate('/sell');
                }
                this.load_process = false;
            }, () => {
                this.load_process = false;
            });
        }
        else {
            qreq.post('/api/vehicle/list', filter, j => {
                if (j.list) {
                    this.setState({ list: j.list });
                    if (j.list.length === 0)
                        this.props.navigate('/sell');
                }
                this.load_process = false;
            }, () => {
                this.load_process = false;
            });
        }
    }

    filter() {

    }

    render() {
        return <div className="container">
            <NativeNav show={Globals.mobileView} noBack />
            <div className="d-block d-lg-flex justify-content-start">
                <h1>{this.props.type === 'appliance' ? <L>Articles</L> : <L>Vehicles</L>}</h1>
                <div className="row ms-lg-3 justify-content-start align-items-center d-none">
                    <div className="col-4">
                        <FormInput type="select" model={this.state.filter} name="years" label="Years" labelAsPlaceholder options={this.state.years} onChange={this.filter} inputStyle={{ width: '90px' }} />
                    </div>
                    <div className="col-4">
                        <FormInput type="select" model={this.state.filter} name="transmission" label="Transmission" labelAsPlaceholder options={this.state.transmissions} onChange={this.filter} inputStyle={{ width: '140px' }} />
                    </div>
                    <div className="col-4">
                        <FormInput type="select" model={this.state.filter} name="bodyStyle" label="Body Style" labelAsPlaceholder options={this.state.bodyTypes} onChange={this.filter} inputStyle={{ width: '125px' }} />
                    </div>
                </div>
                <div className="d-flex justify-content-evenly ms-auto auction-types d-none">
                    <div className="p-2"><Link to="/auction/ending"><L>Ending Soon</L></Link></div>
                    <div className="p-2"><Link to="/auction/new"><L>Just Listed</L></Link></div>
                    <div className="p-2"><Link to="/auction/low-miles"><L>Low Milage</L></Link></div>
                    <div className="p-2"><Link to="/auction/location"><L>By Location</L></Link></div>
                </div>
            </div>
            <div className="row">
                {this.state.list.map(i => <div key={i.id} className="col-md-3 p-3">
                    <div className="bg-dark rounded">
                        <div onClick={() => this.props.navigate(i.type === 'Vehicle' ? '/auction/vehicle/' + i.id : '/auction/article/' + i.id)} className="auction-image rounded" style={{ backgroundImage: 'url(\'' + Globals.serverUrl + i.displayPhoto.url + '\')' }} onMouseOver={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>
                            <div className="auction-info rounded p-1">
                                {i.ended ? <span className="auction-timer"><FontAwesomeIcon icon={fa.faClock} /> <L>Ended</L></span> : i.awaitingStartDate ? <span className="auction-timer"><FontAwesomeIcon icon={fa.faClock} /> <L>Starts on:</L> {Globals.toMDYDateString(i.startDate)}</span> : <span className="auction-timer"><FontAwesomeIcon icon={fa.faClock} /> {i.timeLeft}</span>}
                                {i.awaitingStartDate ? '' : <span className="auction-bid ms-2"><FontAwesomeIcon icon={fa.faArrowUp} /> <b>{Globals.formatter.format(i.currentBid)}</b></span>}                                
                            </div>
                            <Link to={'/auction/' + i.id}>
                                <img src={Globals.serverUrl + i.displayPhoto.thumbUrl} alt="" className="img-fluid d-none" style={{ maxHeight: '220px' }} />
                            </Link>
                        </div>
                    </div>
                    <Link to={i.type === 'Vehicle' ? '/auction/vehicle/' + i.id : '/auction/article/' + i.id} className="d-block auction-title mt-2">
                        {i.type === 'Vehicle' ? <>{i.year} {i.make} {i.model}</> : i.name}
                        {!i.reservePriceEnabled ? <span className="badge bg-primary ms-2"><L>NO RESERVE</L></span> : ''}
                    </Link>
                </div>)}
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(AuctionBrowser);