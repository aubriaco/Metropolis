/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System.Text.RegularExpressions;
using Marketplace.Models.Responses;
using Marketplace.Util;
using Marketplace.Util.Models;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.API;
using MarketplaceData.Util;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Marketplace.Controllers.API
{
    [ApiController]
    [Route("api/integration")]
    public class IntegrationController : BaseController
    {
        public async Task<Token> GetTokenAsync()
        {
            if (string.IsNullOrEmpty(Request.Headers.Authorization))
                throw new Exception("No authorization header found.");
            if (!((string)Request.Headers.Authorization).StartsWith("Bearer "))
                throw new Exception("Invalid authorization header.");
            var bearer = ((string)Request.Headers.Authorization).Substring(7);
            using (var db = await Database.CreateAsync())
            {
                var token = new Token() { Bearer = bearer };
                if (!token.Select(db, "Bearer"))
                    throw new Exception("Invalid token.");

                return token;
            }
        }

        [HttpPost("vendor/sync")]
        public async Task<IActionResult> PostVendorSync([FromBody] Vendor req)
        {
            Token token;
            try
            {
                token = await GetTokenAsync();
            }
            catch (Exception ex)
            {
                return Unauthorized(new BaseResponse(1, ex.Message));
            }

            if (string.IsNullOrWhiteSpace(req.Name))
                return BadRequest(new BaseResponse(2, "Please fill in a vendor name."));

            req.Name = req.Name.Trim();
            if (req.Address == null)
                return BadRequest(new BaseResponse(2, "Address is required."));

            if (string.IsNullOrEmpty(req.ExternalMerchantID))
                return BadRequest(new BaseResponse(2, "ExternalMerchantID is required."));


            if (!req.Address.ValidateBlanks())
                return BadRequest(new BaseResponse(2, "Address fields are required."));

            if (req.UserInfo == null)
                return BadRequest(new BaseResponse(2, "UserInfo is required."));

            // UserInfo Validate
            if (string.IsNullOrWhiteSpace(req.UserInfo.Email))
                return BadRequest(new BaseResponse(1, "UserInfo Email is blank."));
            req.UserInfo.Email = req.UserInfo.Email.Trim().ToLower();
            req.UserInfo.Username = req.UserInfo.Email;
            if (req.UserInfo.Email.Length < 4)
                return BadRequest(new BaseResponse(1, "Email must be at least 4 characters long."));

            //if (!MailUtil.EmailIsOK(req.UserInfo.Email))
            //    return BadRequest(new BaseResponse(2, "Email is invalid or uses a blocked provider."));

            if (req.UserInfo.Address == null)
                req.UserInfo.Address = req.Address;

            if (string.IsNullOrEmpty(req.UserInfo.Phone))
                req.UserInfo.Phone = req.Phone;

            // Tax

            if (string.IsNullOrWhiteSpace(req.TaxID))
                return BadRequest(new BaseResponse(4, "TaxID is blank."));

            if (string.IsNullOrWhiteSpace(req.TaxType))
                return BadRequest(new BaseResponse(4, "TaxType is blank."));

            if (req.TaxType != "CORP" && req.TaxType != "SOLE-PROP")
                return BadRequest(new BaseResponse(4, "TaxType must be either CORP or SOLE-PROP."));


            req.TaxID = req.TaxID.Replace(" ", "").Replace("-", "");

            var matches = Regex.Matches(req.TaxID, "[^0-9]");

            if (matches.Count != 0)
                return BadRequest(new BaseResponse(4, "TaxID must be numeric."));

            //if (req.TaxID.Length < 9)
            //    return BadRequest(new BaseResponse(4, "TaxID must be at least 9 digits."));

            if (req.Products == null)
                return BadRequest(new BaseResponse(4, "Products is required. Null not allowed."));

            if(req.Products.Count == 0)
                return BadRequest(new BaseResponse(4, "Products is required. Empty array not allowed."));

            using (var db = await Database.CreateAsync())
            {

                if(await req.SelectAsync(db, "ExternalMerchantID"))
                {

                    var user2 = new User(){Email = req.UserInfo.Email};
                    if(!await user2.SelectAsync(db, "Email"))
                        return BadRequest(new BaseResponse(2, "Vendor already exists with this ExternalMerchantID but user does not exist. Please contact support."));

                    var uv2 = new UserVendor()
                    {
                        UserID = user2.ID,
                        VendorID = req.ID
                    };

                    if (!await uv2.SelectAsync(db, "UserID,VendorID"))
                        return BadRequest(new BaseResponse(2, "Vendor already exists with this ExternalMerchantID but user is not linked to merchant. Please contact support."));

                    await SessionExtra.SaveUpdateAsync(db, user2, new Dictionary<string, object>() { { "ActiveVendorID", req.ID } });

                    var inses2 = new InboundSession(Config.I.AppUrl)
                    {
                        UserID = user2.ID,
                        VendorID = req.ID
                    };
                    inses2.ID = inses2.Insert(db);

                    return ITEM(inses2);
                }

                //var test = db.GetVendorByName(req.Name);
                //if (test != null)
                //    return BadRequest(new BaseResponse(3, "Vendor name is already taken."));

                var user = req.UserInfo;

                if (await user.SelectAsync(db, "Email"))
                    return BadRequest(new BaseResponse(2, "Email already is registered."));
                if (await user.SelectAsync(db, "Username"))
                    return BadRequest(new BaseResponse(2, "Username is already registered."));

                var catList = new Category().List<Category>(db);

                var catNameList = new List<string>();

                foreach (var c in catList)
                {
                    catNameList.Add(c.Name.ToUpper());
                }

                int idx = 0, imgIdx = 0;
                foreach (var p in req.Products)
                {
                    if (string.IsNullOrEmpty(p.Name))
                        return BadRequest(new BaseResponse(4, "Product name is required. Product Index: " + idx));

                    Category? cat = null;

                    if(!string.IsNullOrEmpty(p.CategoryName))
                        cat = catList.Find(a => a.Name.ToUpper() == p.CategoryName.Trim().ToUpper());

                    if (cat == null)
                        cat = new Category();
                    //    return BadRequest(new BaseResponse(4, "Product category '" + p.CategoryName + "' not found. Product Index: " + idx + " Must be one of: \"" + string.Join("\",\"", catNameList) + "\""));

                    if (p.Images == null)
                        return BadRequest(new BaseResponse(4, "Product images is required. Send an empty array if none. Product Index: " + idx));

                    imgIdx = 0;
                    foreach (var i in p.Images)
                    {
                        if (string.IsNullOrEmpty(i.InputUrl) && string.IsNullOrEmpty(i.Base64Content))
                            return BadRequest(new BaseResponse(4, "Product image URL or base64 content is required. Product Index: " + idx + " Image Index: " + imgIdx));

                        imgIdx++;
                    }

                    p.CategoryID = cat.ID;
                    idx++;
                }


                user.Password = "unset-" + Guid.NewGuid().ToString();
                user.AddressID = user.Address.Insert(db);
                user.IsVendor = true;
                user.ID = user.Insert(db);

                user.Password = null;

                GeneralUtil.GenerateVendorIdent(db, req);


                req.Address.MasterID = Guid.NewGuid().ToString();
                req.AddressID = req.Address.Insert(db);
                req.CreatedByUserID = user.ID;
                req.CreatedDate = DateTime.UtcNow;
                req.ID = req.Insert(db);

                var uv = new UserVendor
                {
                    UserID = user.ID,
                    VendorID = req.ID
                };
                uv.Insert(db);



                using (var redis = await RedisUtil.CreateAsync())
                {

                    foreach (var p in req.Products)
                    {

                        GeneralUtil.GenerateProductIdent(db, p);

                        p.IsActive = false;
                        p.VendorID = req.ID;

                        if (p.SelectID(db, "Name,VendorID"))
                            continue;

                        p.IsFeatured = false;
                        p.ReviewCount = 0;
                        p.Rating = 0;
                        p.CreatedByUserID = user.ID;
                        p.ID = p.Insert(db);
                        imgIdx = 0;
                        if (p.Images != null)
                        {
                            foreach (var i in p.Images)
                            {
                                if (!string.IsNullOrEmpty(i.InputUrl))
                                {
                                    i.Base64Content = null;
                                    i.ProductID = p.ID;
                                    i.OrderIndex = imgIdx;
                                    redis.Push(Config.ImageInputQueue, JsonConvert.SerializeObject(i));
                                }
                                else if (!string.IsNullOrEmpty(i.Base64Content))
                                {
                                    if (string.IsNullOrEmpty(i.MimeType))
                                        Console.WriteLine("Product image MimeType is required. Product Index: " + idx + " Image Index: " + imgIdx);
                                    if (string.IsNullOrEmpty(i.OriginalFileName))
                                        Console.WriteLine("Product image OriginalFileName is required. Product Index: " + idx + " Image Index: " + imgIdx);
                                    else
                                    {
                                        try
                                        {
                                            using (var ms = new MemoryStream(Convert.FromBase64String(i.Base64Content)))
                                            {
                                                var upload = StorageUtil.Put(ms, Guid.NewGuid().ToString(), i.MimeType, i.OriginalFileName, true, user.ID);
                                                i.Ident = upload.Ident;
                                                i.MimeType = upload.MimeType;
                                                i.OriginalFileName = upload.OriginalFileName;
                                                i.Ext = upload.Ext;
                                                i.UserID = user.ID;
                                            }

                                        }
                                        catch (Exception ex)
                                        {
                                            Console.WriteLine("Error saving image: " + ex.Message + " Product Index: " + idx + " Image Index: " + imgIdx);
                                            continue;
                                        }

                                        var pi = new ProductImage()
                                        {
                                            ProductID = p.ID,
                                            StorageItemID = i.ID,
                                            OrderIndex = imgIdx
                                        };
                                        pi.Insert(db);
                                    }

                                    i.Base64Content = null;
                                }

                                imgIdx++;

                            }
                        }
                    }
                }


                await AuditLog.WriteAsync(db, "Integration " + token.Name + " has created this user.", user.ID);

                MailUtil.SendUserInvite(user, Config.I.BaseUrl);

                MailUtil.Send(Config.I.GetJoinNotifyEmails(), "New user: " + user.Username, "User has registered in " + Config.I.AppName + " with username '" + user.Username + "' and email '" + user.Email + "'.");

                MailUtil.Send(Config.I.GetJoinNotifyEmails(), "New Vendor - " + req.Name, @"A new vendor has registered in " + Config.I.Title + @".<br /><br />
                                                                                        Vendor Name: " + req.Name + @"<br />
                                                                                        Vendor Identity: " + req.Ident + @"<br />
                                                                                        Submitter: " + user.Name + @"<br />
                                                                                        Address:<br />" + req.Address.ToString(true) + @"<br />
                                                                                        ", LinkUtil.Get("/admin/manage"), "Manage Vendors");
                await SessionExtra.SaveUpdateAsync(db, user, new Dictionary<string, object>() { { "ActiveVendorID", req.ID } });

                var inses = new InboundSession(Config.I.AppUrl)
                {
                    UserID = user.ID,
                    VendorID = req.ID
                };
                inses.ID = await inses.InsertAsync(db);

                return ITEM(inses);
            }
        }
    }
}