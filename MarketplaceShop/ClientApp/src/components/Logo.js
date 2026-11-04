import BaseCom from "./BaseCom";
import './Logo.css';

export default class Logo extends BaseCom {
    render() {
        return <img src="/img/icon.png" alt="" className="img-fluid logo" />;
    }
}