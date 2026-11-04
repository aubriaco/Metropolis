import Alert from "./Alert";
import BaseCom from "./BaseCom";
import L from "./Lang";
import WritePostModal from "./WritePostModal";
import LoadingAlert from "./LoadingAlert";
import Card from "./Card";
import ImageGallery from "./ImageGallery";
import ImageThumb from "./ImageThumb";
import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import { Link } from 'react-router-dom';
import "./Timeline.css";
import TimelinePost from "./TimelinePost";

export default class Timeline extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            loaded: false,
            writePostItem: {}
        };
        this.load = this.load.bind(this);
        this.onWritePost = this.onWritePost.bind(this);
    }

    componentDidMount() {
        this.load();
    }


    load() {
        qreq.get('/api/timeline/list' + (this.props.profileUsername ? '/' + this.props.profileUsername : ''), j => {
            if (j.list)
                this.setState({ list: j.list });
            this.setState({ loaded: true });
        }, () => {
            this.setState({ loaded: true });
        });
    }

    onWritePost(obj) {
        var list = [...this.state.list];
        list.splice(0, 0, obj);
        this.setState({ list: list });
    }

    render() {
        return <div className={this.props.profileUsername ? 'Timeline' : 'Timeline container'}>
            <WritePostModal show={this.state.showWritePostModal} onToggle={() => this.setState({ showWritePostModal: false })} onSave={obj => this.onWritePost(obj)} onChange={obj => this.setState({ writePostItem: obj})} />
            {this.props.profileUsername ? '' : <h1 className="mb-3"><L>Timeline</L></h1>}
            {this.props.profileUsername ? '' : <div className="container p-2">
                    <div className="form-control p-3 rounded-4" role="button" onClick={() => this.setState({ showWritePostModal: true })}>
                        {this.state.writePostItem && this.state.writePostItem.message ? this.state.writePostItem.message : 'Write your message...'}
                    </div>
                </div>}
                <div className={this.props.profileUsername ? '' : 'container p-2 pt-4'}>
                    {this.state.loaded ? <>
                        {this.state.list.length === 0 ? <Alert><L>There are no stories.</L></Alert> : <>
                            {this.state.list.map(i => <div key={i.id}>
                                <TimelinePost item={i} />
                            </div>)}
                        </>}
                    </> : <LoadingAlert />}
                </div>
        </div>;
    }
}