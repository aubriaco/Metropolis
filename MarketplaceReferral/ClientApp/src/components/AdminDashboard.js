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
    CarouselIndicators
} from 'reactstrap';
import Alert from "./Alert";

class AdminDashboard extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            contactPhone: '(787) 602-6285',
            rewardAmount: 500,
            leads: [],
            rewardsData: [],
            refAccountInfo: null,
            refAccountInfoLoaded: false,
            activeIndex: 0
        }
        this.load = this.load.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            console.log(u);
            this.setState({ user: u });
            if (!u || !u.isRefAdmin)
                this.props.navigate('/');
            else
                this.load();
           
        });
    }

    load() {

        qreq.get('/api/referral/lead/admin/list', j => {
            if (j.list)
                this.setState({ leads: j.list, leadsLoaded: true });
        });

    }

    getStatusColorClass(status) {
        return status === 'Completed' ? 'text-success' : status === 'Created' ? 'text-muted' : status === 'Confirmed' ? 'text-info' : status === 'In Progress' ? 'text-primary' : status === 'Declined' ? 'Declined' : '';
    }

    render() {
        if (!this.state.user || !this.state.user.isRefAdmin)
            return <></>;

        return <div className="AdminDashboard container">
            <ShareModal title={Globals.getLang('Share link!')} subject={Globals.getLang('Check out this service!')} show={this.state.showShareModal} href={'https://' + document.location.host + '/r/' + (this.state.selectedLead ? this.state.selectedLead.ident : '')} onToggle={() => this.setState({ showShareModal: false, selectedLead: null })} />
            <Card title="All Leads">
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

export default withParamsAndNavigate(AdminDashboard);