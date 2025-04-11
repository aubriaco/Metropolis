import { Modal, ModalBody } from 'reactstrap';
import BaseCom from "./BaseCom";
import L from './Lang';
import { qreq } from '../shared/qrequest';
import Alert from './Alert';
import TOSSellers from './TOSSellers';
import TOSBuyers from './TOSBuyers';
import Globals from '../shared/Globals';

export default class TOSModal extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            show: this.props.show
        };
        this.agree = this.agree.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show)
            this.setState({ info: {} });
    }

    agree() {
        this.setState({ submitting: true });
        qreq.post('/api/user/agreement/agree', { documentName: this.props.type }, j => {
            if (j.errorCode === 0)
                this.props.onSuccess();
            else
                this.showError(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.showError('An unknown error ocurred. Please try again.');
            this.setState({ submitting: false });
        });
    }

    render() {
        return <><Modal isOpen={this.props.show} toggle={() => { if (this.props.onToggle) this.props.onToggle(); }} size="lg">
            <ModalBody>
                <div className="p-5">
                    <div className="text-center">
                        <h1><L>Terms and Coniditions</L></h1>
                        <hr />
                    </div>
                    <div className="mt-2">
                        <div className="tos" style={{ height: '60vh', overflowY: 'auto' }}>
                            {this.props.type === 'TOSSellers' ? <TOSSellers lang={Globals.currentLang} /> : <TOSBuyers lang={Globals.currentLang} />}
                        </div>
                    </div>
                    <div className="mt-2 text-center"><L>You must agree to the terms above to be able to continue.</L></div>
                    <div className="mt-2 text-center">
                        <button type="button" className="btn btn-success btn-lg" onClick={() => this.agree()} disabled={this.state.submitting}>Agree</button>
                        <button type="button" className="btn btn-secondary btn-lg ms-2" onClick={() => { if (this.props.onToggle) this.props.onToggle(); }} disabled={this.state.submitting}>Cancel</button>
                    </div>
                    {this.state.error ? <Alert message={this.state.error} type="danger" className="mt-2" /> : ''}
                </div>
            </ModalBody>
        </Modal></>;
    }
}