import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';
import Footer from './Footer';
import BaseCom from './BaseCom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export class Layout extends BaseCom {


    render() {
        return (
            <>
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
                    <NavMenu onLangChange={this.props.onLangChange} currentLang={this.props.currentLang} />
                    <div className="content-wrapper pb-5">
                    <div>
                        {this.props.children}
                    </div>
                </div>
                <Footer />
            </>
        );
    }
}
