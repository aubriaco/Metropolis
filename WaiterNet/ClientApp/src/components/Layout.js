import React, { Component } from 'react';
import { NavMenu } from './NavMenu';
import Manage from './Manage';
import { ToastContainer } from 'react-toastify';
import Auth from '../shared/Auth';
import FrontLayout from './FrontLayout';

export class Layout extends Component {
    static displayName = Layout.name;

    constructor(props) {
        super(props);
        this.state = {
            user: {},
            showMobileSidebar: false
        };
        this.setShowMobileSidebar = this.setShowMobileSidebar.bind(this);
    }

    componentDidMount() {
        Auth.getLogin(u => {
            this.setState({ user: u });
        })
    }

    setShowMobileSidebar(b) {
        this.setState({ showMobileSidebar: b });
    }

    render() {

        if (this.props.front)
            return <FrontLayout setLang={this.props.setLang} home={this.props.home}>{this.props.children}</FrontLayout>

        return (
            <div className="wrapper" id="wrapper">
                <ToastContainer position="top-right"
                    autoClose={1000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light" />
                <NavMenu setLang={this.props.setLang} showMobileSidebar={this.state.showMobileSidebar} setShowMobileSidebar={this.setShowMobileSidebar} />
                <div className="page-wrapper" onClick={() => this.setShowMobileSidebar(false)}>
                    <div className="d-flex">
                        {this.props.showMenu ? <div className="d-none d-lg-block p-4 main-left-side">
                            <Manage />
                        </div> : ''}
                        <div className="d-block flex-fill p-2 main-side">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
