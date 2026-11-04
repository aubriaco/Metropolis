import BaseCom from "./BaseCom";
import './Logo.css';

export default class Logo extends BaseCom {
    render() {
        return <span>LOGO</span>;
        //return <img src={'/img/' + (this.props.inverse ? 'logo-i.png' : 'logo.png')} alt="" className="img-fluid logo" />;
    }
}