/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import Globals from "./Globals";
import { qreq } from "./qrequest";
import { toast } from "react-toastify";

class _Cart {
    constructor() {
        this.list = [];
        this.count = 0;
        this.subTotal = 0;
        this.totalTax = 0;
        this.totalNoShipping = 0;
        this.totalShipping = 0;
        this.totalDiscount = 0;
        this.total = 0;
        this.shippingType = null;
    }

    getList() {
        return this.list;
    }

    getTotal() {
        return this.total;
    }

    refresh(callback) {
        qreq.get('/api/cart/get', j => {
            if (j.item) {
                if(j.item.order) {
                    this.shippingType = j.item.order.shippingType;
                    this.totalShipping = j.item.order.shippingAmount;
                }
                else {
                    this.shippingType = null;
                    this.totalShipping = 0;
                }
                if (j.item.products) {
                    this.list = j.item.products;
                    this.count = j.item.products.length;
                    var total = 0;
                    var subTotal = 0;
                    var totalTax = 0;
                    var totalDiscount = 0;
                    var totalShipping = 0;
                    var n = 0;
                    j.item.products.forEach(i => {
                        i.idx = n;
                        subTotal += i.cart.totalPrice;
                        total += i.cart.total;
                        totalTax += i.cart.totalTax;
                        totalDiscount += i.cart.discount;
                        totalShipping += i.cart.totalShipping;
                        n++;
                    });
                    this.subTotal = Number(subTotal).toFixed(2);
                    this.totalNoShipping = Number(total).toFixed(2);
                    this.total = Number(total + this.totalShipping).toFixed(2);
                    this.totalTax = Number(totalTax).toFixed(2);
                    this.totalDiscount = Number(totalDiscount).toFixed(2);
                }

                if (callback)
                    callback(j.item.products, subTotal);
            }
        });
    }

    add(productID, quantity) {
        if (!quantity) quantity = 1;
        this.count++;
        qreq.post('/api/cart/add', { productID: productID, quantity: quantity }, j => {
            if (j.errorCode)
                toast.error(j.errorMessage);
            else {
                toast.success(Globals.getLang('Added to cart!'));
                //this.refresh();
            }
        });
    }

    remove(productID, quantity) {
        if (!quantity) quantity = 1;
        this.list.splice(this.list.findIndex(i => i.id === productID), 1);
        qreq.post('/api/cart/remove', { productID: productID, quantity: quantity }, j => {
            if (j.errorCode)
                toast.error(j.errorMessage);
            else
                toast.success(Globals.getLang('Removed from cart.'));
        });
        return this.list;
    }
}

const Cart = new _Cart();

export default Cart;