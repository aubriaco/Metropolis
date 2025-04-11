import BaseCom from "./BaseCom";
import L from "./Lang";
import Logo from "./Logo";
import { Link } from "react-router-dom";
import './Footer.css';
import Auth from "../shared/Auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import { qreq } from "../shared/qrequest";
import Globals from "../shared/Globals";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

export default class Footer extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            currentLang: Globals.currentLang ?? 'en',
        };
        this.closeFloaty = this.closeFloaty.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(j => {
            this.setState({ user: j });
        });
        qreq.get('/api/content/sticky/get/floaty-sell', j => {
            if (!j.item)
                this.setState({ showFloaty: true });
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.currentLang !== Globals.currentLang)
            this.setState({ currentLang: Globals.currentLang });
    }

    closeFloaty() {
        qreq.post('/api/content/sticky/set/floaty-sell');
        this.setState({ showFloaty: false });
    }

    setLang(lang) {
        Globals.setLang(lang);
        this.setState({ currentLang: lang, langDropdownOpen: false });
        this.props.onLangChange(lang);
    }

    render() {
        return <footer className="mb-auto">
            <div className="container">
                <div className="row">
                    <div className="col-md-4">
                        {Globals.mobileView ? <div className="mb-3"><Dropdown tag="div" isOpen={this.state.langDropdownOpen} toggle={() => this.setState({ langDropdownOpen: !this.state.langDropdownOpen })} direction="down">
                            <DropdownToggle title="Language" tag="button" data-toggle="dropdown" className="pointer btn btn-secondary btn-lg" style={{ textDecoration: 'none' }}><img src={'/img/lang/' + this.state.currentLang + '.png'} alt="" className="lang-img" /> {this.state.currentLang.toUpperCase()}</DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem className={this.state.currentLang === 'en' ? 'active' : ''} onClick={() => this.setLang('en')}>English</DropdownItem>
                                <DropdownItem className={this.state.currentLang === 'es' ? 'active' : ''} onClick={() => this.setLang('es')}>Espa&ntilde;ol</DropdownItem>
                            </DropdownMenu>
                        </Dropdown></div> : ''}
                        <Logo />
                    </div>
                    <div className="col-md-4">
                        <h6 className="text-muted"><L>How it works?</L></h6>
                        <ul className="navbar-nav">
                            <li className="navbar-item"><Link to="/about/us"><L>About Us</L></Link></li>
                            <li className="navbar-item"><Link to="/about/buy"><L>Buying</L></Link></li>
                            <li className="navbar-item"><Link to="/sell"><L>Selling</L></Link></li>
                        </ul>
                    </div>
                    <div className="col-md-4">
                        <h6 className="text-muted"><L>Helpful Links</L></h6>
                        <ul className="navbar-nav">
                            <li className="navbar-item"><Link to="/sell"><L>Submit your car</L></Link></li>
                            {this.state.user ? <>
                                <li className="navbar-item"><Link to="/my/profile"><L>My Account</L></Link></li>
                                <li className="navbar-item"><Link to="/my/listings"><L>My Listings</L></Link></li>
                            </> : <li className="navbar-item"><Link to="/home/login"><L>Login</L></Link></li>}
                        </ul>
                    </div>
                    <div className="col-md-12 mt-4">
                        <div className="copyright"><span className="text-nowrap"><L>Copyright</L> &copy; {new Date().getFullYear()} Metropolis Market LLC</span><br /><span className="text-nowrap"><L>Powered by:</L> <a href="https://www.solusek.com/" target="_blank" rel="noreferrer">Solusek Systems</a></span><br /><L>All rights reserved.</L></div>
                        <div className="mt-2 text-center"><Link to="/tos"><L>Terms and Conditions</L></Link> | <Link to="/privacy-policy"><L>Privacy Policy</L></Link></div>
                    </div>
                </div>
            </div>
            {false && this.state.showFloaty && !this.state.user ?
                <section className="bg-warning p-3 text-center position-fixed bottom-0 start-0 w-100 fs-4">
                    <div className="float-end">
                        <FontAwesomeIcon icon={fa.faTimes} role="button" onClick={this.closeFloaty} />
                    </div>
                    <span>
                        <L>Sell with us - It's free</L> <Link to="/sell" onClick={this.closeFloaty}>Begin now!</Link>
                    </span>
                </section> : ''}
        </footer>;
    }
}