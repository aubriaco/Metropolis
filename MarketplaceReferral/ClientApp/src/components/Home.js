import React from 'react';
import BaseCom from './BaseCom';
import L from './Lang';
import { Link } from 'react-router-dom';
import Card from './Card';
import Icon from './Icon';
import Auth from '../shared/Auth';
import { withParamsAndNavigate } from './WithParamsAndNavigate';
import LoadingAlert from './LoadingAlert';

class Home extends BaseCom {

    componentDidMount() {
        Auth.getLogin(u => {
            this.setState({ user: u, loaded: true });
            //if(!u)
            //    this.props.navigate('/program/solar'); //temp
        });
    }

    render() {
        if (!this.state.loaded)
            return <LoadingAlert />;
        return (
            <div className="Home container">
                <h1 className="text-center"><L>Check some of our referral programs to begin!</L></h1>
                <Card>
                    <div className="row">
                        <div className="col-md-12">
                            <Link to="/program/home-power">
                                <img src="/img/ref-program/home-power-header.png" alt="" className="img-fluid d-block mb-2" style={{width: '100%'}} />
                                <div className="btn btn-primary btn-lg text-center w-100 box-shadow">
                                    <Icon icon="faBullhorn" /> <L>Check out this program!</L>
                                </div>
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }
}

export default withParamsAndNavigate(Home);