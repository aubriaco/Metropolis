/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { localgetraw, qreq } from "../shared/qrequest";
import Address from "./Address";
import BaseCom from "./BaseCom";
import Card from "./Card";
import FormInput from "./FormInput";
import SubHeader from "./SubHeader";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getCurrentLangItem, getLang, getLanguages } from "../shared/GLang";
import L from "./Lang";
import Auth from "../shared/Auth";
import Globals from "../shared/Globals";

class MyStoresNew extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: {
                address: {
                    country: 'USA',
                    state: 'PR'
                }
            },
            step: 0,
            taxTypes: [
                { id: 'CORP', name: 'Corporation or LLC' },
                { id: 'SOLE-PROP', name: 'Sole Proprietorship' }
            ]
        };
        this.submit = this.submit.bind(this);
        this.finalize = this.finalize.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.step !== this.state.step) {
            if (this.state.step === 3) {
                this.setState({ tosLoaded: false });
            }
            else if (this.state.step === 4) {
                this.setState({ aupLoaded: false });
            }
            window.scrollTo(0, 0);
        }
    }

    submit(e) {
        if (e) e.preventDefault();
        this.setState({ submitting: true });
        if (this.state.step === 0) {
            qreq.post('/api/vendor/new', { ...this.state.info }, j => {
                if (j.errorCode === 0)
                    this.setState({ step: this.state.step + 1 });
                else
                    toast.error(j.errorMessage);
                this.setState({ submitting: false });
            }, () => {
                toast.error('Unknown error ocurred. Please try again.');
                this.setState({ submitting: false });
            });
        }
        else if (this.state.step === 1) {
            qreq.post('/api/vendor/address', { ...this.state.info.address }, j => {
                if (j.errorCode === 0)
                    this.setState({ step: this.state.step + 1 });
                else
                    toast.error(j.errorMessage);
                this.setState({ submitting: false });
            }, () => {
                toast.error('Unknown error ocurred. Please try again.');
                this.setState({ submitting: false });
            });
        }
        else if (this.state.step === 2) {
            qreq.post('/api/vendor/biz', { ...this.state.info }, j => {
                if (j.errorCode === 0)
                    this.setState({ step: this.state.step + 1, tosLoaded: false });
                else
                    toast.error(j.errorMessage);
                this.setState({ submitting: false });
            }, () => {
                toast.error('Unknown error ocurred. Please try again.');
                this.setState({ submitting: false });
            });
        }
        else if (this.state.step === 3) {
            this.setState({ step: this.state.step + 1, submitting: false, aupLoaded: false });

        }
        else if (this.state.step === 4) {
            qreq.post('/api/vendor/terms', { ...this.state.info, isAgreeTerms: true }, j => {
                if (j.errorCode === 0) {
                    this.finalize();
                }
                else {
                    toast.error(j.errorMessage);
                    this.setState({ submitting: false });
                }
            }, () => {
                toast.error('Unknown error ocurred. Please try again.');
                this.setState({ submitting: false });
            });
        }
    }

    finalize() {
        qreq.post('/api/vendor/submit', { ...this.state.info }, j => {
            if (j.errorCode === 0) {
                Auth.getLogin(null, null, true);
                this.props.navigate('/my/stores/manage/' + j.item.masterID);
            }
            else
                toast.error(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            toast.error('Unknown error ocurred. Please try again.');
            this.setState({ submitting: false });
        });
    }

    render() {
        return <div className="page-wrapper">
            <div className="page-content">
                <SubHeader title="New Store" path={[['/my', 'My Account'], ['/my/stores', 'My Stores']]} />

                <div className="MyStoresNew container">
                    <form onSubmit={this.submit}>
                        <div className="row justify-content-center">
                            <div className="col-md-6">
                                {this.state.step === 4 ? <>
                                    <Card title="Acceptable Use Policy">


                                        <iframe src="https://app.termly.io/document/acceptable-use/d72122fa-1e35-4c88-b3f1-817c3e2510b7" width="100%" height="500" onLoad={() => this.setState({ aupLoaded: true })} />

                                        <div className="mt-3 d-grid gap-2">
                                            <button type="submit" className="btn btn-lg btn-success" disabled={this.state.submitting || this.state.loadingPaymentTerms}><L>Accept and Submit</L></button>
                                            <button type="button" className="btn btn-lg" onClick={() => this.setState({ step: this.state.step - 1 })} disabled={!this.state.aupLoaded}><L>Go Back a Step</L></button>
                                        </div>

                                    </Card>
                                </> :
                                    this.state.step === 3 ? <>
                                        <Card title="Terms of Service">
                                            <iframe src="https://app.termly.io/document/acceptable-use/87594c28-a654-4730-9a04-388dfb07e947" width="100%" height="500" onLoad={() => this.setState({ tosLoaded: true })} />

                                            <div className="mt-3 d-grid gap-2">
                                                <button type="submit" className="btn btn-lg btn-success" disabled={this.state.submitting}><L>Accept and Submit</L></button>
                                                <button type="button" className="btn btn-lg" onClick={() => this.setState({ step: this.state.step - 1 })} disabled={!this.state.tosLoaded}><L>Go Back a Step</L></button>
                                            </div>

                                        </Card>

                                    </>

                                        :


                                        this.state.step === 2 ? <>
                                            <Card title="Tax Information">
                                                <FormInput model={this.state.info} name="taxType" label="Type of Business" type="select" selectLabel="Select One" options={this.state.taxTypes} />
                                                <FormInput model={this.state.info} name="taxID" label="Tax ID" type="text" placeholder="123-12-1234" />
                                                <div className="d-grid gap-2">
                                                    <button type="submit" className="btn btn-lg btn-success" disabled={this.state.submitting}><L>Continue</L></button>
                                                    <button type="button" className="btn btn-lg" onClick={() => this.setState({ step: this.state.step - 1 })} disabled={this.state.submitting}><L>Go Back a Step</L></button>
                                                </div>
                                            </Card>
                                        </> :

                                            this.state.step === 1 ? <>
                                                <Address title="Business Address" item={this.state.info.address}>
                                                    <div className="d-grid gap-2">
                                                        <button type="submit" className="btn btn-lg btn-success" disabled={this.state.submitting}><L>Continue</L></button>
                                                        <button type="button" className="btn btn-lg" onClick={() => this.setState({ step: this.state.step - 1 })} disabled={this.state.submitting}><L>Go Back a Step</L></button>
                                                    </div>
                                                </Address>
                                            </> :
                                                <Card title="Business">
                                                    <FormInput model={this.state.info} name="name" label="Store Name" type="text" placeholder="My Store" />
                                                    <div className="d-grid gap-2">
                                                        <button type="submit" className="btn btn-lg btn-success" disabled={this.state.submitting}><L>Continue</L></button>
                                                    </div>
                                                </Card>}
                            </div>
                        </div>
                    </form>
                    <div className="text-center mb-5">
                        <Link to="/my/stores"><L>Back to My Stores</L></Link>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default withParamsAndNavigate(MyStoresNew);