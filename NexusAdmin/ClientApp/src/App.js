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
                <title>{Globals.appName}</title>
                <meta name="description" content={Globals.appName + ' administration panel.'} />
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
