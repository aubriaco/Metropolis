import { qreq } from '../shared/qrequest';
import BaseCom from './BaseCom';
import L from './Lang';
import { Link } from 'react-router-dom';
import Globals from '../shared/Globals';
import './RaceTracks.css';

export default class RaceTracks extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            item: {}
        };
        this.load = this.load.bind(this);
    }

    componentDidMount() {
        this.load();
    }

    load() {
        qreq.get('/api/race-track/list', j => {
            if (j.list)
                this.setState({ list: j.list });
        });
    }

    render() {
        return <>
            <div className="container RaceTracks">
                <h1 className="mb-3"><L>Race Tracks</L></h1>
                <section>
                    <div className="container p-2">
                        <div className="row">
                            {this.state.list.map(i =>
                                <div key={i.id} className="col-md-6">
                                    <Link to={'/race-tracks/' + i.id} role="button" className="d-block p-2 bg-light text-center">
                                        <div className="c-img rounded" style={{ backgroundImage: 'url(\'' + Globals.serverUrl + i.displayPhoto.thumbUrl + '\')' }}></div>
                                        <span className="fs-2">{i.name}</span>
                                    </Link>
                                </div>)}
                        </div>
                    </div>
                </section>
            </div>
        </>;
    }
}