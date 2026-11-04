import BaseCom from "./BaseCom";
import './Logo.css';

export default class Logo extends BaseCom {
    render() {
        return <img src={this.props.white ? '/img/logo-white.png' : '/img/logo.png'} alt="" className={'img-fluid logo' + (this.props.className ? ' ' + this.props.className : '')} />;
    }
}