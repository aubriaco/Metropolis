/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Models.Responses;
using MarketplaceData;
using MarketplaceData.Models;
using Marketplace;
using Marketplace.Util;
using Microsoft.AspNetCore.Mvc;
using static StackExchange.Redis.Role;
using Marketplace.Util.Models;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : BaseController
    {

        // Vendors

        [HttpGet("vendor/list")]
        public async Task<IActionResult> GetVendors([FromQuery] int page = 1)
        {
            if (CurrentUser == null || !CurrentUser.IsAdmin)
                return Ok(new BaseResponse(1, "Forbidden."));

            using (var db = await Database.CreateAsync())
            {
                var vendors = new Vendor().List<Vendor>(db, "", null, "createddate DESC");

                return Ok(new ListResponse(vendors));
            }
        }

        [HttpGet("vendor/{masterId}")]
        public async Task<IActionResult> GetVendor([FromRoute] string masterId)
        {
            if (CurrentUser == null || !CurrentUser.IsAdmin)
                return Ok(new BaseResponse(1, "Forbidden."));

            using (var db = await Database.CreateAsync())
            {
                var item = MasterModel.GetFromMasterID<Vendor>(db, masterId);

                if (item == null)
                    return Ok(new BaseResponse(2, "Vendor not found."));

                item.PullChildren(db);

                item.UserInfo = new User() { ID = item.CreatedByUserID };
                item.UserInfo.Select(db, "ID");

                return Ok(new ItemResponse(item));
            }
        }

        [HttpGet("vendor/product/{masterId}/list")]
        public async Task<IActionResult> GetVendorProductList([FromRoute] string masterId)
        {
            if (CurrentUser == null || !CurrentUser.IsAdmin)
                return Ok(new BaseResponse(1, "Forbidden."));

            using (var db = await Database.CreateAsync())
            {
                var item = MasterModel.GetFromMasterID<Vendor>(db, masterId);

                if (item == null)
                    return Ok(new BaseResponse(2, "Vendor not found."));

                var list = new Product() { VendorID = item.ID }.List<Product>(db, "VendorID", null, "createddate DESC");
                return LIST(list);
            }
        }

        [HttpPost("vendor/approve")]
        public async Task<IActionResult> PostApproveVendors([FromBody] List<int> ids)
        {
            if (CurrentUser == null || !CurrentUser.IsAdmin)
                return Ok(new BaseResponse(1, "Forbidden."));

            using (var db = await Database.CreateAsync())
            {
                foreach(var i in ids)
                {
                    var item = MasterModel.GetFromID<Vendor>(db, i);
                    if(item != null)
                    {
                        item.IsActive = true;
                        item.IsDeclined = false;
                        item.Update(db, "IsActive,IsDeclined");

                        MailUtil.SendUsers(db.GetUsersTiedToVendor(item.ID), "Your store has been approved", "Your store <strong>" + item.Name + "</strong> has been approved in the Metropolis Marketplace.", LinkUtil.Get("/vendor/manage/" + item.MasterID), "Manage your store");
                    }
                }

                return Ok(new BaseResponse());
            }
        }


        [HttpPost("vendor/disable")]
        public async Task<IActionResult> PostDisableVendors([FromBody] List<int> ids)
        {
            if (CurrentUser == null || !CurrentUser.IsAdmin)
                return Ok(new BaseResponse(1, "Forbidden."));

            using (var db = await Database.CreateAsync())
            {
                foreach (var i in ids)
                {
                    var item = MasterModel.GetFromID<Vendor>(db, i);
                    if (item != null)
                    {
                        item.IsActive = false;
                        item.IsDeclined = false;
                        item.Update(db, "IsActive,IsDeclined");
                    }
                }

                return Ok(new BaseResponse());
            }
        }

        [HttpPost("vendor/decline")]
        public async Task<IActionResult> PostDeclineVendors([FromBody] List<int> ids)
        {
            if (CurrentUser == null || !CurrentUser.IsAdmin)
                return Ok(new BaseResponse(1, "Forbidden."));

            using (var db = await Database.CreateAsync())
            {
                foreach (var i in ids)
                {
                    var item = MasterModel.GetFromID<Vendor>(db, i);
                    if (item != null)
                    {
                        item.IsDeclined = true;
                        item.Update(db, "IsDeclined");
                    }
                }

                return Ok(new BaseResponse());
            }
        }

        // Products

        [HttpGet("vendor/{vendorID}/products")]
        public async Task<IActionResult> GetProducts([FromRoute] long vendorID)
        {
            if (CurrentUser == null || !CurrentUser.IsAdmin)
                return Ok(new BaseResponse(1, "Forbidden."));

            using (var db = await Database.CreateAsync())
            {
                var products = new Product() { VendorID = vendorID }.List<Product>(db, "VendorID", null, "createddate DESC");

                return Ok(new ListResponse(products));
            }
        }

        [HttpGet("product/{productMasterId}")]
        public async Task<IActionResult> GetProduct([FromRoute] string productMasterId)
        {
            if (CurrentUser == null || !CurrentUser.IsAdmin)
                return Ok(new BaseResponse(1, "Forbidden."));

            using (var db = await Database.CreateAsync())
            {
                var item = MasterModel.GetFromMasterID<Product>(db, productMasterId);

                if (item == null)
                    return Ok(new BaseResponse(2, "Product not found."));

                item.Images = db.GetProductImages(item.ID);

                var vendor = MasterModel.GetFromID<Vendor>(db, item.VendorID);
                if (vendor != null)
                    item.VendorMasterID = vendor.MasterID;

                return Ok(new ItemResponse(item));
            }
        }

        // Users

        [HttpGet("user/list")]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1)
        {
            if (CurrentUser == null || !CurrentUser.IsAdmin)
                return Ok(new BaseResponse(1, "Forbidden."));

            using (var db = await Database.CreateAsync())
            {
                var list = new User().List<User>(db, "", null, "createddate DESC");

                foreach(var i in list)
                {
                    i.Password = null;
                }

                return Ok(new ListResponse(list));
            }
        }
        [HttpGet("user/get/{masterId}")]
        public async Task<IActionResult> GetUser([FromRoute] string masterId)
        {
            if (CurrentUser == null || !CurrentUser.IsAdmin)
                return Ok(new BaseResponse(1, "Forbidden."));

            using (var db = await Database.CreateAsync())
            {
                var item = MasterModel.GetFromMasterID<User>(db, masterId);

                if (item == null)
                    return Ok(new BaseResponse(2, "User not found."));

                item.Password = null;

                return Ok(new ItemResponse(item));
            }
        }

        // Audit Log

        [HttpGet("auditlog/list")]
        public async Task<IActionResult> GetAuditLogList()
        {
            if (CurrentUser == null || !CurrentUser.IsAdmin)
                return Ok(new BaseResponse(1, "Forbidden."));

            using (var db = await Database.CreateAsync())
            {
                var list = AuditLog.GetList(db);

                return LIST(list);
            }
        }

        // Blog

        [HttpGet("blog/list")]
        public async Task<IActionResult> GetBlogList([FromQuery] int page = 1)
        {
            if (CurrentUser == null || !CurrentUser.IsAdmin)
                return Ok(new BaseResponse(1, "Forbidden."));

            using (var db = await Database.CreateAsync())
            {
                var list = new BlogPost().List<BlogPost>(db, "", null, "createddate DESC");

                return Ok(new ListResponse(list));
            }
        }

        [HttpGet("blog/get/{masterID}")]
        public async Task<IActionResult> GetBlogGet([FromRoute] string masterID)
        {
            if (CurrentUser == null || !CurrentUser.IsAdmin)
                return Ok(new BaseResponse(1, "Forbidden."));

            using (var db = await Database.CreateAsync())
            {
                var item = BlogPost.GetFromMasterID<BlogPost>(db, masterID);
                if(item == null)
                    return BASE(2, "Post not found.");
                item.PullChildren(db);
                return ITEM(item);
            }
        }

        [HttpPost("blog/save")]
        public async Task<IActionResult> PostBlogSave([FromBody] BlogPost req)
        {
            if (CurrentUser == null || !CurrentUser.IsAdmin)
                return Ok(new BaseResponse(1, "Forbidden."));

            if(!req.ValidateBlanks())
                return BASE(2, "Fields are missing.");

            using (var db = await Database.CreateAsync())
            {
                BlogPost item;
                if(req.ID != 0)
                {
                    item = new BlogPost() { ID = req.ID };
                    if(!item.Select(db, "ID"))
                        return BASE(3, "Post not found.");
                }     
                req.CreatedByUserID = CurrentUser.ID;
                req.Save(db);

                return ITEM(req);
            }
        }

        [HttpPost("blog/delete")]
        public async Task<IActionResult> PostBlogDelete([FromBody] BlogPost req)
        {
            if (CurrentUser == null || !CurrentUser.IsAdmin)
                return Ok(new BaseResponse(1, "Forbidden."));


            using (var db = await Database.CreateAsync())
            {
                BlogPost item;
                if(req.ID != 0)
                {
                    item = new BlogPost() { ID = req.ID };
                    if(!item.Select(db, "ID"))
                        return BASE(3, "Post not found.");
                }
                else
                    return BASE(3, "No ID specified.");

                item.DeleteFromId(db);

                return BASE();
            }
        }
    }
}
