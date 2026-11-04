import BaseCom from "./BaseCom";
import TimelinePost from "./TimelinePost";
import './TimelineReplies.css';

export default class TimelineReplies extends BaseCom {

    render() {
        var list = [...this.props.list];
        list.reverse();
        return <div className="TimelineReplies">
            {list.map(i => <div key={i.id} className="mt-2">
                <TimelinePost item={i} isReply />
            </div>)}
        </div>;
    }
}