import { Collapse, NavItem, NavLink, Navbar, NavbarBrand, NavbarToggler } from "reactstrap";
import BaseCom from "./BaseCom";
import Logo from "./Logo";
import { NavLink as DomNavLink, Link } from 'react-router-dom';
import L from "./Lang";
import withLocation from "./WithLocation";
import Globals from "../shared/Globals";

class FrontLayout extends BaseCom {

    constructor(props) {
        super(props);
        this.toggleNavbar = this.toggleNavbar.bind(this);
    }

    componentDidMount() {
        this.scrollEvent = () => {
            if (this.props.location.pathname === '/' && window.scrollY < 25)
                this.setState({ top: true });
            else
                this.setState({ top: false });
        };
        window.addEventListener('scroll', this.scrollEvent);
        this.scrollEvent();
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.pathname !== prevProps.location.pathname && this.scrollEvent)
            this.scrollEvent();
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.scrollEvent);
    }

    toggleNavbar() {
        var b = !this.state.collapsed;
        this.setState({ collapsed: b });
    }

    render() {
        return <div className="wrapper front" id="wrapper">
            <header className={'front' + (this.state.top && this.props.home ? ' top' : '')}>
                <div className="header-top p-2">
                    <div className="container">
                        <div className="d-flex justify-content-end">
                            <div className="mx-4">
                                <button type="button" className="btn btn-light btn-sm me-2 text-uppercase" onClick={() => Globals.setAppLang()}>{Globals.currentLang}</button>
                                <Link to="/contact" role="button" className="btn btn-light btn-sm"><L>Help and Support</L></Link>
                            </div>
                            <div className="mx-2"><a href="https://www.facebook.com/waitrnet" target="_blank" rel="noreferrer"><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path fill="#ffffff" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" /></svg></a></div>
                            <div className="mx-2"><a href="" target="_blank" rel="noreferrer"><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path fill="#ffffff" d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" /></svg></a></div>
                            <div className="mx-2"><a href="" target="_blank" rel="noreferrer"><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path fill="#ffffff" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" /></svg></a></div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <Navbar className="navbar-expand-sm navbar-toggleable-sm mb-3" light>
                        <NavbarBrand><Logo white /></NavbarBrand>
                        <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                        <Collapse className="d-sm-inline-flex" isOpen={this.state.collapsed} navbar>
                            <ul className="navbar-nav d-flex justify-content-end w-100">
                                <NavItem>
                                    <NavLink to="/" tag={DomNavLink}><L>The Solution</L></NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink to="/pricing" tag={DomNavLink}><L>Pricing</L></NavLink>
                                </NavItem>
                                <NavItem className="divider" />
                                <NavItem>
                                    <NavLink to="/login" tag={DomNavLink}><L>Login</L></NavLink>
                                </NavItem>
                                <NavItem className="highlight">
                                    <NavLink to="/signup" tag={DomNavLink}><L>Sign up your business</L></NavLink>
                                </NavItem>
                            </ul>
                        </Collapse>
                    </Navbar>
                </div>
            </header>
            <div className="page-wrapper">
                {this.props.children}
            </div>
            <footer>
                <div className="container pb-5">
                    <div className="row">
                        <div className="col-md-6 px-4 mt-5">
                            <h5>QR Code Ordering</h5>
                            <ul>
                                <li><Link to="/"><L>The Solution</L></Link></li>
                                <li><Link to="/pricing"><L>Pricing</L></Link></li>
                            </ul>
                        </div>
                        <div className="col-md-6 px-4 mt-5">
                            <h5>About Us</h5>
                            <ul>
                                <li><Link to="/about"><L>Company</L></Link></li>
                                <li><Link to="/contact"><L>Contact Us</L></Link></li>
                            </ul>
                        </div>
                        <div className="col-md-3 px-4 mt-5">
                            <div className="d-none">
                                <h5>Marketing and Sales</h5>
                                <ul>
                                    <li><Link to="/solution"><L>Videos</L></Link></li>
                                    <li><Link to="/solution"><L>Blog</L></Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-md-3 px-4 mt-5">
                            <div className="d-none">
                                <h5>Partners &amp; Support</h5>
                                <ul>
                                    <li><Link to="/solution"><L>Clover Integration</L></Link></li>
                                    <li><Link to="/solution"><L>FAQ</L></Link></li>
                                    <li><Link to="/solution"><L>Help &amp; Support</L></Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 text-center text-light">
                        Copyright &copy; <a href="https://www.solusek.com" target="_blank" rel="noreferrer">Solusek Systems</a>
                        <span> - <L>All Rights Reserved</L></span>
                        <span> - <Link to="/eula"><L>End User License Agreement</L></Link></span>
                        <span> - <Link to="/privacy-policy"><L>Privacy Policy</L></Link></span>
                    </div>
                </div>
            </footer>
        </div>;
    }
}

export default withLocation(FrontLayout);