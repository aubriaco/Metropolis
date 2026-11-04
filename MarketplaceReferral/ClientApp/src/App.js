import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { Layout } from './components/Layout';
import BaseCom from './components/BaseCom';
import LoadingModal from './components/LoadingModal';
import './custom.css';
import Globals from './shared/Globals';
import Auth from './shared/Auth';

export default class App extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            currentLang: 'en',
            loaded: false
        }
        this.onLangChange = this.onLangChange.bind(this);
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

    onLangChange(lang) {
        Globals.setLang(lang);
        this.setState({ currentLang: lang });
    }

    render() {
        if (!this.state.loaded)
            return <LoadingModal show />;
        return (
            <Layout onLangChange={this.onLangChange} currentLang={this.state.currentLang}>
                <Routes>
                    {AppRoutes.map((route, index) => {
                        const { element, ...rest } = route;
                        return <Route key={index} {...rest} element={element} currentLang={this.state.currentLang} />;
                    })}
                </Routes>
            </Layout>
        );
    }
}
