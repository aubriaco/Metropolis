import BaseCom from './BaseCom';
import L from './Lang';
import Card from './Card';
import { qreq } from '../shared/qrequest';
import { withParamsAndNavigate } from './WithParamsAndNavigate';
import { Link } from 'react-router-dom';
import Alert from './Alert';
import Globals from '../shared/Globals';
import FormInput from './FormInput';

class ListingQuestions extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            loaded: false
        };
        this.submitReply = this.submitReply.bind(this);
    }

    componentDidMount() {
        qreq.get('/api/auction/qa/my/list', j => {
            if (j.list)
                this.setState({ list: j.list });
            this.setState({ loaded: true });
        });
    }

    submitReply(obj, e) {
        if (e) e.preventDefault();
        var item = obj;
        this.setState({ submitting: true });
        qreq.post('/api/auction/qa/answer', item, j => {
            if (j.errorCode === 0) {
                item.isAnswered = true;
                item.newAnswer = false;
                this.setState({ list: this.state.list });
            }
            else
                this.alert(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.alert('Unknown error. Please try again...');
            this.setState({ submitting: false });
        });
    }

    render() {
        return <div className="ListingQuestions">
            <h1 className="mb-5"><L>Questions</L></h1>
            {this.state.loaded ? (this.state.list.length === 0 ? <><p><L>There are no questions for your listings yet.</L></p>
            </> :
                <div className="questions">
                    {this.state.list.map(i => <div key={i.id}>
                        <Card>
                            <h4>{i.name}</h4>
                            <div><small><i><L>Asked on:</L> {Globals.toMDYHMAMPMLocalDateString(i.createdDate)}</i> <L>Asked By:</L> <strong>{i.username}</strong></small></div>
                            <p>{i.question}</p>
                            {!i.isAnswered || i.newAnswer ? <form onSubmit={e => this.submitReply(i, e)} className="mt-2">
                                <FormInput model={i} name="isPublic" label="Make this answer visible in the auction Q&A." type="switch" />
                                <FormInput model={i} name="answer" label="Write your answer here..." type="textarea" labelAsPlaceholder required postAddon={<button type="submit" className="btn" disabled={this.state.submitting}><L>Submit</L></button>} />
                            </form> : <div>
                                <p>{i.answer}</p>
                                <button type="button" className="btn btn-secondary" onClick={() => { i.newAnswer = true; this.setState({ list: this.state.list }); }}><L>Edit Answer</L></button>
                            </div>}
                        </Card>
                    </div>
                    )}
                </div>
            ) : <Alert message="Loading..." />}
        </div>;
    }
}

export default withParamsAndNavigate(ListingQuestions);