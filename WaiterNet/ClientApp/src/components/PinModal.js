import { Modal, ModalBody, ModalHeader } from "reactstrap";
import BaseCom from "./BaseCom";
import FormInput from "./FormInput";
import { qreq } from "../shared/qrequest";
import Globals from "../shared/Globals";
import Alert from "./Alert";
import { Link } from "react-router-dom";

class PinModal extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: {},
            show: this.props.show
        };
        this.submit = this.submit.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.show !== this.props.show)
            this.setState({ show: this.props.show });
    }

    submit(e) {
        if (e) e.preventDefault();
        if(!this.state.info.pin || this.state.info.pin.length < 4) {
            this.showError(Globals.getLang('Pin must be at least 4 digits long.'));
            return;
        }
        if(this.props.lock) {
            this.setState({ submitting: true });
            qreq.post('/api/auth/mode/view', {...this.state.info}, j => {
                if(j.errorCode === 0)
                    window.location.reload();
                else
                    this.showError(j.errorMessage);
                this.setState({ submitting: false });
            }, () => {
                this.showError('Unknown error ocurred. Please try again.');
                this.setState({ submitting: false });
            });
        }
        else {
            this.setState({ submitting: true });
            qreq.post('/api/auth/mode/reset', {...this.state.info}, j => {
                if(j.errorCode === 0)
                    window.location.reload();
                else
                    this.showError(j.errorMessage);
                this.setState({ submitting: false });
            }, () => {
                this.showError('Unknown error ocurred. Please try again.');
                this.setState({ submitting: false });
            });
        }
    }

    render() {
        return <Modal isOpen={this.state.show} toggle={() => { this.setState({ show: false }); if (this.props.onToggle) this.props.onToggle(); }} size="sm" >
            <ModalHeader>
                PIN
            </ModalHeader>
            <ModalBody>
                <form onSubmit={this.submit}>
                    <FormInput model={this.state.info} name="pin" label="Enter a pin to lock into view mode" type="password" placeholder="0000" inputClassName="text-center" required onChange={v => {
                        if (v && v.replace) {
                            v = v.replace(/[^0-9]/g, '');
                            this.setState({ info: { ...this.state.info, pin: v } });
                        }
                    }} />
                    <div className="mt-2 d-grid gap-2">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={this.state.submitting}>Submit</button>
                        <button type="button" className="btn btn-secondary btn-lg" disabled={this.state.submitting} onClick={() => { this.setState({ show: false }); if (this.props.onToggle) this.props.onToggle(); }}>Cancel</button>
                    </div>
                    {!this.props.lock ? <small className="d-block text-muted my-2">If you do not remember the PIN you set up. You can <Link to="/logout">logout</Link> and re-login with your credentials.</small> : ''}
                    {this.state.error ? <Alert type="danger my-2">{this.state.error}</Alert> : ''}
                </form>
            </ModalBody>
        </Modal>;
    }
}

export default PinModal;