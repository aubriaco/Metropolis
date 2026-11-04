/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace;
using Marketplace.Controllers;
using Marketplace.Util;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.WaiterNet;
using MarketplaceUtil.Util;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Numerics;

namespace WaiterNet.Controllers
{
    [ApiController]
    [Route("api/waiter/order")]
    public class WaiterOrderController : BaseController
    {
        [HttpPost("add")]
        public IActionResult PostAdd([FromBody] MenuOrderItem req)
        {
            using(var redis = new RedisUtil())
            {
                var wsid = Request.Cookies["WSID"];
                if(string.IsNullOrEmpty(wsid))
                    wsid = Guid.NewGuid().ToString();
                var data = redis.Get("WSID-" + wsid);
                MenuOrder? cart = null;
                if(!string.IsNullOrEmpty(data))
                    cart = JsonConvert.DeserializeObject<MenuOrder>(data);

                if(cart == null)
                    cart = new MenuOrder();

                using(var db = new Database())
                {
                    var item = MenuItem.GetFromID<MenuItem>(db, req.ItemID);
                    if(item == null)
                        return BASE(2, "Menu item not found.");

                    req.Price = item.Price;
                    cart.VendorID = item.VendorID;
                    cart.Items.Add(req);

                    redis.Put("WSID-" + wsid, JsonConvert.SerializeObject(cart), DateTime.UtcNow.AddHours(1));
                    Response.Cookies.Append("WSID", wsid, new CookieOptions() {
                        Expires = DateTime.UtcNow.AddHours(1),
                        Secure = Config.I.Debug ? false : true,
                        SameSite = Config.I.Debug ? SameSiteMode.Lax : SameSiteMode.None
                    });
                    return ITEM(cart.Quantity);
                }
            }
        }

        [HttpGet("cart")]
        public IActionResult GetCart()
        {
            var emptyCart = new MenuOrder();
            var wsid = Request.Cookies["WSID"];
            if(string.IsNullOrEmpty(wsid))
                return ITEM(emptyCart);
            using(var redis = new RedisUtil())
            {
                var data = redis.Get("WSID-" + wsid);
                if(string.IsNullOrEmpty(data))
                    return ITEM(emptyCart);
                var cart = JsonConvert.DeserializeObject<MenuOrder>(data);
                if(cart == null)
                    return ITEM(emptyCart);
                return ITEM(cart);
            }
        }

        [HttpGet("cart/count")]
        public IActionResult GetCartCount()
        {
            var wsid = Request.Cookies["WSID"];
            if(string.IsNullOrEmpty(wsid))
                return ITEM(0);
            using(var redis = new RedisUtil())
            {
                var data = redis.Get("WSID-" + wsid);
                if(string.IsNullOrEmpty(data))
                    return ITEM(0);
                var cart = JsonConvert.DeserializeObject<MenuOrder>(data);
                if(cart == null)
                    return ITEM(0);
                return ITEM(cart.Quantity);
            }
        }

        [HttpPost("cart/update")]
        public IActionResult PostCartUpdate([FromBody] MenuOrderItem req)
        {
            var wsid = Request.Cookies["WSID"];
            if(string.IsNullOrEmpty(wsid))
                return BASE(2, "No cart order.");
            using(var redis = new RedisUtil())
            {
                var data = redis.Get("WSID-" + wsid);
                if(string.IsNullOrEmpty(data))
                    return BASE(2, "No cart order.");
                var cart = JsonConvert.DeserializeObject<MenuOrder>(data);
                if(cart == null)
                    return BASE(2, "No cart order.");

                foreach(var i in cart.Items)
                {
                    if(i.ItemID == req.ItemID)
                    {
                        if(req.Removed && i.Quantity == req.Quantity)
                        {
                            cart.Items.Remove(i);
                            break;
                        }
                        i.Quantity = req.Quantity;
                        break;
                    }
                }

                redis.Put("WSID-" + wsid, JsonConvert.SerializeObject(cart), DateTime.UtcNow.AddHours(1));
                Response.Cookies.Append("WSID", wsid, new CookieOptions() {
                    Expires = DateTime.UtcNow.AddHours(1),
                    Secure = Config.I.Debug ? false : true,
                    SameSite = Config.I.Debug ? SameSiteMode.Lax : SameSiteMode.None
                });

                return ITEM(cart);
            }
        }

        [HttpPost("submit")]
        public IActionResult PostSubmit([FromBody] MenuOrder req)
        {
            var wsid = Request.Cookies["WSID"];
            if(string.IsNullOrEmpty(wsid))
                return BASE(2, "No cart order.");
            using(var redis = new RedisUtil())
            {
                var data = redis.Get("WSID-" + wsid);
                if(string.IsNullOrEmpty(data))
                    return BASE(2, "No cart order.");
                var cart = JsonConvert.DeserializeObject<MenuOrder>(data);
                if(cart == null)
                    return BASE(2, "No cart order.");

               
                req.EmptyNonEditable();

                using(var db = new Database())
                {
                    long vendorID = 0;
                    foreach(var i in req.Items)
                    {
                        
                        var itemName = i.Item != null ? i.Item.Name : "Unknown";
                        var item = MenuItem.GetFromID<MenuItem>(db, i.ItemID);
                        if(item == null)
                            return BASE(5, "The item '" + itemName + "' is not available.");
                        if(item.VendorID != i.VendorID)
                            return BASE(5, "The item '" + itemName + "' is not from this vendor.");
                        if(item.Price != i.Price)
                            return BASE(5, "The item '" + itemName + "' has an incorrect price in your order.");
                        if(vendorID == 0)
                            vendorID = item.VendorID;
                        else if(vendorID != item.VendorID)
                            return BASE(5, "Vendor mismatch on items.");
                    }
                    req.VendorID = vendorID;
                    req.UserID = CurrentUser != null ? CurrentUser.ID : 0;
                    req.ItemsData = JsonConvert.SerializeObject(req.Items);

                    req.SeqID = SeqTracker.GetSeq(db, vendorID);
                    var ipAddr = Request.Headers["X-Forwarded-For"];
                    if(!string.IsNullOrEmpty(ipAddr))
                        req.IPAddress = ipAddr;
                    else if(HttpContext.Connection.RemoteIpAddress != null)
                        req.IPAddress = HttpContext.Connection.RemoteIpAddress.ToString();
                    req.CreatedDate = DateTime.UtcNow;
                    req.ID = req.Insert(db);

                    redis.Delete("WSID-" + wsid);
                    Response.Cookies.Delete("WSID");

                    var psid = Request.Cookies["PSID"];
                    if(string.IsNullOrEmpty(psid))
                        psid = (Guid.NewGuid().ToString() + Guid.NewGuid().ToString()).Replace("-","");

                    PSession? pses = null;
                    var pdata = redis.Get("PSID-" + psid);

                    if(!string.IsNullOrEmpty(pdata))
                    {
                        pses = JsonConvert.DeserializeObject<PSession>(pdata);
                    }

                    if(pses == null)
                        pses = new PSession();

                    pses.OrderIDList.Add(req.ID);
                    
                    Response.Cookies.Append("PSID", psid, new CookieOptions() {
                        Expires = DateTime.UtcNow.AddYears(1),
                        Secure = Config.I.Debug ? false : true,
                        SameSite = Config.I.Debug ? SameSiteMode.Lax : SameSiteMode.None
                    });

                    // Pull table data if valid
                    if(req.TableID != 0)
                    {
                        req.Table = new FloorTable() { ID = req.TableID };
                        if (!req.Table.Select(db, "ID"))
                            req.Table = null;
                        else if (req.Table.VendorID != req.VendorID)
                            req.Table = null;
                    }


                    var vi = new VendorIntegration() { VendorID = vendorID, Name = "Clover" };
                    if (vi.Select(db, "VendorID,Ident"))
                    {
                        var taskInfo = new WaiterTask() { TaskType = WaiterTaskType.Order, Integration = vi, Order = req };
                        redis.Push("waiter-tasks", JsonConvert.SerializeObject(taskInfo));
                    }

                    return ITEM(req);
                }
            }
        }

        [HttpPost("pay")]
        public async Task<IActionResult> PostPay([FromBody] MenuOrder req)
        {
            if (req.Payment == null)
                return BASE(5, "Payment information has not been provided.");
            if (string.IsNullOrEmpty(req.Email))
                return BASE(5, "Email must not be blank.");
            using (var db = new Database())
            {
                var order = MenuOrder.GetFromID<MenuOrder>(db, req.ID);
                if (order == null)
                    return BASE(2, "Order not found.");
                if (order.IsPaid)
                    return BASE(3, "Order is already paid.");

                var items = JsonConvert.DeserializeObject<List<MenuOrderItem>>(order.ItemsData);
                if (items == null)
                    return BASE(6, "Order items is corrupted.");

                order.Items = items;

                var vi = new VendorIntegration() { VendorID = order.VendorID, Name = "Clover" };
                if(!vi.Select(db, "VendorID,Ident"))
                    return BASE(4, "No payment integration found.");

                var ci = new CloverIntegration(vi);

                foreach(var i in order.Items)
                {
                    if (i.Item == null || string.IsNullOrEmpty(i.Item.ExternalID))
                        return BASE(5, "One or more items in your order are not in inventory. Please pay at the merchant.");
                    if (!i.Item.Select(db, "ID"))
                        return BASE(5, "Item in order not found.");
                }

                try
                {
                    var token = await ci.GetCardToken(req.Payment);
                    var payment = await ci.PayOrder(order, token);
                    payment.ID = payment.Insert(db);

                    order.IsPaid = true;
                    order.Update(db, "IsPaid");
                }
                catch(Exception ex)
                {
                    Console.WriteLine("PostPay: ERROR: " + ex.Message);
                    return BASE(7, "Failed to process payment.");
                }

                return BASE();
            }
        }
        
        [HttpGet("get")]
        public IActionResult Get([FromQuery] string masterID)
        {
            using(var db = new Database())
            {
                var item = MenuOrder.GetFromMasterID<MenuOrder>(db, masterID);
                if(item == null)
                    return BASE(2, "Order not found.");
                if(item.ItemsData != null)
                {
                    var items = JsonConvert.DeserializeObject<List<MenuOrderItem>>(item.ItemsData);
                    if(items != null)
                        item.Items = items;
                }
                return ITEM(item);
            }
        }

        [HttpGet("list/pending")]
        public IActionResult GetListPending()
        {
            if(CurrentUser == null)
                return BASE(1, "Not logged in.");
            using(var db = new Database())
            {
                var se = SessionExtra.Get(db, CurrentUser);
                if(se == null)
                   return BASE(3, "Session extra not present.");
                
                var vendor = Vendor.GetFromID<Vendor>(db, se.ActiveVendorID);
                if(vendor == null)
                    return BASE(2, "Vendor not found.");

                if(!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                var list = new MenuOrder() { VendorID = se.ActiveVendorID, IsCompleted = false, IsCanceled = false }.List<MenuOrder>(db, "VendorID,IsCompleted,IsCanceled", null, "CreatedDate ASC");

                foreach(var i in list)
                {
                    var items = JsonConvert.DeserializeObject<List<MenuOrderItem>>(i.ItemsData ?? "[]");
                    if(items != null)
                        i.Items = items;
                    i.ItemsData = null;
                }
                return LIST(list);
            }
        }

        [HttpPost("done")]
        public IActionResult PostDone([FromBody] MenuOrder req)
        {
            if(CurrentUser == null)
                return BASE(1, "Not logged in.");
            using(var db = new Database())
            {
                var se = SessionExtra.Get(db, CurrentUser);
                if(se == null)
                   return BASE(3, "Session extra not present.");
                
                var vendor = Vendor.GetFromID<Vendor>(db, se.ActiveVendorID);
                if(vendor == null)
                    return BASE(2, "Vendor not found.");

                if(!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                if(!req.Select(db, "ID"))
                    return BASE(4, "Order not found.");

                if(req.VendorID != vendor.ID)
                    return BASE(5, "Not this vendors order.");

                if(req.IsCompleted)
                    return BASE(6, "Order is already completed.");
                if(req.IsCanceled)
                    return BASE(6, "Order is canceled.");
                
                req.IsDone = true;
                req.Update(db, "IsDone");

                return BASE();
            }
        }

        [HttpPost("complete")]
        public IActionResult PostComplete([FromBody] MenuOrder req)
        {
            if(CurrentUser == null)
                return BASE(1, "Not logged in.");
            using(var db = new Database())
            {
                var se = SessionExtra.Get(db, CurrentUser);
                if(se == null)
                   return BASE(3, "Session extra not present.");
                
                var vendor = Vendor.GetFromID<Vendor>(db, se.ActiveVendorID);
                if(vendor == null)
                    return BASE(2, "Vendor not found.");

                if(!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                if(!req.Select(db, "ID"))
                    return BASE(4, "Order not found.");

                if(req.VendorID != vendor.ID)
                    return BASE(5, "Not this vendors order.");

                if(req.IsCanceled)
                    return BASE(6, "Order is canceled.");
                
                req.IsCompleted = true;
                req.Update(db, "IsCompleted");

                return BASE();
            }
        }

        [HttpPost("trash")]
        public IActionResult PostTrash([FromBody] MenuOrder req)
        {
            if(CurrentUser == null)
                return BASE(1, "Not logged in.");
            using(var db = new Database())
            {
                var se = SessionExtra.Get(db, CurrentUser);
                if(se == null)
                   return BASE(3, "Session extra not present.");
                
                var vendor = Vendor.GetFromID<Vendor>(db, se.ActiveVendorID);
                if(vendor == null)
                    return BASE(2, "Vendor not found.");

                if(!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                if(!req.Select(db, "ID"))
                    return BASE(4, "Order not found.");

                if(req.VendorID != vendor.ID)
                    return BASE(5, "Not this vendors order.");

                if(req.IsCompleted)
                    return BASE(6, "Order is already completed.");
                if(req.IsCanceled)
                    return BASE(6, "Order is canceled.");
                
                req.IsCanceled = true;
                req.Update(db, "IsCanceled");

                return BASE();
            }
        }

        [HttpPost("undo")]
        public IActionResult PostUndo([FromBody] MenuOrder req)
        {
            if(CurrentUser == null)
                return BASE(1, "Not logged in.");
            using(var db = new Database())
            {
                var se = SessionExtra.Get(db, CurrentUser);
                if(se == null)
                   return BASE(3, "Session extra not present.");
                
                var vendor = Vendor.GetFromID<Vendor>(db, se.ActiveVendorID);
                if(vendor == null)
                    return BASE(2, "Vendor not found.");

                if(!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                if(!req.Select(db, "ID"))
                    return BASE(4, "Order not found.");

                if(req.VendorID != vendor.ID)
                    return BASE(5, "Not this vendors order.");

                req.IsCompleted = false;
                req.IsCanceled = false;
                req.IsDone = false;
                req.Update(db, "IsDone,IsCompleted,IsCanceled");

                return BASE();
            }
        }

    }
}