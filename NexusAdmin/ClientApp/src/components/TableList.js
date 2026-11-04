import Icon from "./Icon";
import AdminCom from "./AdminCom";
import DataTable from "./DataTable";
import LoadingAlert from "./LoadingAlert";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";
import { qreq } from "../shared/qrequest";

class TableList extends AdminCom {

    constructor(props) {
        super(props);
        this.state = {
            list: []
        };        
    }

    componentDidMount() {
        this.initCheck();
        qreq.get('/api/nexus/table/list', j => {
            if (j.list)
                this.setState({ list: j.list, loaded: true });
        });
    }


    render() {
        if (!this.state.admin) return <></>;
        return <>
            <h1>Manage</h1>
            {!this.state.loaded ? <LoadingAlert /> : ''}
            <DataTable data={this.state.list} columns={[
                { button: <Icon icon="faScrewdriverWrench" />, style: { width: '50px' }, onClick: i => { this.props.navigate('/manage/' + i.name); } },
                { name: 'name', title: 'Data Set' }
            ]} />
        </>;
    }
}
export default withParamsAndNavigate(TableList);
