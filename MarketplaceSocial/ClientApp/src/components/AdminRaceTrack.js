import { qreq } from '../shared/qrequest';
import BaseCom from './BaseCom';
import DataTable from './DataTable';
import L from './Lang';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import Icon from './Icon';
import FormInput from './FormInput';
import Alert from './Alert';
import LoadingAlert from './LoadingAlert';
import Globals from '../shared/Globals';

export default class AdminRaceTrack extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            item: {}
        };
        this.load = this.load.bind(this);
        this.save = this.save.bind(this);
        this.edit = this.edit.bind(this);
    }

    componentDidMount() {
        this.load();
    }

    load() {
        qreq.get('/api/race-track/list', j => {
            if (j.list)
                this.setState({ list: j.list });
        });
    }

    edit(obj) {
        this.setState({ showEdit: true, loading: true });
        qreq.get('/api/race-track/item?id=' + obj.id, j => {
            if (j.item)
                this.setState({ item: j.item });
            else
                this.setState({ showEdit: true });
            this.setState({ loading: false });
        }, () => {
            this.setState({ showEdit: false, loading: false });
        });
    }

    save(e) {
        if (e)
            e.preventDefault();
        this.setState({ submitting: true });
        qreq.post('/api/race-track/save', this.state.item, j => {
            if (j.errorCode === 0) {
                this.setState({ item: {}, showEdit: false });
                this.load();
            }
            else
                this.showError(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.setState({ submitting: false });
        });
    }

    render() {
        return <>
            <Modal isOpen={this.state.showEdit} toggle={() => { this.setState({ showEdit: false, item: {} }) }} size="lg">
                <ModalHeader>
                    <L>Edit Race Track</L>
                </ModalHeader>
                <ModalBody>
                    {this.state.loading ? <LoadingAlert /> : <form onSubmit={this.save}>
                        <FormInput model={this.state.item} name="name" label="Race Track Name" type="text" required />
                        <FormInput model={this.state.item} name="displayPhoto" label="Track Image" type="image-upload" onChange={() => this.setState({ item: this.state.item })} />
                        {this.state.item.displayPhoto ? <span>Selected File: <strong>{this.state.item.displayPhoto.originalFileName}</strong>
                            <span onClick={() => this.setState({ item: { ...this.state.item, displayPhoto: null } })} role="button" className="badge bg-danger">remove</span>
                            {this.state.item.displayPhoto.mimeType && this.state.item.displayPhoto.mimeType.startsWith('image/') ? <><br /><img src={this.state.item.displayPhoto.thumbUrl ? (Globals.serverUrl + this.state.item.displayPhoto.thumbUrl) : 'data:' + this.state.item.displayPhoto.fileType + ';base64,' + this.state.item.displayPhoto.base64Content} alt="" className="img-thumbnail" /></> : ''}</span> : ''}

                        <div className="mt-2">
                            <button type="submit" className="btn btn-primary" disabled={this.state.submitting}>Save</button>
                            <button type="button" className="btn btn-secondary ms-2" disabled={this.state.submitting} onClick={() => this.setState({ showEdit: false })}>Cancel</button>
                        </div>
                        {this.state.uploading ? <p><L>Uploading please wait...</L></p> : ''}
                        {this.state.error ? <Alert message={this.state.error} type="danger" className="mt-2" /> : ''}
                    </form>}
                </ModalBody>
            </Modal>
            <div className="container">
                <h1 className="mb-3"><L>Manage Race Tracks</L></h1>
                <section>
                    <div className="container p-2">
                        <div className="btn-group mb-2">
                            <button type="button" className="btn btn-primary" onClick={() => this.setState({ showEdit: true, item: {} })}><Icon icon="faPlus" /> Add Race Track</button>
                        </div>
                        <DataTable data={this.state.list} columns={[
                            { button: <Icon icon="faPencil" />, style: { width: '50px' }, onClick: i => { this.edit(i); } },
                            { name: 'name', title: 'Track Name' }
                        ]} />
                    </div>
                </section>
            </div>
        </>;
    }
}