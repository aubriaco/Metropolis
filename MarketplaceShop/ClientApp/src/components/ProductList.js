import Vendor from '../shared/Vendor';
import { qreq } from '../shared/qrequest';
import BaseCom from './BaseCom';

export default class ProductList extends BaseCom {

    componentDidMount() {
        qreq.get('/api/product/list?vendorId=' + Vendor.config.id, j => {
            if(j.list)
                this.setState({ list: j.list });
        });
    }

    render() {
        return <div className="container">
            
        </div>;
    }
}