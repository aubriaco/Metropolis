import React, { Component } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { Layout } from './components/Layout';
import './shared/Globals';
import './custom.css';
import Globals from './shared/Globals';
import Auth from './shared/Auth';
import LoadingModal from './components/LoadingModal';
import { Helmet } from 'react-helmet';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentLang: 'en',
            loaded: false
        }
    }

    componentDidMount() {
        Globals.loadEnv(() => {
            Globals.loadLang(lang => this.setState({ currentLang: lang }));
            Auth.getLogin(u => {
                this.setState({ user: u });
                this.setState({ loaded: true });
            });
        });
    }



    render() {
        if (!this.state.loaded)
            return <LoadingModal show />;
        return (<>
            <Helmet>
                <title>{Globals.appName + ' | ' + Globals.getLang('Unleash Your Speed. Connect. Compete. Conquer!')}</title>
                <meta name="description" content={Globals.getLang('Discover the thrilling world of car racing and connect with fellow enthusiasts on our premier social network. Join a community of speed enthusiasts, share your passion for high-octane action, and engage in adrenaline-pumping competitions. Stay up-to-date with the latest news, events, and trends in the racing world. Fuel your racing dreams, build lasting connections, and ignite your competitive spirit. Unleash your inner racer and embark on an exhilarating journey with our vibrant car racing social network.')} />
                <meta property="og:title" content={Globals.appName + ' | ' + Globals.getLang('Unleash Your Speed. Connect. Compete. Conquer!')} />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://www.pistacalle.com/img/og-image.png" />
                <meta property="og:description" content={Globals.getLang('Discover the thrilling world of car racing and connect with fellow enthusiasts on our premier social network. Join a community of speed enthusiasts, share your passion for high-octane action, and engage in adrenaline-pumping competitions. Stay up-to-date with the latest news, events, and trends in the racing world. Fuel your racing dreams, build lasting connections, and ignite your competitive spirit. Unleash your inner racer and embark on an exhilarating journey with our vibrant car racing social network.')} />
            </Helmet>
            <Layout onLangChange={lang => this.setState({ currentLang: lang })}>
                <LoadingModal show={!this.state.loaded} />
                <Routes>
                    {AppRoutes.map((route, index) => {
                        const { element, ...rest } = route;
                        return <Route key={index} {...rest} element={<element.type {...element.props} currentLang={this.state.currentLang} />} />;
                    })}
                </Routes>
            </Layout>
        </>
        );
    }
}
