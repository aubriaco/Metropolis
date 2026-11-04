import React from 'react';
import BaseCom from './BaseCom';
import L from './Lang';
import './Home.css';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import FormInput from './FormInput';
import { withParamsAndNavigate } from './WithParamsAndNavigate';
import InitSignUp from './InitSignUp';

class Home extends BaseCom {

    constructor(props) {
        super(props)
        this.state = {
            regInfo: {}
        };
        this.register = this.register.bind(this);
    }

    register(e) {
        if (e) e.preventDefault();
        this.props.navigate('/signup/' + encodeURIComponent(btoa(JSON.stringify(this.state.regInfo))));
    }

    render() {
        return (
            <div className="Home">
                <div className="header text-light" style={{ backgroundImage: 'url(\'/img/home/home-header.jpg\')' }}>
                    <div className="container text-center">
                        <div className="faded-dark-bg p-3">
                            <h1><L>Digital Restaurant Ordering Platform</L></h1>
                            <p className="lead"><L>Satisfy Your Hungry Customers Today with Our Restaurant Online Ordering Solution</L></p>
                        </div>
                        <div className="mt-5">
                            <Link to="/pricing" role="button" className="btn btn-lg btn-ghost px-5 py-2 fs-5 text-light">
                                <Icon icon="faPlay" /> <L>How it works</L>
                            </Link>
                        </div>
                    </div>
                </div>
                <section className="up-register">
                    <div className="container pt-4 pb-1">
                        <form onSubmit={this.register}>
                            <div className="row justify-content-center">
                                <div className="col-md-6">
                                    <FormInput model={this.state.regInfo} name="vendorName" label="Your Restaurant Name" labelAsPlaceholder required className="box-shadow" postAddon=<button type="submit" className="btn btn-primary btn-lg"><L>REGISTER</L></button> />
                                </div>
                            </div>
                        </form>
                    </div>
                </section>
                <section className="about">
                    <div className="container p-5">
                        <div className="row row-cols-1 row-cols-md-2">
                            <div className="col mt-5">
                                <img src="/img/home/about.png" alt="" className="img-fluid d-block mx-auto rounded" />
                            </div>
                            <div className="col mt-5 px-5">
                                <small className="d-block heavy mb-4"><L>Accelerate the order process</L></small>
                                <h2 className="text-secondary"><L>Enhance the dine-in ordering experience by utilizing conspicuous QR codes tailored for your restaurant.</L></h2>
                                <p><L>The harder it is for your hungry customers to get their order taken, the more customers you will lose.</L></p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="about">
                    <div className="container">
                        <div className="row row-cols-1 row-cols-md-2 flex-row-reverse">
                            <div className="col mt-5">
                                <img src="/img/home/bar-qrcode.png" alt="" className="img-fluid d-block mx-auto rounded" />
                            </div>
                            <div className="col mt-5 px-5">
                                <small className="d-block heavy mb-4"><L>Accelerate your success</L></small>
                                <h2 className="text-secondary"><L>No time to waste: Take your first digital order within minutes.</L></h2>
                                <p><L>Once you sign up and import your menu. All you have to do is print QR codes and place them on tables or walls.</L></p>
                                <p className="fw-bolder"><L>You can have your clients pay online and have it deposited directly into your business bank account.</L></p>
                                <p className="d-none"><L>We support integration with</L> <a href="https://www.clover.com" target="_blank" rel="noreferrer"><strong>Clover</strong></a> <L>devices for inventory and ordering.</L></p>
                                <div className="mt-2 py-5 text-center d-none"><img src="/img/external/clover-integration.png" alt="" className="img-fluid w-50" /></div>
                            </div>
                        </div>
                    </div>
                </section>
                <InitSignUp />
            </div>
        );
    }
}

export default withParamsAndNavigate(Home);