import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { Layout } from './components/Layout';
import BaseCom from './components/BaseCom';
import LoadingModal from './components/LoadingModal';
import 'react-toastify/dist/ReactToastify.css';
import './custom.css';
import './front.css';
import Globals from './shared/Globals';
import Auth from './shared/Auth';
import withLocation from './components/WithLocation';
import { qreq } from './shared/qrequest';
import ScrollToTop from './components/ScrollToTop';
import { PopModal } from './components/PopModal';

class App extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            currentLang: 'en',
            loaded: false
        };
        this.setLang = this.setLang.bind(this);
        Globals.setAppLang = this.setLang;
    }

    componentDidMount() {
        Globals.loadEnv(() => {
            Globals.loadLang(lang => this.setState({ currentLang: lang }));
            Auth.getLogin(u => {
                this.setState({ user: u });
                this.setState({ loaded: true });
            }, () => {
                this.setState({ loaded: true });
            });
        });
    }

    setLang(lang) {
        if (!lang) {
            if (this.state.currentLang === 'es')
                lang = 'en';
            else
                lang = 'es';
        }
        Globals.setLang(lang);
        qreq.post('/api/content/lang/set/' + lang, {}, j => { });
        this.setState({ currentLang: lang });
    }

    render() {
        if (!this.state.loaded)
            return <LoadingModal show />;

        var selectedRoute = AppRoutes.find(i => (i.path === this.props.location.pathname || (i.basePath && this.props.location.pathname.startsWith(i.basePath))));


        return (
            <Layout setLang={this.setLang} lang={this.state.currentLang} front={selectedRoute && selectedRoute.front} showMenu={this.props.location.pathname.startsWith('/manage')} home={this.props.location.pathname === '/'}>
                <ScrollToTop />
                <PopModal />
                <Routes>
                    {AppRoutes.map((route, index) => {
                        const { element, ...rest } = route;
                        return <Route key={index} {...rest} element={element} lang={this.state.currentLang} />;
                    })}
                </Routes>
            </Layout>
        );
    }
}

export default withLocation(App);