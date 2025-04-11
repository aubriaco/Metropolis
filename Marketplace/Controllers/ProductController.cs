/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Models.Responses;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Util;
using Marketplace.Util;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/product")]
    public class ProductController : BaseController
    {
        [HttpPost("search")]
        public async Task<IActionResult> PostSearch([FromBody] SearchQuery req)
        {
            using (var db = await Database.CreateAsync())
            {
                if(!string.IsNullOrEmpty(req.CategoryIdent))
                {
                    string[] p;
                    if (req.CategoryIdent.Contains(','))
                        p = req.CategoryIdent.Split(',');
                    else
                        p = new string[] { req.CategoryIdent };
                    req.CategoryIDList = new List<long>();
                    foreach(var i in p)
                    {
                        var cat = new Category { Ident = i };
                        if (cat.Select(db, "Ident"))
                            req.CategoryIDList.Add(cat.ID);
                    }
                }

                var list = (List<ProductView>)db.GetProductSearch(req);
                var counter = (long)db.GetProductSearch(req, true);

                return Ok(new ListResponse(list, counter));
            }
        }

        [HttpGet("view")]
        public async Task<IActionResult> GetView([FromQuery] string ident)
        {
            using (var db = await Database.CreateAsync())
            {
                var product = new Product { Ident = ident.ToLower().Trim() };
                if (!product.Select(db, "Ident"))
                    return Ok(new BaseResponse(4, "Product not found."));

                if (product.IsDeleted)
                    return BASE(7, "This product has been removed by the vendor.");

                bool requireActive = true;

                if (CurrentUser != null)
                {
                    if(CurrentUser.IsAdmin)
                        requireActive = false;
                    else if(CurrentUser.IsVendor)
                    {
                        var uv = new UserVendor()
                        {
                            UserID = CurrentUser.ID,
                            VendorID = product.VendorID
                        };
                        if (uv.Select(db, "UserID,VendorID"))
                            requireActive = false;
                    }
                }

                var vendor = new Vendor() { ID = product.VendorID };
                if (!vendor.Select(db, "ID"))
                    return Ok(new BaseResponse(5, "Vendor does not exist."));
                product.Vendor = vendor.GetView<VendorView>();

                if (requireActive)
                {
                    if (!product.IsActive)
                        return Ok(new BaseResponse(4, "Product not active."));

                    if(!vendor.IsActive)
                        return Ok(new BaseResponse(6, "Vendor not active."));
                }

                var cat = new Category() { ID = product.CategoryID };
                if (cat.Select(db, "ID"))
                    product.CategoryName = cat.Name;
                product.Category = cat;

                product.Images = db.GetProductImages(product.ID);
                product.Tags = db.GetProductTagStrings(product.ID);

                return Ok(new ItemResponse(product.GetView<ProductView>()));
            }
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetList([FromQuery] long vendorId = 0, [FromQuery] string? vendorMasterId = null, [FromQuery] bool isService = false, [FromQuery] bool showHidden = false)
        {
            using (var db = await Database.CreateAsync())
            {
                Vendor? vendor = null;
                if(vendorMasterId != null)
                {
                    vendor = Vendor.GetFromMasterID<Vendor>(db, vendorMasterId);
                    if (vendor == null)
                        return Ok(new BaseResponse(4, "Could not find vendor."));
                    vendorId = vendor.ID;
                }

                if(vendorId == 0)
                    return Ok(new BaseResponse(5, "Could not find vendor."));
                else if(vendor == null)
                {
                    vendor = Vendor.GetFromID<Vendor>(db, vendorId);
                    if (vendor == null)
                        return Ok(new BaseResponse(4, "Could not find vendor."));

                    if(showHidden)
                    {
                        if(CurrentUser == null || !vendor.CanEdit(db, CurrentUser))
                            return Ok(new BaseResponse(6, "No access to vendor."));
                    }
                }


                var list = db.GetProducts(vendorId, isService, showHidden);

                return Ok(new ListResponse(list));
            }
        }

        [HttpGet("featured/top")]
        public async Task<IActionResult> GetFeaturedTop()
        {
            using (var db = await Database.CreateAsync())
            {
                var list = Product.GetFeaturedTop(db);
                return LIST(list);
            }
        }

        [HttpGet("item")]
        public async Task<IActionResult> GetItem([FromQuery] string masterId)
        {
            using (var db = await Database.CreateAsync())
            {
                var product = MasterModel.GetFromMasterID<Product>(db, masterId);
                if (product == null)
                    return Ok(new BaseResponse(4, "Product not found."));


                product.Images = db.GetProductImages(product.ID);
                product.Tags = db.GetProductTagStrings(product.ID);

                return Ok(new ItemResponse(product));
            }
        }

        [HttpPost("save")]
        public async Task<IActionResult> PostSave([FromBody] Product req)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            req.Description = GeneralUtil.FilterDescriptionHTML(req.Description);
            req.ShortDescription = GeneralUtil.FilterDescriptionHTML(req.ShortDescription);

            using (var db = await Database.CreateAsync())
            {
                Product? item;

                if(req.ID != 0)
                {
                    item = MasterModel.GetFromID<Product>(db, req.ID);
                    if (item == null)
                        return Ok(new BaseResponse(2, "Product not found."));
                    if (!UserUtil.CanManageVendor(db, CurrentUser.ID, item.VendorID))
                        return Ok(new BaseResponse(3, "No access to vendor."));

                    item.PopulateFromModel(req);

                    if(req.IsActive && string.IsNullOrEmpty(item.Ident))
                        GeneralUtil.GenerateProductIdent(db, item);

                    item.Update(db);
                }
                else
                {
                    if(!UserUtil.CanManageVendor(db, CurrentUser.ID, req.VendorID))
                        return Ok(new BaseResponse(3, "No access to vendor."));

                    item = new Product();
                    item.PopulateFromModel(req);
                    item.VendorID = req.VendorID;

                    if (req.IsActive)
                        GeneralUtil.GenerateProductIdent(db, item);


                    item.ID = item.Insert(db);
                }


                db.Clean("productimage", "productid", item.ID);
                int orderIndex = 0;
                StorageItem? displayImage = null;

                if (req.Images != null)
                {
                    foreach (var i in req.Images)
                    {
                        if (displayImage == null)
                            displayImage = i;
                        var pi = new ProductImage();
                        pi.ProductID = item.ID;
                        pi.StorageItemID = i.ID;
                        pi.OrderIndex = orderIndex;
                        pi.Insert(db);
                        orderIndex++;
                    }
                }
                if (displayImage != null)
                {
                    item.DisplayImageStorageItemID = displayImage.ID;
                    item.DisplayImageUrl = displayImage.ThumbUrl ?? displayImage.Url;
                    item.Update(db, "DisplayImageStorageItemID,DisplayImageUrl");
                }


                db.Clean("producttag", "productid", item.ID);
                if (req.Tags != null)
                {
                    foreach (var i in req.Tags)
                    {
                        var pt = new ProductTag();
                        pt.ProductID = item.ID;
                        pt.TagName = i.ToLower();
                        pt.Insert(db);
                    }
                }

                item.Images = req.Images;
                item.Tags = req.Tags;

                return Ok(new ItemResponse(item));
            }

        }

        [HttpPost("delete")]
        public async Task<IActionResult> PostDelete([FromBody] Product req)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            using (var db = await Database.CreateAsync())
            {
                Product? item;

                if (req.ID != 0)
                {
                    item = MasterModel.GetFromID<Product>(db, req.ID);
                    if (item == null)
                        return Ok(new BaseResponse(2, "Product not found."));
                    if (!UserUtil.CanManageVendor(db, CurrentUser.ID, item.VendorID))
                        return Ok(new BaseResponse(3, "No access to vendor."));

                    item.IsDeleted = true;

                    item.Update(db, "IsDeleted");
                    return BASE();
                }
                else
                    return BASE(2, "Product not found.");
            }
        }
    }
}
