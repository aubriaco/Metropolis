/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Util;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceUtil.Util;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/shipping")]
    public class ShippingController : BaseController
    {
        [HttpGet("list")]
        public async Task<IActionResult> GetList()
        {
            var list = DeliveryUtil.GetList();
            return LIST(list);
        }

        [HttpGet("estimate")]
        public async Task<IActionResult> GetEstimate([FromQuery] string? ident, [FromQuery] long vendorID, [FromQuery] string clientDate)
        {
            if(string.IsNullOrEmpty(ident))
                return BASE(4, "Shipping type is null.");
            var cart = CartUtil.GetData(HttpContext, CurrentUser);
            var order = cart.Order;
            if (order == null)
                return BASE(2, "Order is null.");

            order.ClientDate = DateTime.Parse(clientDate);

            var st = order.GetVendorShippingType(vendorID);
            if(st == null)
            {
                st = new Order.VendorShippingType()
                {
                    VendorID = vendorID,
                    ShippingType = ident
                };
                order.VendorShippingTypes.Add(st);
            }
            else
            {
                st.ShippingType = ident;
            }

            if (ident != "null")
            {
                using (var db = await Database.CreateAsync())
                {
                    st.Amount = await ShippingUtil.Calculate(db, cart, vendorID);
                }
            }
            else
                st.Amount = 0;

            if(ident == "null")
                ident = null;

            st.ShippingType = ident;


            if(st.Amount < 0)
                return BASE(3, "Delivery address is not in service area.");
                
            decimal totalShipping = 0;

            foreach(var i in order.VendorShippingTypes)
            {
                totalShipping += i.Amount;
            }

            order.ShippingAmount = totalShipping;

            CartUtil.SetStep(HttpContext, 3, CurrentUser, order);

            return ITEM(st.Amount);
        }

    }
}