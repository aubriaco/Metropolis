import { qreq } from "./qrequest";

class _Vendor {
    load(callback) {
        qreq.get('/api/shop/config', j => {
            if(j.item)
                this.config = j.item.vendor;
            callback(j.item);
        });
    }
};

const Vendor = new _Vendor();

export default Vendor;