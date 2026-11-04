import BaseCom from "./BaseCom";
import Card from "./Card";
import { Link } from 'react-router-dom';
import Globals from "../shared/Globals";
import ImageGallery from "./ImageGallery";
import ImageThumb from "./ImageThumb";
import WritePostModal from "./WritePostModal";
import TimelineReplies from "./TimelineReplies";

export default class TimelinePost extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            writePostItem: {},
            replies: props.item.replies
        };
        this.onWritePost = this.onWritePost.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.item !== this.props.item)
            this.setState({ replies: this.props.item.replies });
    }

    onWritePost(obj, replyTo) {
        var list = [...this.state.replies];
        list.splice(0, 0, obj);
        this.setState({ replies: list });
    }

    render() {
        var i = this.props.item;

        if (this.props.isReply) {
            return <>
                <div className="row align-items-center mt-3">
                    <div className="col-2 col-md-1 text-center">
                        <Link to={'/u/' + i.username}><img src={i.userDisplayPhoto && i.userDisplayPhoto.id ? Globals.serverUrl + i.userDisplayPhoto.thumbUrl : '/img/profile-default.svg'} alt="" className="t-avatar" /></Link>
                    </div>
                    <div className="col-10 col-md-11 t-reply rounded">
                        <strong><Link to={'/u/' + i.username}>{i.username}</Link></strong><br />
                        <div className="t-message">{i.message}</div>
                        {i.photos && i.photos.length === 1 ? <div className="t-photos bg-light rounded p-3">
                            <ImageThumb item={i.photos[0]} />
                        </div> : ''}
                        {i.photos && i.photos.length > 1 ? <div className="t-photos bg-light rounded p-3">
                            <ImageGallery list={i.photos} />
                        </div> : ''}
                    </div>
                </div>
            </>;
        }

        return <>
            <WritePostModal replyTo={i} show={this.state.showWritePostModal} onToggle={() => this.setState({ showWritePostModal: false })} onSave={this.onWritePost} onChange={obj => this.setState({ writePostItem: obj })} />
            <Card>
                <div className="t-head d-flex mb-2">
                    <img src={i.userDisplayPhoto && i.userDisplayPhoto.id ? Globals.serverUrl + i.userDisplayPhoto.thumbUrl : '/img/profile-default.svg'} alt="" className="t-avatar" />
                    <div className="ms-2">
                        <strong><Link to={'/u/' + i.username}>{i.username}</Link></strong><br />
                        <small>{Globals.toMDYHMAMPMLocalDateString(i.createdDate)}</small>
                    </div>
                </div>
                <div className="t-message mb-2">
                    {i.message}
                </div>
                {i.photos && i.photos.length === 1 ? <div className="t-photos bg-light rounded p-3">
                    <ImageThumb item={i.photos[0]} />
                </div> : ''}
                {i.photos && i.photos.length > 1 ? <div className="t-photos bg-light rounded p-3">
                    <ImageGallery list={i.photos} />
                </div> : ''}
                <TimelineReplies list={this.state.replies} />
                {!this.props.isReply ? <div className="mt-2 p-2">
                    <div className="form-control text-muted t-input p-2 rounded-4" role="button" onClick={() => this.setState({ showWritePostModal: true })}>
                        {this.state.writePostItem && this.state.writePostItem.message ? this.state.writePostItem.message : 'Write your message...'}
                    </div>
                </div> : ''}
            </Card>
        </>;
    }
}