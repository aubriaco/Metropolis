/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Models.Responses;
using MarketplaceData.Models;
using MarketplaceData;
using Microsoft.AspNetCore.Mvc;
using Marketplace.Util;
using MarketplaceData.Models.WaiterNet;
using MarketplaceUtil.Util;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/order")]
    public class OrderController : BaseController
    {
        [HttpGet("vendor/list")]
        public async Task<IActionResult> GetVendorList([FromQuery] long vendorId = 0, [FromQuery] string? vendorMasterId = null)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            
            using (var db = await Database.CreateAsync())
            {
                if (vendorMasterId != null)
                {
                    var vendor = MasterModel.GetFromMasterID<Vendor>(db, vendorMasterId);
                    if (vendor == null)
                        return Ok(new BaseResponse(4, "Could not find vendor."));
                    vendorId = vendor.ID;
                }

                if (vendorId == 0)
                    return Ok(new BaseResponse(5, "Could not find vendor."));

                if (!UserUtil.CanManageVendor(db, CurrentUser.ID, vendorId))
                    return Ok(new BaseResponse(3, "No access to vendor."));

                var list = db.GetOrdersByVendor(vendorId);

                return Ok(new ListResponse(list));
            }
        }

        [HttpGet("get")]
        public async Task<IActionResult> Get([FromQuery] string masterID)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                var order = Order.GetFromMasterID<Order>(db, masterID);
                if (order == null)
                    return BASE(2, "Order not found.");
                if (order.UserID != CurrentUser.ID)
                    return BASE(2, "Invalid order.");

                order.Items = CartProduct.GetByOrder(db, order.ID);
                order.TrackingList = OrderTracking.GetListByOrder(db, order.ID);
                return ITEM(order);
            }
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetList()
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            
            using(var db = await Database.CreateAsync())
            {
                var list = new Order() { OrderType = Order.OrderTypeUser, UserID = CurrentUser.ID }.List<Order>(db, "OrderType,UserID", null, "ID DESC");
                foreach(var i in list)
                {
                    i.TrackingList = OrderTracking.GetListByOrder(db, i.ID);
                }
                return LIST(list);
            }
        }

        [HttpPost("vendor/confirm")]
        public async Task<IActionResult> PostVendorConfirm([FromBody] Order req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                var order = Order.GetFromID<Order>(db, req.ID);
                if (order == null)
                    return BASE(2, "Order not found.");
                if(order.OrderType != Order.OrderTypeVendor)
                    return BASE(2, "Invalid order.");
                var vendor = Vendor.GetFromID<Vendor>(db, order.VendorID);
                if(vendor == null)
                    return BASE(2, "Vendor not found.");
                if(!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "Invalid vendor.");

                if(order.IsVendorConfirmed)
                    return BASE(3, "Order is already confirmed.");

                order.IsVendorConfirmed = true;
                order.VendorConfirmedDate = DateTime.UtcNow;
                order.Status = "Confirmed";
                order.StatusHigh = "Confirmed";
                order.Update(db, "IsVendorConfirmed,VendorConfirmedDate,Status,StatusHigh");

                MailUtil.SendOrderConfirmed(db, order);
                
                return BASE();
            }
        }

        [HttpPost("vendor/cancel")]
        public async Task<IActionResult> PostVendorCancel([FromBody] Order req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                var order = Order.GetFromID<Order>(db, req.ID);
                if (order == null)
                    return BASE(2, "Order not found.");
                if(order.OrderType != Order.OrderTypeVendor)
                    return BASE(2, "Invalid order.");
                var vendor = Vendor.GetFromID<Vendor>(db, order.VendorID);
                if(vendor == null)
                    return BASE(2, "Vendor not found.");
                if(!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "Invalid vendor.");

                if(order.IsShipped)
                    return BASE(3, "Order is already shipped.");

                order.IsVendorCanceled = true;
                order.VendorCanceledDate = DateTime.UtcNow;
                order.Status = "Canceled";
                order.StatusHigh = "Canceled";
                order.Update(db, "IsVendorCanceled,VendorCanceledDate,Status,StatusHigh");

                MailUtil.SendOrderCanceled(db, order);
                
                return BASE();
            }
        }

        [HttpPost("vendor/package")]
        public async Task<IActionResult> PostVendorReadyForPickup([FromBody] Order req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                var order = Order.GetFromID<Order>(db, req.ID);
                if (order == null)
                    return BASE(2, "Order not found.");
                if(order.OrderType != Order.OrderTypeVendor)
                    return BASE(2, "Invalid order.");
                var vendor = Vendor.GetFromID<Vendor>(db, order.VendorID);
                if(vendor == null)
                    return BASE(2, "Vendor not found.");
                if(!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "Invalid vendor.");

                if(order.IsPackaged)
                    return BASE(3, "Order is already packaged.");

                order.PullChildren(db);
                vendor.PullChildren(db);

                string extra = "";

                if(order.IsCourierShipping)
                {
                    if(string.IsNullOrEmpty(order.ShippingType))
                        return BASE(4, "Shipping Type is null.");
                    var dutil = DeliveryUtil.GetUtil(order.ShippingType);
                    try
                    {
                        order.ClientDate = DateTime.UtcNow;
                        var resp = await dutil.CreateDelivery(order, vendor);
                    }
                    catch(Exception ex)
                    {
                        return BASE(4, ex.Message);
                    }
                    order.Update(db, "DeliveryUUID,TrackingUrl");
                }
                else
                {
                    if(string.IsNullOrEmpty(req.TrackingNumber))
                        return BASE(5, "Please provide a tracking number.");
                    order.TrackingNumber = req.TrackingNumber;
                    order.Update(db, "TrackingNumber");
                    extra += "Tracking Number: " + order.TrackingNumber;
                }

                order.IsPackaged = true;
                order.PackagedDate = DateTime.UtcNow;
                order.Status = "Ready for Pickup";
                order.StatusHigh = "Ready for Pickup";
                order.Update(db, "IsPackaged,PackagedDate,Status,StatusHigh");

                MailUtil.SendOrderPackaged(db, order, extra);
                
                return BASE();
            }
        }

        [HttpGet("chart/orders-by-day")]
        public async Task<IActionResult> GetChartOrdersByDay([FromQuery] long vendorID)
        {
            if(CurrentUser == null)
                return BASE(1, "Not logged in.");

            using(var db = await Database.CreateAsync())
            {
                var vendor = Vendor.GetFromID<Vendor>(db, vendorID);
                if(vendor == null)
                    return BASE(2, "Vendor not found.");
                if(!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "Invalid vendor.");

                var startDate = DateTime.Parse(DateTime.UtcNow.AddDays(-7).ToString("yyyy-MM-dd"));

                var list = Order.GetOrdersByDay(db, vendor.ID, startDate);

                return LIST(list);
            }
        }

    }
}
