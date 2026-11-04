import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import L from "./Lang";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Link } from 'react-router-dom';
import './SearchResults.css';
import TimelinePost from "./TimelinePost";
import Globals from "../shared/Globals";
import LoadingAlert from "./LoadingAlert";
import Alert from "./Alert";

class SearchResults extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            results: {
                profiles: [],
                posts: []
            },
            loaded: false
        };
        this.load = this.load.bind(this);
    }

    componentDidMount() {
        this.load();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.params) {
            if (prevProps.params.q !== this.props.params.q)
                this.load();
        }
    }

    load() {
        this.setState({ loaded: false });
        qreq.get('/api/social/search?query=' + this.props.params.q, j => {
            if (j.item)
                this.setState({ results: j.item });
            else if (j.errorCode !== 0)
                this.setState({ error: j.errorMessage });
            this.setState({ loaded: true });
        }, () => {
            this.setState({ loaded: true, error: 'Unknown error. Please try again.' })
        });
    }

    render() {
        return <div className="container SearchResults">
            <h1 className="mb-3"><L>Search Results for <i>{this.props.params.q}</i></L></h1>
            <hr />
            {this.state.loaded ? <>
                {this.state.results.profiles && this.state.results.profiles.length > 0 ? <>
                    <h2 className="mb-3"><L>User Profiles</L></h2>
                    <section className="mb-3">
                        <div className="container p-3">

                            {this.state.results.profiles.map(i => <div key={i.id} className="row bg-light rounded p-4 mb-2">
                                <div className="col-2">
                                    <Link to={'/u/' + i.username}><img src={i.displayPhoto && i.displayPhoto.id ? Globals.serverUrl + i.displayPhoto.thumbUrl : '/img/profile-default.svg'} alt="" className="img-fluid profile-avatar w-100" /></Link>
                                </div>
                                <div className="col-10">
                                    <h5><Link to={'/u/' + i.username}>{i.username}</Link></h5>
                                    <p>{i.bio}</p>
                                </div>
                            </div>)}
                        </div>
                    </section></> : ''}
                {this.state.results.posts && this.state.results.posts.length > 0 ? <>
                    <h2 className="mt-3"><L>Timeline</L> <L>Results</L></h2>
                    <section className="mb-3">
                        <div className="container p-3">
                            <div className="Timeline">
                                {this.state.results.posts.map(i => <div key={i.id} className="mb-2">
                                    <TimelinePost item={i} />
                                </div>)}
                            </div>
                        </div>
                    </section></> : ''}
            </> : <LoadingAlert />}
            {this.state.error ? <Alert type="danger"><L>{this.state.error}</L></Alert> : ''}
        </div>;
    }
}

export default withParamsAndNavigate(SearchResults);