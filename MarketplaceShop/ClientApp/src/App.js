import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { Layout } from './components/Layout';
import BaseCom from './components/BaseCom';
import LoadingModal from './components/LoadingModal';
import './custom.css';
import Globals from './shared/Globals';
import Auth from './shared/Auth';
import Vendor from './shared/Vendor';

export default class App extends BaseCom {

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
      Vendor.load(() => {
        Auth.getLogin(u => {
          this.setState({ user: u });
          this.setState({ loaded: true });
        }, () => {
          this.setState({ loaded: true });
        });
      });
    });
  }

  render() {
    if (!this.state.loaded)
      return <LoadingModal show />;
    return (
      <Layout>
        <Routes>
          {AppRoutes.map((route, index) => {
            const { element, ...rest } = route;
            return <Route key={index} {...rest} element={element} />;
          })}
        </Routes>
      </Layout>
    );
  }
}
