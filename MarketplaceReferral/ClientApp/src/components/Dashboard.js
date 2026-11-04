import Auth from "../shared/Auth";
import BaseCom from "./BaseCom";
import Card from "./Card";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Cell, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { qreq } from "../shared/qrequest";
import L from "./Lang";
import Icon from "./Icon";
import { Link } from "react-router-dom";
import Globals from "../shared/Globals";
import LoadingAlert from "./LoadingAlert";
import ShareModal from "./ShareModal";
import {
    Modal, ModalBody, ModalHeader, CarouselControl,
    Carousel,
    CarouselItem,
    CarouselIndicators } from 'reactstrap';
import Alert from "./Alert";

class Dashboard extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            contactPhone: '(787) 602-6285',
            rewardAmount: 500,
            leads: [],
            rewardsData: [],
            refAccountInfo: null,
            refAccountInfoLoaded: false,
            slider: [
                {
                    imageUrl: '/img/ref-program/home-power/slider/1.png'
                },
                {
                    imageUrl: '/img/ref-program/home-power/slider/2.png'
                },
                {
                    imageUrl: '/img/ref-program/home-power/slider/3.png'
                }
            ],
            activeIndex: 0
        }
        this.load = this.load.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            this.setState({ user: u });
            if (!u)
                this.props.navigate('/login');
            else {
                this.load();
                qreq.get('/api/content/sticky/get/referral-start', j => {
                    if (!j.item)
                        this.setState({ showStartModal: true });
                });
            }
        });
    }

    load() {
        qreq.get('/api/referral/chart/rewards', j => {
            if (j.list) {
                var total = 0;
                j.list.forEach(i => {
                    total += i.counter;
                });
                this.setState({ rewardsData: j.list, rewardsDataTotal: total });
            }
        });
        qreq.get('/api/referral/lead/list', j => {
            if (j.list)
                this.setState({ leads: j.list, leadsLoaded: true });
        });

        qreq.get('/api/referral/lead/self', j => {
            if (j.item)
                this.setState({ refAccountInfo: j.item });
        });
    }

    getStatusColorClass(status) {
        return status === 'Completed' ? 'text-success' : status === 'Created' ? 'text-muted' : status === 'Confirmed' ? 'text-info' : status === 'In Progress' ? 'text-primary' : status === 'Declined' ? 'Declined' : '';
    }

    render() {
        if (!this.state.user)
            return <></>;

        const itemLength = this.state.slider.length - 1;

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
        const carouselItemData = this.state.slider.map((item) => {
            return (
                <CarouselItem
                    key={item.imageUrl}
                    onExited={() => this.setState({ animating: false })}
                    onExiting={() => this.setState({ animating: true })}>
                    <Modal isOpen={item.show} toggle={() => { item.show = false; this.setState({ slider: this.state.slider }) }} size="lg">
                        <ModalBody className="text-center">
                            <img src={item.imageUrl} alt="" className="img-fluid" style={{ maxHeight: '90vh'}} onClick={() => {item.show = false; this.setState({slider: this.state.slider }) }} />
                        </ModalBody>
                    </Modal>
                    <img src={item.imageUrl} alt="" className="img-fluid" role="button" onClick={() => { item.show = true; this.setState({ slider: this.state.slider }) }} />
                </CarouselItem>
            );
        });

        return <div className="Dashboard container">
            <ShareModal title={Globals.getLang('Share link!')} subject={Globals.getLang('Check out this service!')} show={this.state.showShareModal} href={'https://' + document.location.host + '/r/' + (this.state.selectedLead ? this.state.selectedLead.ident : '')} onToggle={() => this.setState({ showShareModal: false, selectedLead: null })} />
            <Modal isOpen={this.state.showStartModal} toggle={() => { qreq.post('/api/content/sticky/set/referral-start'); this.setState({ showStartModal: false }); }}>
                <ModalHeader>
                    <L>Welcome to the Referral Portal</L><br />
                    <small><L>Here you can track your referral leads.</L></small>
                </ModalHeader>
                <ModalBody>
                    <div className="my-2 d-grid gap-2">
                        <Link to="/refer" className="btn btn-primary btn-lg" role="button"><Icon icon="faAsterisk" /> <L>Refer your Friend</L></Link>
                        <button type="button" className="btn btn-secondary btn-lg" onClick={() => { qreq.post('/api/content/sticky/set/referral-start'); this.setState({ showStartModal: false }); }}><L>Close and view Dashboard</L></button>
                    </div>
                </ModalBody>
            </Modal>
            <div className="row gx-2 gy-2">
                {this.state.refAccountInfo ?
                    <div className="col-md-12">
                        <Card title="Application Status">
                            <h2><L>Hello</L> {this.state.user.firstName}!</h2>
                            <p><L>Your application status is currently:</L> <strong className={this.getStatusColorClass(this.state.refAccountInfo.status)}>{this.state.refAccountInfo.status}</strong></p>
                            {this.state.refAccountInfo.status === 'Confirmed' ? <><p><L>It means your interest in the service is confirmed. This is the pre-signup phase and orientation.</L></p></> : ''}
                            {this.state.refAccountInfo.status === 'In Progress' ? <><p><L>You have already signed the agreement. The installation is pending or scheduled.</L></p></> : ''}
                            {this.state.refAccountInfo.status === 'Completed' ? <><p><L>Your installation is complete. Enjoy the new service!</L></p></> : ''}
                            {this.state.refAccountInfo.status === 'Declined' ? <><p><L>We are sorry. Your application did not go through. If you have any questions or inquiries please call us on the number below.</L></p></> : ''}
                            <p><L>You can always call us at: </L> <strong><a href={'tel:' + this.state.contactPhone}>{this.state.contactPhone}</a></strong></p>
                        </Card>
                    </div> : this.state.refAccountInfoLoaded ? <div className="col-md-12">
                        <Card title="Welcome">
                            <h2><L>Hello</L> {this.state.user.firstName}!</h2>
                            <p><L>Please utilize the tools below to refer people and win rewards.</L></p>
                        </Card>
                    </div> : ''}
                <div className="col-md-6">
                    <Card title="Referral Progress Chart">
                        {this.state.rewardsDataTotal === 0 ? <Alert><L>Once there is referral data a chart will appear here.</L> <Link to="/refer" role="button" className="btn btn-primary"><L>Refer a Friend Now</L></Link></Alert> :
                            <ResponsiveContainer width="100%" aspect="1">
                                <PieChart width={400} height={400}>
                                    <Pie data={this.state.rewardsData} dataKey="counter">
                                        {this.state.rewardsData.map((i, idx) =>
                                            <Cell key={idx} fill={i.color} />
                                        )}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>}
                    </Card>
                </div>
                <div className="col-md-6">
                    <Card title="Promotion">
                        <Carousel previous={previousButton} next={nextButton}
                            activeIndex={this.state.activeIndex} ride="carousel" interval="5000">
                            <CarouselIndicators items={this.state.slider}
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
                    </Card>
                </div>
            </div>
            <Card title="Leads">
                <div className="btn-group mb-2">
                    <Link to="/refer" role="button" className="btn btn-primary btn-lg"><Icon icon="faAsterisk" /> <L>Refer a Friend</L></Link>
                </div>
                <small className="d-block text-muted my-2"><L>For each referral that signs for our solar energy program you will be rewarded</L> {Globals.getFormatter().format(this.state.rewardAmount)}.</small>
                {!this.state.leadsLoaded ? <LoadingAlert /> : ''}
                <div className="row">
                {this.state.leads.map(i => <div key={i.id} className="col-md-6">
                    <div className="lead bg-light p-3 rounded mt-3">
                        <div className="row">
                            <h4>{i.fullName}</h4>
                            <div><L>Status:</L> <strong className={this.getStatusColorClass(i.status)}>{i.status}</strong></div>
                            <small><L>Reference:</L> #{i.id}<br /><L>Created Date:</L> {Globals.toLocaleDateString(i.createdDate)}</small>
                            {i.status === 'Created' ? <div><button type="button" className="btn btn-outline-primary btn-lg" onClick={() => this.setState({ selectedLead: i, showShareModal: true })}><L>Get registration link!</L></button></div> : ''}
                        </div>
                    </div>
                </div>)}
                </div>
            </Card>
        </div>;
    }
}

export default withParamsAndNavigate(Dashboard);