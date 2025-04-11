import BaseCom from './BaseCom';
import L from './Lang';
import Card from './Card';
import { qreq } from '../shared/qrequest';
import { withParamsAndNavigate } from './WithParamsAndNavigate';
import { Link } from 'react-router-dom';
import Alert from './Alert';

class BidHistory extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            loaded: false
        };
    }

    componentDidMount() {
        qreq.get('/api/vehicle/my/list', j => {
            if (j.list)
                this.setState({ list: j.list });
            this.setState({ loaded: true });
        });
    }

    render() {
        return <div className="container-narrow">
            <h1 className="mb-5"><L>Listings</L></h1>
            {this.state.loaded ? (this.state.list.length === 0 ? <><p><L>It seems that you haven't submitted any cars for sale yet. Are you interested in selling your car?</L></p>
                <Link to="/sell/vehicle" role="button" className="btn btn-success btn-lg">List your vehicle</Link>
            </> :
                <div className="listings">
                    {this.state.list.map(i => <div key={i.id}>
                        <Card>
                            <h4>{i.year} {i.make} {i.model}</h4>
                        </Card></div>
                    )}
                </div>) : <Alert message="Loading..." />}
        </div>;
    }
}

export default withParamsAndNavigate(BidHistory);