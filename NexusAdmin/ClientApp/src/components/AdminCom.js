import Auth from "../shared/Auth";
import { qreq } from "../shared/qrequest";
import BaseCom from "./BaseCom";


export default class AdminCom extends BaseCom {

    constructor(props) {
        super(props);
        this.initCheck = this.initCheck.bind(this);
    }

    initCheck() {
        Auth.getLogin(u => {
            this.setState({ user: u });
            if (!u) {
                this.alert('Not logged in.');
                document.location.replace('/');
            }
            else {
                qreq.get('/api/nexus/access', j => {
                    if (j.errorCode !== 0) {
                        this.alert('No access to your user.');
                        document.location.replace('/logout');
                    }
                    else
                        this.setState({ admin: true });
                });
            }
        });
    }
}