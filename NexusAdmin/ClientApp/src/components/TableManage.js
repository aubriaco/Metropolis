import { qreq } from "../shared/qrequest";
import DataTable from "./DataTable";
import Icon from "./Icon";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { Link } from 'react-router-dom';
import FormInput from "./FormInput";
import LoadingAlert from "./LoadingAlert";
import AdminCom from "./AdminCom";

class TableManage extends AdminCom {

    constructor(props) {
        super(props);
        this.state = {
            search: {},
            item: {
                data: [],
                columns: []
            }
        };
        this.load = this.load.bind(this);
        this.search = this.search.bind(this);
        this.delete = this.delete.bind(this);
    }

    componentDidMount() {
        this.initCheck();
        this.load();
    }

    load(sortBy) {
        if (sortBy)
            this.setState({ sortBy: sortBy });
        else
            sortBy = this.state.sortBy;
        qreq.get('/api/nexus/table/data?name=' + this.props.params.name + (this.state.search.query ? '&search=' + encodeURIComponent(this.state.search.query) : '')
            + (sortBy ? '&sortBy=' + sortBy.name + '&sortOrd=' + (sortBy.asc ? 'ASC' : 'DESC') : '')
            , j => {
            if (j.item) {
                var item = this.state.item;
                var cols = [];
                var n = 0;

                cols.push({ button: <Icon icon="faPencil" />, style: { width: '50px' }, onClick: i => { this.props.navigate('/manage/' + this.state.item.name + '/' + i.id); } });
                cols.push({ button: <Icon icon="faTrash" />, style: { width: '50px' }, onClick: i => { this.delete(i); } });

                for (var i of j.item.columns) {
                    cols.push(i);
                    n++;
                    if (n >= 5)
                        break;
                }

                item.name = j.item.name;
                if (item.columns.length !== cols.length)
                    item.columns = cols;
                item.data = j.item.data;
                this.setState({ item: item, loaded: true });
            }
        });
    }

    search(e) {
        if (e) e.preventDefault();

    }

    delete(obj) {
        if (!window.confirm('Are you sure you want to delete object ID: ' + obj.id))
            return;
        qreq.post('/api/nexus/table/delete?name=' + this.props.params.name + '&id=' + obj.id, {}, j => {
            if (j.errorCode === 0) {
                this.load();
            }
            else
                this.alert(j.errorMessage);
        });
    }

    render() {
        return <>
            <h1><Link to="/manage">Manage</Link>: {this.state.item.name}</h1>
            <div className="btn-group my-2">
                <Link to={'/manage/' + this.props.params.name + '/new'} className="btn btn-primary" role="button"><Icon icon="faPlus" /> New Item</Link>
                <button type="button" className="btn btn-secondary" onClick={() => this.load()}><Icon icon="faRefresh" /> Refresh</button>
            </div>
            <div className="bg-light p-3">
                <form onSubmit={this.search}>
                    <FormInput model={this.state.search} name="query" label="Search..." labelAsPlaceholder />
                </form>
            </div>
            {!this.state.loaded ? <LoadingAlert /> : ''}
            <DataTable data={this.state.item.data} columns={this.state.item.columns} onSort={col => {
                this.load(col);
                this.setState({ sortBy: col });
            }} />
        </>;
    }
}

export default withParamsAndNavigate(TableManage);