import Globals from "../shared/Globals";
import BaseCom from "./BaseCom";
import L from "./Lang";
import TOSBuyers from "./TOSBuyers";
import TOSSellers from "./TOSSellers";


export default class TOS extends BaseCom {
    render() {
        return <div className="container-narrow">
            <h1 className="text-center mb-5"><L>Terms and Conditions</L></h1>
            <div className="mb-5">
                <TOSBuyers lang={Globals.currentLang} />
            </div>
            <div className="mb-5">
                <TOSSellers lang={Globals.currentLang} />
            </div>
        </div>
    }
}