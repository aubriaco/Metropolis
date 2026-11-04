import Globals from '../shared/Globals';
import BaseCom from './BaseCom';
import L from './Lang';
import Alert from './Alert';
import { qreq } from '../shared/qrequest';
import { withParamsAndNavigate } from './WithParamsAndNavigate';

class RaceTrackProfile extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            item: {}
        };
    }

    componentDidMount() {
        qreq.get('/api/race-track/item?id=' + this.props.params.id, j => {
            if (j.item)
                this.setState({ item: j.item });
        });
    }

    render() {
        var item = this.state.item;
        return <>
            <div className="container RaceTrackProfile">
                <h1 className="mb-3"><L>{item.name}</L></h1>
                <section>
                    <div className="container p-2">
                        {item.displayPhoto ? <div className="bg-light p-2">
                            <img src={Globals.serverUrl + item.displayPhoto.url} alt="" className="img-fluid d-block mx-auto" />
                        </div> : ''}
                    </div>
                </section>
            </div>
        </>;
    }
}

export default withParamsAndNavigate(RaceTrackProfile);