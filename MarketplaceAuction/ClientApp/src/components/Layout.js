import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';
import Footer from './Footer';
import DevModeModal from './DevModeModal';
import Globals from '../shared/Globals';

export class Layout extends Component {

    render() {
        return (
            <div>
                <DevModeModal />
                <NavMenu onLangChange={lang => this.props.onLangChange(lang)} />
                <div id="page-wrapper" className={'page-wrapper' + (Globals.mobileView ? ' native' : '')}>
                    <div className="page-content">
                        <Container>
                            {this.props.children}
                        </Container>
                    </div>
                </div>
                <Footer currentLang={this.props.currentLang} onLangChange={lang => this.props.onLangChange(lang)} />
            </div>
        );
    }
}
