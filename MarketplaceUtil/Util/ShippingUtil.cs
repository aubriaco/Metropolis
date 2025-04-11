/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.Cart;
using Newtonsoft.Json;

namespace MarketplaceUtil.Util
{
    public static class ShippingUtil
    {
        public static decimal InflateRate = 1.03M;

        public static async Task<decimal> Calculate(Database db, CartData cart, long vendorID)
        {
            decimal totalShipping = 0;
            var order = cart.Order;
            if(order == null)
                throw new Exception("Calculate: Order is null.");
            foreach (var i in cart.List)
            {
                var item = db.GetProductWithImage(i.ProductID);
                if (item != null)
                {
                    if(item.VendorID != vendorID)
                        continue;
                    var vendor = Vendor.GetFromID<Vendor>(db, item.VendorID);
                    if (vendor != null)
                    {
                        vendor.PullChildren(db);

                        var shippingType = order.GetVendorShippingType(vendor.ID);
                        if(shippingType == null || shippingType.ShippingType == null)
                            throw new Exception("Calculate: Shipping type is null.");

                        var dutil = DeliveryUtil.GetUtil(shippingType.ShippingType);

                        // TODO: Calculate 
                        try
                        {
                            order.DeliveryUUID = Guid.NewGuid().ToString();
                            order.Update(db, "DeliveryUUID");
                            var resp = await dutil.GetEstimate(order, vendor, item, i.Quantity);
                            if(resp == -1)
                            { 
                                Console.WriteLine("Not in service area.");
                                return -1;
                            }
                            i.Shipping = Math.Round(resp * InflateRate * i.Quantity, 2);
                            i.Tip = Math.Round(resp * 0.20M, 2);
                            i.Handling = item.HandlingFee;
                            i.TotalShipping = i.Shipping + i.Handling + i.Tip;
                            totalShipping += i.TotalShipping;
                            Console.WriteLine("SHIPPING: " + resp + " | SHIPPING+SERVICE: " + i.Shipping + " | TIP: " + i.Tip + " | HANDLING: " + i.Handling + " | TOTAL: " + i.Shipping);
                        }
                        catch { }

                    }
                }

            }
            return totalShipping;
        }

        public static async Task<decimal> CalculateCart(Database db, CartData cart)
        {
            if(cart.Order == null)
                throw new Exception("CalculateCart: Order is null.");
            var vendors = cart.GetVendors(db);
            cart.Order.ShippingAmount = 0;
            foreach(var vendor in vendors)
            {
                var st = cart.Order.GetVendorShippingType(vendor.ID);
                if(st == null)
                    throw new Exception("CalculateCart: Shipping type for vendor '" + vendor.Name + "' is null.");
                var val = await ShippingUtil.Calculate(db, cart, vendor.ID);
                st.Amount = val;
                cart.Order.ShippingAmount += val;
            }
            return cart.Order.ShippingAmount;
        }
    }
}