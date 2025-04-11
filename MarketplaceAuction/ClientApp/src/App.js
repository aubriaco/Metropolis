import React, { Component } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { Layout } from './components/Layout';
import './custom.css';
import { qreq } from './shared/qrequest';
import Auth from './shared/Auth';
import Globals from './shared/Globals';
import { Helmet } from "react-helmet";
import ScrollToTop from './components/ScrollToTop';
import { Capacitor } from '@capacitor/core';

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentLang: 'en',
            loaded: false
        }
        console.log('App');
    }

    componentDidMount() {
        if (Capacitor.isNativePlatform()) {
            Globals.mobileView = true;
            Globals.loadNative(() => {
                Globals.loadLang(lang => this.setState({ currentLang: lang }));
                Auth.getLogin(u => {
                    this.setState({ user: u });
                });
                this.setState({ loaded: true });
            });
        }
        else {
            Globals.loadEnv(() => {
                Globals.loadLang(lang => this.setState({ currentLang: lang }));
                Auth.getLogin(u => {
                    this.setState({ user: u });
                });
                this.setState({ loaded: true });
            });
        }
    }

    render() {
        if (!this.state.loaded)
            return <></>;
        return <>
            <Helmet>
                <title>{'Bidea Online | ' + Globals.getLang('Powering Buyers and Sellers Together')}</title>
                <meta name="description" value={Globals.getLang('Discover Bidea Online, the ultimate auction platform that brings together buyers and sellers. Bid, buy, and sell with ease. Join now and experience the thrill of auctions.')} />
                <meta property="og:title" content={'Bidea Online | ' + Globals.getLang('Powering Buyers and Sellers Together')} />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://www.bideaonline.com/img/og-image.png" />
                <meta property="og:description" content="Descubre Bidea Online, la plataforma de subastas que re�ne a compradores y vendedores. Bidea, compra y vende con facilidad. �nase ahora y experimente la emoci�n de las subastas." />
            </Helmet>
            <ScrollToTop />
            <Layout onLangChange={lang => this.setState({ currentLang: lang })}>
                <Routes>
                    {AppRoutes.map((route, index) => {
                        const { element, ...rest } = route;
                        return <Route key={index} {...rest} element={<element.type {...element.props} currentLang={this.state.currentLang} />} />;
                    })}
                </Routes>
            </Layout>
        </>;
    }
}
