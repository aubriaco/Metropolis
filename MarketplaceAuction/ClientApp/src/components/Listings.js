import BaseCom from './BaseCom';
import L from './Lang';
import Card from './Card';
import { qreq } from '../shared/qrequest';
import { withParamsAndNavigate } from './WithParamsAndNavigate';
import { Link } from 'react-router-dom';
import Alert from './Alert';
import ListingQuestions from './ListingQuestions';
import Globals from '../shared/Globals';
import NativeNav from './NativeNav';

class Listings extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            appliances: [],
            loaded: false
        };
    }

    componentDidMount() {
        qreq.get('/api/vehicle/my/list', j => {
            if (j.list)
                this.setState({ list: j.list });
            this.setState({ loaded: true });
        });
        qreq.get('/api/auction/appliance/my/list', j => {
            if (j.list)
                this.setState({ appliances: j.list });
            this.setState({ appliancesLoaded: true });
        });
    }

    render() {
        return <div className="container-narrow">
            <NativeNav show={Globals.mobileView} />
            <h1 className="mb-5"><L>Vehicle Listings</L></h1>
            {this.state.loaded ? (this.state.list.length === 0 ? <><p><L>It seems that you haven't submitted any cars for sale yet. Are you interested in selling your car?</L></p>
                <Link to="/sell/vehicle" role="button" className="btn btn-success btn-lg">List your vehicle</Link>
            </> :
                <div className="listings">
                    {this.state.list.map(i => <div key={i.id}>
                        <Card>
                            <h4><Link to={'/auction/vehicle/' + i.id}>{i.year} {i.make} {i.model}</Link></h4>
                            {i.bidCount ? <div><strong>{i.bidCount} bids, Current {Globals.formatter.format(i.currentBid)}</strong>{i.currentBid >= i.reservePrice ? <span> - RESERVE NOT MET</span> : ''}</div> : ''}
                            {i.started ? (i.awaitingStartDate ? <div><L>Starts on:</L> {Globals.toMDYHMAMPMLocalDateString(i.startDate)}</div> : <div><L>Started on:</L> {Globals.toMDYHMAMPMLocalDateString(i.startDate)}</div>) : <div><L>Pending review</L></div>}
                            {i.started ? (i.ended ? <div>Ended</div> : <div><L>Ends on:</L> {Globals.toMDYHMAMPMLocalDateString(i.endDate)}</div>) : ''}
                            {i.paused ? <div><i><L>PAUSED</L></i></div> : ''}
                            {i.rejected ? <div><i><L>REJECTED ON REVIEW - Please submit a new listing with correct information.</L></i></div> : ''}
                        </Card></div>
                    )}
                </div>) : <Alert message="Loading..." />}

            <h1 className="mb-5"><L>Article Listings</L></h1>
            {this.state.appliancesLoaded ? (this.state.appliances.length === 0 ? <><p><L>It seems that you haven't submitted any articles for sale yet. Are you interested in selling your article?</L></p>
                <Link to="/sell/appliance" role="button" className="btn btn-success btn-lg">List your article</Link>
            </> :
                <div className="listings">
                    {this.state.appliances.map(i => <div key={i.id}>
                        <Card>
                            <h4><Link to={'/auction/article/' + i.id}>{i.name}</Link></h4>
                            {i.bidCount ? <div><strong>{i.bidCount} bids, Current {Globals.formatter.format(i.currentBid)}</strong>{i.currentBid >= i.reservePrice ? <span> - RESERVE NOT MET</span> : ''}</div> : ''}
                            {i.started ? (i.awaitingStartDate ? <div><L>Starts on:</L> {Globals.toMDYHMAMPMLocalDateString(i.startDate)}</div> : <div><L>Started on:</L> {Globals.toMDYHMAMPMLocalDateString(i.startDate)}</div>) : <div><L>Pending review</L></div>}
                            {i.started ? (i.ended ? <div>Ended</div> : <div><L>Ends on:</L> {Globals.toMDYHMAMPMLocalDateString(i.endDate)}</div>) : ''}
                            {i.paused ? <div><i><L>PAUSED</L></i></div> : ''}
                            {i.rejected ? <div><i><L>REJECTED ON REVIEW - Please submit a new listing with correct information.</L></i></div> : ''}
                        </Card></div>
                    )}
                </div>) : <Alert message="Loading..." />}

            <ListingQuestions />
        </div>;
    }
}

export default withParamsAndNavigate(Listings);