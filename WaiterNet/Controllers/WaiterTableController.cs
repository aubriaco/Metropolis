/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Controllers;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.WaiterNet;
using Microsoft.AspNetCore.Mvc;
using Ubriaco.Attributes;

namespace WaiterNet.Controllers
{
    [ApiController]
    [Route("api/waiter/table")]
    public class WaiterTableController : BaseController
    {
        [HttpGet("list")]
        public IActionResult GetList()
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

                var list = new FloorTable() { VendorID = se.ActiveVendorID }.List<FloorTable>(db, "VendorID", null, "Name ASC");

                return LIST(list);
            }
        }

        [HttpGet("get/public")]
        public IActionResult GetPublic([FromQuery] long vendorID, [FromQuery] long id)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = new Database())
            {
                var item = new FloorTable() { VendorID = vendorID, ID = id };

                if (!item.Select(db, "ID,VendorID"))
                    return BASE(3, "Table not found.");

                return ITEM(item);
            }
        }

        [HttpGet("get")]
        public IActionResult Get([FromQuery] long id)
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

                var item = new FloorTable() { VendorID = se.ActiveVendorID, ID = id };
                
                if(!item.Select(db, "ID,VendorID"))
                    return BASE(3, "Table not found.");

                return ITEM(item);
            }
        }

        [HttpPost("save")]
        public IActionResult PostSave([FromBody] FloorTable req)
        {
            if(CurrentUser == null)
                return BASE(1, "Not logged in.");
            if(CurrentUser.IsViewMode)
                return BASE(1, "In view mode.");

            using(var db = new Database())
            {
                var vendor = Vendor.GetFromID<Vendor>(db, req.VendorID);
                if(vendor == null)
                    return BASE(2, "Vendor not found.");
                
                if(!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                
                req.CreatedByUserID = CurrentUser.ID;
                req.ID = req.Save(db);

                var qr = new MenuQR() { VendorID = vendor.ID, TableID = req.ID, Name = req.Name };
                if (!qr.Select(db, "VendorID,TableID"))
                    qr.ID = qr.Insert(db);

                return ITEM(req);
            }
        }
    }
}