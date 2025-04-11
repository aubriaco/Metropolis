/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Auth from "../shared/Auth";
import { getLang } from "../shared/GLang";
import Globals from "../shared/Globals";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";
import FormInput from "./FormInput";
import L from "./Lang";
import Rating from "./Rating";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Link } from 'react-router-dom';

class Reviews extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            info: {
                rating: 0
            },
            list: []
        };
        this.load = this.load.bind(this);
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        this.load();
        Auth.getLogin(u => {
            this.setState({ user: u });
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.item !== prevProps.item) {
            this.load();
        }
    }

    load() {
        qreq.get('/api/review/list?productId=' + this.props.item.id, j => {
            if (j.list)
                this.setState({ list: j.list });
            else
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
    }

    submit(e) {
        if (e) e.preventDefault();
        if(!this.state.info.rating) {
            this.alert(getLang('You must select rating stars.'));
            return;
        }
        this.setState({ submitting: true });
        qreq.post('/api/review/submit', { ...this.state.info, productID: this.props.item.id }, j => {
            if (j.errorCode === 0) {
                this.setState({ info: {} });
                this.success(getLang('Review successfully submitted.'));
                this.load();
            }
            else
                this.alert(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.unkownErrorCallback();
            this.setState({ submitting: false });
        });
    }

    render() {
        var stars = [];

        for(var n = 1; n <= 5; n++) {
            stars.push(<i key={n} onClick={e => this.setState({ info: {...this.state.info, rating: e.target.getAttribute('data-rating') }})} data-rating={n} className={'bx bxs-star ' + (this.state.info.rating >= n ? 'text-warning' : 'text-light-4')}></i>);
        }


        return <><div className="row pt-3">
            <div className="col-lg-8">
                <div className="product-review">
                    <h5 className="mb-4">{this.props.item.reviewCount} Review{this.props.item.reviewCount !== 1 ? 's' : ''} For The Product</h5>
                    <div className="review-list">
                        {this.state.list && this.state.list.map(a => <div key={a.id}>
                            <div className="d-flex align-items-start">
                                <div className="review-content ms-3">
                                    <Rating rating={a.rating} />
                                    <div className="d-flex align-items-center mb-2">
                                        <h6 className="mb-0">{a.firstName} {a.lastName}</h6>
                                        <p className="mb-0 ms-auto">{Globals.toMDYHMLocalDateString(a.createdDate)}</p>
                                    </div>
                                    <p>{a.body}</p>
                                </div>
                            </div>
                            <hr />
                        </div>)}
                    </div>
                </div>
            </div>
            <div className="col-lg-4">
                <div className="add-review border">
                    <div className="form-body p-3">
                        <form onSubmit={this.submit}>
                            <h4 className="mb-4"> <L>Write a Review</L> </h4>
                            {!this.state.user ? <>
                                <p> <L>You must</L> <Link to="/login"> <L>login to your account</L> </Link> <L>to write a review.</L> </p>
                            </> :
                                <>
                                    <div className="mb-3">
                                        <label className="form-label"> <L>Rating</L> </label>
                                        <div className="rates cursor-pointer fs-6">
                                            {stars}
                                        </div>
                                        <small>{this.state.info.rating === 1 ? <L>Poor product</L>
                                        : this.state.info.rating === 2 ? <L>Fair product</L>
                                        : this.state.info.rating === 3 ? <L>Good product</L>
                                        : this.state.info.rating === 4 ? <L>Very Good product</L>
                                        : this.state.info.rating === 5 ? <L>Excellent product</L> : ''}</small>
                                    </div>
                                    <div className="mb-3">
                                        <FormInput model={this.state.info} name="body" label="Review" type="textarea" rows="3" inputClassName="rounded-0" />
                                    </div>
                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-dark btn-ecomm"> <L>Submit a Review</L> </button>
                                    </div>
                                </>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
        </>;
    }
}

export default withParamsAndNavigate(Reviews);