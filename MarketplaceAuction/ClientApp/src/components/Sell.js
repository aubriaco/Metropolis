import BaseCom from "./BaseCom";
import L from "./Lang";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Link } from 'react-router-dom';
import SignupModal from "./SignupModal";
import Globals from "../shared/Globals";
import Auth from "../shared/Auth";
import LoginModal from "./LoginModal";
import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as fa from '@fortawesome/free-solid-svg-icons';
import {
    CarouselControl,
    Carousel,
    CarouselItem,
    CarouselIndicators,
} from 'reactstrap';
import './Sell.css';
import CountdownModal from "./CountdownModal";
import SetPasswordModal from "./SetPasswordModal";
import NativeNav from "./NativeNav";

class Sell extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            reviews: [
                {
                    id: 1,
                    author: 'Amelia H.',
                    content: 'I had an amazing experience using this platform to sell my car. The process was incredibly smooth, and I received multiple offers within days. Highly recommended!'
                },
                {
                    id: 2,
                    author: 'Ethan S.',
                    content: 'I can\'t express how impressed I am with this car auction platform.It has a user- friendly interface, and the response time from potential buyers was outstanding.I sold my car quickly and for a great price!'
                },
                {
                    id: 3,
                    author: 'Lily W.',
                    content: 'This platform provided me with access to a vast audience of car enthusiasts. I received multiple inquiries and bids on my vehicle, which gave me confidence in the selling process. It\'s a fantastic platform for anyone looking to sell their car hassle- free.'
                },
                {
                    id: 4,
                    author: 'Benjamin M.',
                    content: 'I\'ve used several car auction platforms before, but this one stands out.The customer support was excellent, and the listing process was straightforward.I received a fair price for my car, and the entire experience was seamless.Definitely my go-to platform from now on!'
                },
                {
                    id: 5,
                    author: 'Olivia H.',
                    content: 'Selling my car was a breeze with this platform. The application process was quick, and I received a response within hours. The platform attracted serious buyers, and I was able to sell my car at the desired price. I highly recommend it to anyone looking for a reliable and efficient car auction platform.'
                }
            ],
            activeIndex: 0
        };
        this.sell = this.sell.bind(this);
    }

    componentDidMount() {
        if (this.props.showSetPassword) {
            this.setState({ showSetPasswordModal: true });
        }
    }

    sell() {
        this.setState({ submitting: true });
        Auth.getLogin(j => {
            if (j)
                this.props.navigate('/sell/select');
            else
                this.setState({ showSignupModal: true });
            this.setState({ submitting: false });
        }, () => {
            this.setState({ submitting: false });
        });
    }

    render() {
        const itemLength = this.state.reviews.length - 1;

        const setActiveIndex = (idx) => {
            this.setState({ activeIndex: idx });
        };



        // Previous button for Carousel
        const previousButton = () => {
            if (this.state.animating) return;
            const nextIndex = this.state.activeIndex === 0 ?
                itemLength : this.state.activeIndex - 1;
            setActiveIndex(nextIndex);
        }

        // Next button for Carousel
        const nextButton = () => {
            if (this.state.animating) return;
            const nextIndex = this.state.activeIndex === itemLength ?
                0 : this.state.activeIndex + 1;
            setActiveIndex(nextIndex);
        }

        // Carousel Item Data
        const carouselItemData = this.state.reviews.map((item) => {
            return (
                <CarouselItem
                    key={item.id}
                    onExited={() => this.setState({ animating: false })}
                    onExiting={() => this.setState({ animating: true })}>
                    <div className="p-5">
                        <div className="author"><strong>{item.author}</strong></div>
                        <L>{item.content}</L>
                    </div>
                </CarouselItem>
            );
        });

        return <>
            <Helmet>
                <title>Bidea Online | {Globals.getLang('Sell your cars and articles')}</title>
            </Helmet>
            <LoginModal show={this.state.showLoginModal} onSignUp={e => { e.preventDefault(); this.setState({ showSignupModal: true, showLoginModal: false }); }} onToggle={() => { this.setState({ showLoginModal: false }); this.props.navigate('/'); }} />
            <SignupModal show={this.state.showSignupModal} onLogin={e => { e.preventDefault(); this.setState({ showSignupModal: false, showLoginModal: true }); }} onToggle={() => this.setState({ showSignupModal: false })} isAuctioneer />
            <SetPasswordModal show={this.state.showSetPasswordModal} onToggle={() => this.setState({ showSetPasswordModal: false })} code={this.props.params.code} />
            <CountdownModal onContinue={() => this.sell()} />
            <NativeNav show={Globals.mobileView} noBack />
            <div className="container sell mb-5">
                <div className="row">
                    <div className="col-md-4">
                        <h1 className="first"><L>List your</L><br /><span><L>cars and articles</L></span><br /><L>with us!</L></h1>
                        <h2 className="mt-4 mb-4"><L>Maximize your earnings while minimizing the hassle</L></h2>
                        <div className="d-block d-md-none">
                            <img src="/img/sell/slice/mobile.png" alt="" className="img-fluid" />
                        </div>
                        <ul className="facts">
                            <li><span className="h-icon rounded"><FontAwesomeIcon icon={fa.faTruckFast} /></span><span><L>Accelerate your sale process and get your vehicle or article from submission to auction within a week.</L></span></li>
                            <li><span className="h-icon rounded"><FontAwesomeIcon icon={fa.faFaceSmile} spin /></span><span><L>Tap into our vast community of passionate enthusiasts to reach a wide audience for your article or vehicle.</L></span></li>
                        </ul>
                        <div className="mt-5 text-center text-md-start">
                            <button onClick={this.sell} type="button" className="btn btn-lg p-3 box-shadow-down btn-primary signup" disabled={this.state.submitting}><L>Sell now for free!</L></button>
                        </div>
                    </div>
                    <div className="col-md-8 d-none d-md-block">
                        <div className="row">
                            <div className="img-slice-wrap">
                                <div className="img-slice">
                                    <div className="img">
                                        <picture>
                                            <img src="/img/sell/slice/1.jpg" alt="" className="img-fluid" />
                                        </picture>
                                    </div>
                                    <div className="img-canvas"></div>
                                </div>
                            </div>
                            <div className="img-slice-wrap">
                                <div className="img-slice">
                                    <div className="img">
                                        <picture>
                                            <img src="/img/sell/slice/2.jpg" alt="" className="img-fluid" />
                                        </picture>
                                    </div>
                                    <div className="img-canvas"></div>
                                </div>
                            </div>
                            <div className="img-slice-wrap">
                                <div className="img-slice">
                                    <div className="img">
                                        <picture>
                                            <img src="/img/sell/slice/3.jpg" alt="" className="img-fluid" />
                                        </picture>
                                    </div>
                                    <div className="img-canvas"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <h3 className="mb-5 mt-5 text-center"><span className="bline"><L>Complete your application within minutes and receive a response within one business day.</L></span></h3>

                
                <h2 className="mt-5 mb-5 text-center"><L>How it works?</L></h2>

                <div className="row">
                    <div className="col-6 col-md-3 text-center mb-5">
                        <img src="/img/sell/submit.png" alt="" /><br /><br />
                        <L>Submit your article or vehicle for auction.</L>
                    </div>
                    <div className="col-6 col-md-3 text-center mb-5">
                        <img src="/img/sell/accept.png" alt="" /><br /><br />
                        <L>We review and approve your submission.</L>
                    </div>
                    <div className="col-6 col-md-3 text-center mb-5">
                        <img src="/img/sell/bid.png" alt="" /><br /><br />
                        <L>Users bid on your auction.</L>
                    </div>
                    <div className="col-6 col-md-3 text-center mb-5">
                        <img src="/img/sell/sold.png" alt="" /><br /><br />
                        <L>When your article or vehicle sells, we connect you with the highest bidder.</L>
                    </div>
                </div>
            </div>
        </>;

        /*
        return <>
            <Helmet>
                <title>Bidea Online | {Globals.getLang('Sell your car')}</title>
            </Helmet>
            <LoginModal show={this.state.showLoginModal} onSignUp={e => { e.preventDefault(); this.setState({ showSignupModal: true, showLoginModal: false }); }} onToggle={() => { this.setState({ showLoginModal: false }); this.props.navigate('/'); }} />
            <SignupModal show={this.state.showSignupModal} onLogin={e => { e.preventDefault(); this.setState({ showSignupModal: false, showLoginModal: true }); }} onToggle={() => this.setState({ showSignupModal: false })} isAuctioneer />
            <div className="container-narrow sell mb-5">
                <div className="heading">
                    <h1 className="first"><span><L>List your cars with us!</L></span></h1>
                    <h2><L>Maximize your earnings while minimizing the hassle</L></h2>
                </div>

                <div className="row mt-5 mb-5">
                    <div className="col-md">
                        <ul className="facts">
                            <li><span className="h-icon rounded"><FontAwesomeIcon icon={fa.faTruckFast} /></span><span><L>Accelerate your car sale process and get your vehicle from submission to auction within a week.</L></span></li>
                            <li><span className="h-icon rounded"><FontAwesomeIcon icon={fa.faFaceSmile} spin /></span><span><L>Tap into our vast community of passionate enthusiasts to reach a wide audience for your car.</L></span></li>
                        </ul>
                    </div>
                    <div className="col-md d-none">
                        <h3><L>Our customers have expressed their love and appreciation for us!</L></h3>
                        <div className="reviews rounded">
                            <Carousel previous={previousButton} next={nextButton}
                                activeIndex={this.state.activeIndex} ride="carousel" interval="5000">
                                <CarouselIndicators items={this.state.reviews}
                                    activeIndex={this.state.activeIndex}
                                    onClickHandler={(newIndex) => {
                                        if (this.state.animating) return;
                                        setActiveIndex(newIndex);
                                    }} />
                                {carouselItemData}
                                <CarouselControl directionText="Prev"
                                    direction="prev" onClickHandler={previousButton} />
                                <CarouselControl directionText="Next"
                                    direction="next" onClickHandler={nextButton} />
                                </Carousel>
                        </div>
                    </div>
                </div>

                <h2 className="mb-5"><L>Complete your application within minutes and receive a response within one business day.</L></h2>

                <button onClick={this.sell} className="btn btn-success d-block fs-4 signup w-100" disabled={this.state.submitting}><L>Sell now for free!</L></button>

                <h2 className="mt-5 mb-5"><L>How it works?</L></h2>

                <div className="row">
                    <div className="col-md-3 text-center mb-5">
                        <img src="/img/sell/submit.png" alt="" /><br /><br />
                        <L>Submit your vehicle for auction.</L>
                    </div>
                    <div className="col-md-3 text-center mb-5">
                        <img src="/img/sell/accept.png" alt="" /><br /><br />
                        <L>We review and approve your submission.</L>
                    </div>
                    <div className="col-md-3 text-center mb-5">
                        <img src="/img/sell/bid.png" alt="" /><br /><br />
                        <L>Users bid on your auction.</L>
                    </div>
                    <div className="col-md-3 text-center mb-5">
                        <img src="/img/sell/sold.png" alt="" /><br /><br />
                        <L>When your car sells, we connect you with the highest bidder.</L>
                    </div>
                </div>

            </div>
        </>;
        */
    }
}

export default withParamsAndNavigate(Sell);