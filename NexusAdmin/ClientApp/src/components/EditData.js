import { qreq } from "../shared/qrequest";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Link } from 'react-router-dom';
import FormInput from "./FormInput";
import AdminCom from "./AdminCom";
import LoadingAlert from "./LoadingAlert";

class EditData extends AdminCom {

    constructor(props) {
        super(props);
        this.state = {
            item: {},
            columns: []
        };
        this.load = this.load.bind(this);
        this.save = this.save.bind(this);
    }

    componentDidMount() {
        this.initCheck();
        this.load();
    }

    load() {        
        qreq.get('/api/nexus/table/item?name=' + this.props.params.name + '&id=' + (this.props.params.id ?? 0), j => {
            if (!j.item.data)
                j.item.data = [{}];
            if (j.item)
                this.setState({ modelName: j.item.name, columns: j.item.columns, item: j.item.data[0] });
        });
    }

    getInputType(obj) {
        if (obj.inputType === 'DateTime')
            return 'datetime';
        else if (obj.inputType === 'Int32' || obj.inputType === 'Int64')
            return 'number';
        else if (obj.inputType === 'Boolean')
            return 'switch';
        else
            return 'text';
    }

    save(e) {
        if (e) e.preventDefault();
        this.setState({ submitting: true });
        qreq.post('/api/nexus/table/save?name=' + this.state.modelName, this.state.item, j => {
            if (j.errorCode === 0)
                this.props.navigate('/manage/' + this.state.modelName);
            else
                this.alert(j.errorMessage);
            this.setState({ submitting: false });
        }, () => {
            this.alert('Unknown error. Try again later.');
            this.setState({ submitting: false });
        });
    }

    render() {
        if (!this.state.modelName)
            return <LoadingAlert />
        return <>
            <h1><Link to="/manage">Manage</Link>: <Link to={'/manage/' + this.state.modelName}>{this.state.modelName}</Link>: Item</h1>
            <form onSubmit={this.save}>
                <div className="card bg-light mt-3">
                    <div className="card-body">
                        <div className="row">
                            {this.state.columns.map(i => <div key={i.name} className="col-md-6 p-3">
                                <FormInput model={this.state.item} name={i.name} label={i.title} type={this.getInputType(i)} />
                            </div>)}
                        </div>
                    </div>
                </div>
                <div className="mt-3 mb-3">
                    <button type="submit" className="btn btn-lg btn-primary" disabled={this.state.submitting}>Save</button>
                    <Link to={'/manage/' + this.state.modelName} role="button" className="btn btn-lg btn-secondary ms-2" disabled={this.state.submitting}>Go Back</Link>
                </div>
            </form>
        </>;
    }
}

export default withParamsAndNavigate(EditData);