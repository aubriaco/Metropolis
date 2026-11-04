import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import Alert from './Alert';
import BaseCom from "./BaseCom";
import FormInput from './FormInput';
import UploadPad from './UploadPad';
import L from './Lang';
import carsData from '../lists/cars.json';
import { qreq } from '../shared/qrequest';

export default class AddCarModal extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            info: this.props.item ?? {},
            makes: carsData.list,
            models: [],
            years: []
        };

        this.submit = this.submit.bind(this);
        this.onMakeChanged = this.onMakeChanged.bind(this);
        this.onModelChanged = this.onModelChanged.bind(this);
        this.changeCallback = this.changeCallback.bind(this);        
    }

    changeCallback(item) {
        if (item) {
            if (item.make) {
                this.onMakeChanged(item.make, () => {
                    if (item.model)
                        this.onModelChanged(item.model);
                });
            }
        }
    };

    componentDidMount() {
        this.changeCallback(this.state.info);
    }

    componentDidUpdate(prevProps) {

        if (prevProps.show !== this.props.show) {
            this.setState({ info: this.props.item ?? {} });
            this.changeCallback(this.props.item);
        }
        if (prevProps.item !== this.props.item) {
            this.setState({ info: this.props.item });
            this.changeCallback(this.props.item);
        }
    }

    onMakeChanged(obj, callback) {
        var item = carsData.list.find(e => e.id === obj);
        if (item) {
            this.setState({ models: item.models, info: { ...this.state.info } });
            if (callback)
                callback();
        }
        else
            this.setState({ models: [], years: [] });
    }

    onModelChanged(obj) {
        var make = carsData.list.find(e => e.id === this.state.info.make);
        if (make) {
            var model = make.models.find(e => e.id === obj);
            if (model) {
                var years = [];
                var yearFrom = model['year-from'];
                var yearTo = model['year-to'];
                if (!yearTo)
                    yearTo = Number(new Date().getFullYear());
                for (var n = yearTo; n >= yearFrom; n--)
                    years.push({ id: n, name: n });
                this.setState({ years: years, info: { ...this.state.info } });
                return;
            }
        }
        this.setState({ years: [] });
    }

    submit(e) {
        if (e)
            e.preventDefault();
        this.setState({ submitting: true });

        var info = { ...this.state.info };
        if (info.photos) {
            info.photos.forEach(i => {
                i.base64Content = null;
            });
        }
        

        qreq.post('/api/garage/save', info, j => {
            if (j.item) {
                this.props.onSave();
            }
            else
                this.showError(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.showError('Unknown error. Please try again.');
            this.setState({ submitting: false });
        });
    }

    render() {
        return <><Modal isOpen={this.props.show} toggle={() => { if (this.props.onToggle) this.props.onToggle() }} size="lg">
            <ModalHeader toggle={() => { if (this.props.onToggle) this.props.onToggle(); }}>
                <div className="text-center">
                    <L>Add Vehicle</L>
                </div>
            </ModalHeader>
            <ModalBody>
                <div className="p-5">
                    <form onSubmit={this.submit} className="mt-4">
                        <div className="row">
                            <div className="col-md-4"><FormInput model={this.state.info} name="make" label="Make" type="select" options={this.state.makes} required onChange={this.onMakeChanged} /></div>
                            <div className="col-md-4"><FormInput model={this.state.info} name="model" label="Model" type="select" options={this.state.models} required onChange={this.onModelChanged} /></div>
                            <div className="col-md-4"><FormInput model={this.state.info} name="year" label="Year" type="select" options={this.state.years} required /></div>
                        </div>
                        <FormInput model={this.state.info} name="mods" label="Mods" type="textarea" innerStyle={{ height: '100px' }} />
                        <label className="mb-2">Photos</label>
                        <UploadPad item={this.state.info} name="photos" onUploadBegin={() => this.setState({ uploading: true })} onUploadEnd={() => this.setState({ uploading: false })} />
                        <div className="mt-2">
                            <button type="submit" className="btn btn-success btn-lg d-block w-100" disabled={this.state.submitting || this.state.uploading}><L>Submit</L></button>
                            {this.state.uploading ? <p><L>Uploads in process...</L></p> : ''}
                        </div>
                        {this.state.error ? <Alert message={this.state.error} type="danger" className="mt-2" /> : ''}
                    </form>
                </div>
            </ModalBody>
        </Modal></>;
    }
}