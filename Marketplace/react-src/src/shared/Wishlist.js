/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { toast } from "react-toastify";
import { qreq } from "./qrequest";
import Globals from "./Globals";

class _Wishlist {
    add(productID, callback) {
        qreq.post('/api/wishlist/add', { productID: productID }, j => {
            if(j.errorCode === 0) {
                if(callback)
                    callback(j.item);
                else
                    toast.success(Globals.getLang('Product added to your wishlist.'));
            }
            else
                toast.error(j.errorMessage);
        }, () => {
            toast.error(Globals.getLang('Unknown error ocurred. Please try again.'));
        });
    }
}

const Wishlist = new _Wishlist();

export default Wishlist;