import { Modal, ModalBody } from 'reactstrap';
import BaseCom from "./BaseCom";
import L from './Lang';
import { withParamsAndNavigate } from './WithParamsAndNavigate';

class PostSignupModal extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: {},
            step: null
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show)
            this.setState({ info: {} });
    }

    render() {
        return <><Modal isOpen={this.props.show} toggle={() => { if (this.props.onToggle) this.props.onToggle() }}>
            <ModalBody>
                <div className="p-5">
                    <div className="text-center">
                        <h1><L>Your verified!</L></h1>
                        <hr />
                        <button onClick={() => { this.props.navigate('/home/register-bid'); if (this.props.onToggle) this.props.onToggle('register') }} type="button" className="btn btn-success btn-lg d-block w-100 mb-3"><L>Take part in auctions</L></button>
                        <button onClick={() => { this.props.navigate('/sell/vehicle'); if (this.props.onToggle) this.props.onToggle('sell') }} type="button" className="btn btn-success btn-lg d-block w-100 mb-3"><L>Sell your car</L></button>
                        <button onClick={() => { if (this.props.onToggle) this.props.onToggle() }} type="button" className="btn btn-success btn-lg d-block w-100 mb-3"><L>Keep exploring</L></button>
                    </div>
                </div>
            </ModalBody>
        </Modal></>;
    }
}

export default withParamsAndNavigate(PostSignupModal);