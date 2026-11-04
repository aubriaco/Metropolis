/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Controllers;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.WaiterNet;
using Microsoft.AspNetCore.Mvc;

namespace WaiterNet.Controllers
{
    [ApiController]
    [Route("api/waiter/item")]
    public class WaiterItemController : BaseController
    {
        [HttpGet("list/public")]
        public IActionResult GetListPublic([FromQuery] long vendorID, [FromQuery] long categoryID)
        {
            using(var db = new Database())
            {
                var list = new MenuItem() { VendorID = vendorID, CategoryID = categoryID }.List<MenuItem>(db, "VendorID,CategoryID", null, "Name ASC");

                return LIST(list);
            }
        }

        [HttpGet("list")]
        public IActionResult GetList([FromQuery] long categoryID)
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

                var list = new MenuItem() { VendorID = se.ActiveVendorID, CategoryID = categoryID }.List<MenuItem>(db, "VendorID,CategoryID", null, "Name ASC");

                return LIST(list);
            }
        }

        [HttpGet("get/public")]
        public IActionResult GetPublic([FromQuery] long vendorID, [FromQuery] long id)
        {

            using(var db = new Database())
            {
                var item = new MenuItem() { VendorID = vendorID, ID = id };
                
                if(!item.Select(db, "ID,VendorID"))
                    return BASE(3, "Menu Item not found.");

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

                var item = new MenuItem() { VendorID = se.ActiveVendorID, ID = id };
                
                if(!item.Select(db, "ID,VendorID"))
                    return BASE(3, "Menu Item not found.");

                return ITEM(item);
            }
        }

        [HttpPost("save")]
        public IActionResult PostSave([FromBody] MenuItem req)
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

                var category = MenuCategory.GetFromID<MenuCategory>(db, req.CategoryID);
                if(category == null)
                    return BASE(3, "Category not found.");

                if(category.VendorID != vendor.ID)
                    return BASE(3, "This category is not for your vendor.");

                req.ImageID = 0;
                req.ImageURL = null;
                if(req.Images.Count > 0)
                {
                    foreach(var i in req.Images)
                    {
                        if(!i.Select(db, "ID"))
                            continue;
                        if(req.ImageID == 0)
                        {
                            req.ImageID = i.ID;
                            req.ImageURL = i.ThumbUrl;
                        }
                    }
                }
                
                req.CreatedByUserID = CurrentUser.ID;
                req.ID = req.Save(db);

                return ITEM(req);
            }
        }
    }
}