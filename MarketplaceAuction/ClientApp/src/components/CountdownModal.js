import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import BaseCom from "./BaseCom";
import L from './Lang';
import { qreq } from '../shared/qrequest';
import Globals from '../shared/Globals';
import Logo from './Logo';
import './CountdownModal.css';

export default class CountdownModal extends BaseCom {

    constructor(props) {
        super(props);
        this.releaseDate = new Date(Date.parse('2023-07-21 12:00:00'));
        this.state = {
            show: false,
            delta: this.releaseDate.getTime() - new Date().getTime()
        };
        this.toggle = this.toggle.bind(this);
        this.tick = this.tick.bind(this);
        this.getCountdown = this.getCountdown.bind(this);
    }

    componentDidMount() {
        qreq.get('/api/content/sticky/get/modal-countdown', j => {
            if (!j.item) {
                if (this.releaseDate > new Date()) {
                    this.setState({ show: true });
                    this.interval = setInterval(() => this.tick(), 1000);
                }
            }
        });
    }

    componentWillUnmount() {
        if (this.interval)
            clearInterval(this.interval);
    }

    toggle(clicked) {
        this.setState({ show: false });
        if(this.interval)
            clearInterval(this.interval);
        qreq.post('/api/content/sticky/set/modal-countdown');
        if (this.props.onToggle)
            this.props.onToggle();
        if (clicked && this.props.onContinue)
            this.props.onContinue();
    }

    tick() {
        this.setState({ delta: this.releaseDate.getTime() - new Date().getTime() });
    }

    getCountdown(t) {
        var dt = new Date(this.state.delta);
        var d = Number(dt.getDate());
        var h = Number(dt.getHours());
        var m = Number(dt.getMinutes());
        var s = Number(dt.getSeconds());
        var str = '';
        if (d > 0) str += String(d) + ' ' + Globals.getLang('days') + ' ';
        if (h > 0) str += String(h) + ' ' + Globals.getLang('hours') + ' ';
        if (m > 0) str += String(m) + ' ' + Globals.getLang('minutes') + ' ';
        if (s > 0) str += String(s) + ' ' + Globals.getLang('seconds') + ' ';
        return str;
    }

    render() {
        return <><Modal isOpen={this.state.show} toggle={() => this.toggle()} size="lg" className="CountdownModal">
            <ModalHeader>
                <Logo className="d-block mx-auto" />
            </ModalHeader>
            <ModalBody>
                <div className="text-center">
                    <h2 className="fs-1 text-primary mb-4 text-uppercase fw-light"><L>Auctions go live in</L></h2>
                    <div className="c-countdown fs-2 mt-2 mb-2">
                        <span className="bg-secondary text-light rounded-4 p-2 p-md-3">{this.getCountdown()}</span>
                    </div>
                    <div className="fs-5 p-3"><div className="fs-4"><L>The countdown has begun!</L></div><div className="mt-3 fw-light"><L>Our live auctions will be available soon. Secure your spot as a seller and register now to seize this exciting opportunity to reach an enthusiastic audience.</L></div><div className="mt-3 fw-light"><L>Don't miss out, start selling your products in our live auctions today!</L></div></div>
                    <div className="mt-2 mb-2">
                        <button type="button" className="btn btn-primary btn-lg box-shadow-down p-3" onClick={() => this.toggle(true)}><L>Sell now for free!</L></button>
                    </div>
                    <p className="text-muted"><L>Register quickly and start selling in no time!</L></p>
                </div>
            </ModalBody>
        </Modal></>;
    }
}