import BaseCom from "./BaseCom";
import FormInput from "./FormInput";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import L from "./Lang";
import { Link } from 'react-router-dom';
import { qreq } from "../shared/qrequest";
import Globals from "../shared/Globals";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import './AuctionView.css';
import BidModal from "./BidModal";
import LoginModal from "./LoginModal";
import PostSignupModal from "./PostSignupModal";
import SignupModal from "./SignupModal";
import Auth from "../shared/Auth";
import { Helmet } from "react-helmet";
import ShareModal from "./ShareModal";
import Alert from "./Alert";
import LoadingModal from "./LoadingModal";
import Card from "./Card";


class AuctionQA extends BaseCom {

    constructor(props) {
        super(props)
        this.state = {
            list: [],
            ask: {}
        };
        this.load = this.load.bind(this);
        this.post = this.post.bind(this);
        this.onInputClick = this.onInputClick.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(j => {
            this.setState({ user: j, loaded: true });
        });
        this.load();
    }

    post(e) {
        if (e) e.preventDefault();
        if (!this.state.user || this.state.submitting)
            return;
        this.setState({ submitting: true });
        var ask = { ...this.state.ask };
        ask.auctionWrapID = this.props.item.auctionWrapID;
        qreq.post('/api/auction/qa/post', ask, j => {
            if (j.errorCode === 0) {
                this.setState({ ask: {} });
                this.setTempState({ success: <L>Successfully posted question. The seller will be notified, once they reply you will receive their answer.</L> })
            }
            else
                this.showError(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.setState({ submitting: false });
        });
    }

    load() {
        qreq.get('/api/auction/qa/list?wrapID=' + this.props.item.auctionWrapID, j => {
            if (j.list)
                this.setState({ list: j.list });
        });
    }

    onInputClick() {
        if (!this.state.loaded) {
            setTimeout(() => this.onInputClick(), 100);
            return;
        }
        if (!this.state.user)
            this.props.onShowLogin();
    }

    render() {
        return <div className="AuctionQA">
            <h4><L>Questions and Answers</L></h4>
            <form onSubmit={this.post}>
                <FormInput model={this.state.ask} name="question" label="Ask your own question..." type="text" labelAsPlaceholder required postAddon={<button type="submit" className="btn" disabled={this.state.submitting}><L>Submit</L></button>} onClick={this.onInputClick} disabled={this.state.submitting} />
                {this.state.success ? <Alert type="success">{this.state.success}</Alert> : ''}
                {this.state.error ? <Alert type="danger">{this.state.error}</Alert> : ''}
            </form>
            <div className="mt-2">
                {this.state.list.map(i => <div key={i.id}>
                    <div><strong>{i.question}</strong></div>
                    <div><small><L>Answered on:</L> <i>{Globals.toMDYHMAMPMLocalDateString(i.answerDate)}</i></small></div>
                    <p>{i.answer}</p>
                </div>)}
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(AuctionQA);