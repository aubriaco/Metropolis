/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Models.Responses;
using Marketplace.Util;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Util;
using Marketplace;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Dynamic;
using System.Text.RegularExpressions;
using System;
using MarketplaceData.Models.WaiterNet;
using System.Text.Json;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/vendor")]
    public class VendorController : BaseController
    {
        [HttpGet("global")]
        public async Task<IActionResult> GetGlobal()
        {
            dynamic o = new ExpandoObject();
            o.requiredDocumentCount = Vendor.RequiredDocumentCount;
            return Ok(new ItemResponse(o));
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetList()
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            using (var db = await Database.CreateAsync())
            {
                var list = db.GetVendorsByUserID(CurrentUser.ID);
                return Ok(new ListResponse(list.GetView<VendorView>()));
            }
        }

        [HttpGet("get")]
        public async Task<IActionResult> Get([FromQuery] string? masterId = null, [FromQuery] bool manage = false, [FromQuery] string? ident = null, [FromQuery] long? id = 0)
        {
            using (var db = await Database.CreateAsync())
            {
                var vendor = new Vendor();

                if(id != null && (long)id != 0)
                {
                    vendor.ID = (long)id;
                    if (!vendor.Select(db, "ID"))
                        return BASE(4, "Not found.");
                }
                else if (!string.IsNullOrEmpty(ident))
                {
                    vendor.Ident = ident;
                    if (!vendor.Select(db, "Ident"))
                        return BASE(4, "Not found.");

                }
                else
                {
                    if (string.IsNullOrEmpty(masterId))
                        return BASE(6, "No ID specified.");

                    vendor.MasterID = masterId;

                    if (!vendor.Select(db, "MasterID"))
                        return BASE(4, "Not found.");
                }

                if (manage)
                {
                    if(CurrentUser == null)
                        return BASE(5, "Not logged in.");
                    var uv = new UserVendor();
                    uv.UserID = CurrentUser.ID;
                    uv.VendorID = vendor.ID;
                    if (uv.Select(db, "UserID,VendorID"))
                    {
                        vendor.Address = MasterModel.GetFromID<Address>(db, vendor.AddressID);
                        vendor.Documents = new VendorDocument() { VendorID = vendor.ID }.List<VendorDocument>(db, "VendorID");
                        return Ok(new ItemResponse(vendor.GetView<VendorView>()));
                    }
                    else
                        return BASE(5, "No access.");
                }
                else // guest
                    return Ok(new ItemResponse(vendor.GetView<VendorView>()));
            }

        }

        [HttpGet("get/active")]
        public async Task<IActionResult> GetActive()
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            using (var db = await Database.CreateAsync())
            {
                var se = SessionExtra.Get(db, CurrentUser);
                if (se == null)
                    return BASE(3, "Session extra not present.");

                var vendor = Vendor.GetFromID<Vendor>(db, se.ActiveVendorID);
                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                vendor.PullChildren(db);

                if (Config.I.ApplicationID == 7)
                {
                    var settings = new WaiterVendorSettings() { VendorID = vendor.ID };
                    settings.Select(db, "VendorID");
                    vendor.Settings = settings;
                }

                return ITEM(vendor);
            }
        }

        [HttpPost("set/active")]
        public async Task<IActionResult> PostSetActive([FromBody] Vendor req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            using (var db = await Database.CreateAsync())
            {
                var vendor = Vendor.GetFromID<Vendor>(db, req.ID);
                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                var se = SessionExtra.Get(db, CurrentUser);
                if (se == null)
                    se = new SessionExtra() { UserID = CurrentUser.ID };
                se.ActiveVendorID = vendor.ID;
                if (se.ID != 0)
                    se.Update(db, "ActiveVendorID");
                else
                    se.ID = se.Insert(db);

                return ITEM(vendor);
            }
        }

        [HttpGet("get/public")]
        public async Task<IActionResult> GetPublic([FromQuery] long id)
        {
            using (var db = await Database.CreateAsync())
            {
                var vendor = Vendor.GetFromID<Vendor>(db, id);
                if (vendor == null)
                    return BASE(4, "Not found.");
                return ITEM(vendor.GetView<VendorView>());
            }
        }

        [HttpPost("settings/save")]
        public async Task<IActionResult> PostSettingsSave([FromBody] Vendor req)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            using (var db = await Database.CreateAsync())
            {
                if (!new UserVendor() { UserID = CurrentUser.ID, VendorID = req.ID }.Select(db, "UserID,VendorID"))
                    return Ok(new BaseResponse(2, "Not a vendor admin."));

                var vendor = new Vendor();
                vendor.ID = req.ID;

                if (!vendor.Select(db, "ID"))
                    return Ok(new BaseResponse(4, "Not found."));

                var test = db.GetVendorByName(req.Name);
                if (test != null && test.ID != vendor.ID)
                    return Ok(new BaseResponse(3, "Vendor name is already taken."));


                string update = "Name,Description,Phone,Email";

                if (!string.IsNullOrEmpty(req.Ident))
                {
                    req.Ident = GeneralUtil.GenerateIdent(req.Ident);
                    if (vendor.Ident != req.Ident)
                    {
                        if (new Vendor() { Ident = req.Ident }.SelectID(db, "Ident"))
                        {
                            return BASE(5, "Vendor URL is already taken.");
                        }
                        else
                        {
                            vendor.Ident = req.Ident;
                            update += ",Ident";
                        }
                    }
                }

                if (vendor.ImageIdent != req.ImageIdent)
                {
                    vendor.ImageIdent = req.ImageIdent;
                    update += ",ImageIdent";
                }

                if(vendor.CoverImageIdent != req.CoverImageIdent)
                {
                    vendor.CoverImageIdent = req.CoverImageIdent;
                    update += ",CoverImageIdent";
                }

                if(!string.IsNullOrEmpty(req.DeliverySettingsJsonData))
                {
                    vendor.DeliverySettingsJsonData = req.DeliverySettingsJsonData;
                    update += ",DeliverySettingsJsonData";
                }

                vendor.Name = req.Name;
                vendor.Email = req.Email;
                vendor.Phone = req.Phone;
                vendor.Description = req.Description;
                vendor.Update(db, update);

                if (req.Address != null)
                {
                    req.Address.ID = vendor.AddressID;
                    req.Address.Update(db);
                }

                if (Config.I.ApplicationID == 7 && req.Settings != null)
                {

                    var settings = JsonConvert.DeserializeObject<WaiterVendorSettings>(((JsonElement)req.Settings).GetRawText());
                    if (settings != null)
                    {
                        settings.VendorID = vendor.ID;
                        if (settings.SelectID(db, "VendorID"))
                            settings.Update(db);
                        else
                            settings.ID = settings.Insert(db);
                        vendor.Settings = settings;
                    }
                }

                vendor.PullChildren(db);
                
                return Ok(new ItemResponse(vendor));
            }
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard([FromQuery] string masterId)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            using (var db = await Database.CreateAsync())
            {
                var vendor = new Vendor();
                vendor.MasterID = masterId;
                if (!vendor.Select(db, "MasterID"))
                    return Ok(new BaseResponse(4, "Not found."));
                if (!new UserVendor() { UserID = CurrentUser.ID, VendorID = vendor.ID }.Select(db, "UserID,VendorID"))
                    return Ok(new BaseResponse(2, "Not a vendor admin."));

                var dash = new Dashboard();
                dash.TotalOrderCount = 0;
                dash.ProcessedOrderCount = 0;
                dash.ConfirmedOrderCount = 0;

                return Ok(new ItemResponse(dash));
            }

        }

        [HttpPost("documents/add")]
        public async Task<IActionResult> PostDocumentsAdd([FromBody] VendorDocument req)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            using (var db = await Database.CreateAsync())
            {
                if (!new UserVendor() { UserID = CurrentUser.ID, VendorID = req.VendorID }.Select(db, "UserID,VendorID"))
                    return Ok(new BaseResponse(2, "Not a vendor admin."));

                var vdlist = new VendorDocument() { VendorID = req.VendorID, Accepted = false }.List<VendorDocument>(db, "VendorID,Accepted");
                if (vdlist.Count >= VendorDocument.MaxDocumentCount)
                    return Ok(new BaseResponse(2, "You have reached the max amount of pending documents."));

                req.Accepted = false;
                req.ID = req.Insert(db);

                return Ok(new BaseResponse());
            }
        }

        [HttpGet("documents/remove")]
        public async Task<IActionResult> PostDocumentsRemove([FromQuery] string docMasterId)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));
            using (var db = await Database.CreateAsync())
            {
                var item = MasterModel.GetFromMasterID<VendorDocument>(db, docMasterId);

                if (item == null)
                    return Ok(new BaseResponse(3, "Document not found."));

                if (!new UserVendor() { UserID = CurrentUser.ID, VendorID = item.VendorID }.Select(db, "UserID,VendorID"))
                    return Ok(new BaseResponse(2, "Not a vendor admin."));

                if (item.Accepted)
                    return Ok(new BaseResponse(4, "Accepted documents can not be deleted."));


                item.DeleteFromId(db);

                StorageItem si = new StorageItem() { ID = item.StorageItemID };
                if (si.Select(db, "ID"))
                {
                    StorageUtil.Delete(si.Ident);
                }
                return Ok(new BaseResponse());
            }
        }

        private bool HasPending(Database db)
        {
            if (CurrentUser == null)
                return false;
            var test = new Vendor() { CreatedByUserID = CurrentUser.ID, IsActive = false, IsDeclined = false };
            if (test.Select(db, "CreatedByUserID,IsActive,IsDeclined"))
                return true;
            return false;
        }


        // 0
        [HttpPost("new")]
        public async Task<IActionResult> PostNew([FromBody] Vendor req)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            if (string.IsNullOrWhiteSpace(req.Name))
                return Ok(new BaseResponse(2, "Please fill in a name."));



            req.Name = req.Name.Trim();

            using (var db = await Database.CreateAsync())
            {
                if (HasPending(db))
                    return Ok(new BaseResponse(3, "You already have a vendor in pending review status."));

                var test = db.GetVendorByName(req.Name);
                if (test != null)
                    return Ok(new BaseResponse(3, "Vendor name is already taken."));



            }

            using (var redis = await RedisUtil.CreateAsync())
            {
                string ident = Guid.NewGuid().ToString();
                req.Step = 1;
                redis.Put(ident, JsonConvert.SerializeObject(req), DateTime.UtcNow.AddHours(1));
                HttpContext.Response.Cookies.Append("CM-NewVendor", ident);
                return Ok(new ItemResponse(ident));
            }
        }

        // 1
        [HttpPost("address")]
        public async Task<IActionResult> PostAddress([FromBody] Address req)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            using (var redis = await RedisUtil.CreateAsync())
            {
                string? sid = HttpContext.Request.Cookies["CM-NewVendor"];
                if (string.IsNullOrEmpty(sid))
                    return Ok(new BaseResponse(2, "Invalid session id."));

                string data = redis.Get(sid);

                if (string.IsNullOrEmpty(data))
                    return Ok(new BaseResponse(1, "Session not found."));

                if (!req.ValidateBlanks())
                    return BASE(4, "Some inputs are blank.");

                var item = JsonConvert.DeserializeObject<Vendor>(data);
                if (item.Step != 1)
                    return Ok(new BaseResponse(3, "Invalid session data."));
                item.Step = 2;
                item.Address = req;
                redis.Put(sid, JsonConvert.SerializeObject(item), DateTime.UtcNow.AddHours(1));
                HttpContext.Response.Cookies.Append("CM-NewVendor", sid);
                return Ok(new ItemResponse(sid));
            }
        }

        // 2
        [HttpPost("biz")]
        public async Task<IActionResult> PostBiz([FromBody] Vendor req)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            using (var redis = await RedisUtil.CreateAsync())
            {
                string? sid = HttpContext.Request.Cookies["CM-NewVendor"];
                if (string.IsNullOrEmpty(sid))
                    return Ok(new BaseResponse(2, "Invalid session id."));

                string data = redis.Get(sid);

                if (string.IsNullOrEmpty(data))
                    return Ok(new BaseResponse(1, "Session not found."));

                var item = JsonConvert.DeserializeObject<Vendor>(data);
                if (item.Step != 2)
                    return Ok(new BaseResponse(3, "Invalid session data."));

                if (string.IsNullOrWhiteSpace(req.TaxID))
                    return Ok(new BaseResponse(4, "TaxID is blank."));

                if (string.IsNullOrWhiteSpace(req.TaxType))
                    return Ok(new BaseResponse(4, "TaxType is blank."));


                req.TaxID = req.TaxID.Replace(" ", "").Replace("-", "");

                var matches = Regex.Matches(req.TaxID, "[^0-9]");

                if (matches.Count != 0)
                    return Ok(new BaseResponse(4, "TaxID must be numeric."));

                if (req.TaxID.Length < 9)
                    return Ok(new BaseResponse(4, "TaxID must be at least 9 digits."));

                item.Step = 5;
                item.TaxID = req.TaxID;
                item.TaxType = req.TaxType;
                redis.Put(sid, JsonConvert.SerializeObject(item), DateTime.UtcNow.AddHours(1));
                HttpContext.Response.Cookies.Append("CM-NewVendor", sid);
                return Ok(new ItemResponse(sid));
            }
        }

        // 5
        [HttpPost("documents")]
        public async Task<IActionResult> PostDocuments([FromBody] Vendor req)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            using (var redis = await RedisUtil.CreateAsync())
            {
                string? sid = HttpContext.Request.Cookies["CM-NewVendor"];
                if (string.IsNullOrEmpty(sid))
                    return Ok(new BaseResponse(2, "Invalid session id."));

                string data = redis.Get(sid);

                if (string.IsNullOrEmpty(data))
                    return Ok(new BaseResponse(1, "Session not found."));

                var item = JsonConvert.DeserializeObject<Vendor>(data);
                if (item == null)
                    return Ok(new BaseResponse(3, "Invalid session data."));
                if (item.Step != 5)
                    return Ok(new BaseResponse(4, "Invalid session data."));

                item.Documents = new List<VendorDocument>();

                if (req.Documents == null)
                    return Ok(new BaseResponse(5, "Documents is null."));

                foreach (var i in req.Documents)
                {
                    item.Documents.Add(i);
                }

                item.Step = 6;

                redis.Put(sid, JsonConvert.SerializeObject(item), DateTime.UtcNow.AddHours(1));
                HttpContext.Response.Cookies.Append("CM-NewVendor", sid);
                return Ok(new ItemResponse(sid));
            }
        }

        // 6 & 7
        [HttpPost("terms")]
        public async Task<IActionResult> PostTerms([FromBody] Vendor req)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            using (var redis = await RedisUtil.CreateAsync())
            {
                string? sid = HttpContext.Request.Cookies["CM-NewVendor"];
                if (string.IsNullOrEmpty(sid))
                    return Ok(new BaseResponse(2, "Invalid session id."));

                string data = redis.Get(sid);

                if (string.IsNullOrEmpty(data))
                    return Ok(new BaseResponse(1, "Session not found."));


                var item = JsonConvert.DeserializeObject<Vendor>(data);
                if (item == null)
                    return Ok(new BaseResponse(3, "Invalid session data."));
                if (item.Step != 5)
                    return Ok(new BaseResponse(4, "Invalid session data."));

                if (!req.IsAgreeTerms)
                    return Ok(new BaseResponse(5, "You must agree to the terms."));
                item.Step = 10;
                item.IsAgreeTerms = req.IsAgreeTerms;
                redis.Put(sid, JsonConvert.SerializeObject(item), DateTime.UtcNow.AddHours(1));
                HttpContext.Response.Cookies.Append("CM-NewVendor", sid);
                return Ok(new ItemResponse(sid));
            }
        }

        [HttpPost("submit")]
        public async Task<IActionResult> PostSubmit()
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            using (var redis = await RedisUtil.CreateAsync())
            {
                string? sid = HttpContext.Request.Cookies["CM-NewVendor"];
                if (string.IsNullOrEmpty(sid))
                    return Ok(new BaseResponse(2, "Invalid session id."));

                string data = redis.Get(sid);

                if (string.IsNullOrEmpty(data))
                    return Ok(new BaseResponse(1, "Session not found."));

                var item = JsonConvert.DeserializeObject<Vendor>(data);
                if (item == null)
                    return Ok(new BaseResponse(2, "Invalid session data."));
                if (item.Address == null)
                    return Ok(new BaseResponse(4, "Address is null."));
                if (item.Step < 10)
                    return Ok(new BaseResponse(3, "Not all steps are complete."));

                using (var db = await Database.CreateAsync())
                {
                    item.AddressID = item.Address.Insert(db);
                    item.CreatedByUserID = CurrentUser.ID;
                    item.CreatedDate = DateTime.UtcNow;
                    GeneralUtil.GenerateVendorIdent(db, item);
                    item.ID = item.Insert(db);
                    redis.Delete(sid);

                    var uv = new UserVendor();
                    uv.UserID = CurrentUser.ID;
                    uv.VendorID = item.ID;
                    uv.Insert(db);

                    int docCount = 0;

                    if (item.Documents != null)
                    {
                        foreach (var i in item.Documents)
                        {
                            i.VendorID = item.ID;
                            i.Accepted = false;
                            i.Insert(db);
                            docCount++;
                        }
                    }

                    CurrentUser.IsVendor = true;
                    CurrentUser.Update(db, "IsVendor");
                    UserUtil.UpdateSession(CurrentUser);

                    if (Config.I != null)
                        MailUtil.Send(Config.I.GetJoinNotifyEmails(), "New Vendor - " + item.Name, @"A new vendor has registered in " + Config.I.Title + @".<br /><br />
                                                                                        Vendor Name: " + item.Name + @"<br />
                                                                                        Vendor Identity: " + item.Ident + @"<br />
                                                                                        Submitter: " + CurrentUser.Name + @"<br />
                                                                                        # of Documents Uploaded: " + docCount + @"<br />
                                                                                        Address:<br />" + item.Address.ToString(true) + @"<br />
                                                                                        ", LinkUtil.Get("/admin/manage"), "Manage Vendors");

                    await SessionExtra.SaveUpdateAsync(db, CurrentUser, new Dictionary<string, object>() { { "ActiveVendorID", item.ID } });
                    return Ok(new ItemResponse(item));
                }
            }
        }

        [HttpPost("submit/basic")]
        public async Task<IActionResult> PostSubmitBasic([FromBody] Vendor req)
        {
            if (Config.I.ApplicationID != 7)
                return BASE(-1, "Not available in application.");
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));


            var item = req;
            if (item == null)
                return Ok(new BaseResponse(2, "Invalid session data."));
            if (item.Address == null)
                return Ok(new BaseResponse(4, "Address is null."));

            using (var db = await Database.CreateAsync())
            {
                item.AddressID = item.Address.Insert(db);
                item.CreatedByUserID = CurrentUser.ID;
                item.CreatedDate = DateTime.UtcNow;
                GeneralUtil.GenerateVendorIdent(db, item);
                item.ID = item.Insert(db);

                var uv = new UserVendor();
                uv.UserID = CurrentUser.ID;
                uv.VendorID = item.ID;
                uv.Insert(db);

                int docCount = 0;

                if (item.Documents != null)
                {
                    foreach (var i in item.Documents)
                    {
                        i.VendorID = item.ID;
                        i.Accepted = false;
                        i.Insert(db);
                        docCount++;
                    }
                }

                CurrentUser.IsVendor = true;
                CurrentUser.Update(db, "IsVendor");
                UserUtil.UpdateSession(CurrentUser);

                if (Config.I != null)
                    MailUtil.Send(Config.I.GetJoinNotifyEmails(), "New Vendor - " + item.Name, @"A new vendor has registered in " + Config.I.Title + @".<br /><br />
                                                                                        Vendor Name: " + item.Name + @"<br />
                                                                                        Vendor Identity: " + item.Ident + @"<br />
                                                                                        Submitter: " + CurrentUser.Name + @"<br />
                                                                                        # of Documents Uploaded: " + docCount + @"<br />
                                                                                        Address:<br />" + item.Address.ToString(true) + @"<br />
                                                                                        ", LinkUtil.Get("/admin/manage"), "Manage Vendors");

                await SessionExtra.SaveUpdateAsync(db, CurrentUser, new Dictionary<string, object>() { { "ActiveVendorID", item.ID } });
                return Ok(new ItemResponse(item));
            }

        }


        [HttpGet("session")]
        public async Task<IActionResult> GetSession()
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            using (var db = await Database.CreateAsync())
            {
                var vendor = new Vendor() { CreatedByUserID = CurrentUser.ID, IsActive = false };
                if (vendor.Select(db, "CreatedByUserID,IsActive"))
                    return Ok(new BaseResponse(3, "You already have a vendor '" + vendor.Name + "' that is pending review, please wait till this one gets approved before submitting a new entry."));
            }

            using (var redis = await RedisUtil.CreateAsync())
            {
                string? sid = HttpContext.Request.Cookies["CM-NewVendor"];

                if (string.IsNullOrEmpty(sid))
                    return Ok(new BaseResponse(2, "Invalid session id."));

                string data = redis.Get(sid);

                if (string.IsNullOrEmpty(data))
                    return Ok(new BaseResponse(1, "Session not found."));

                var item = JsonConvert.DeserializeObject<Vendor>(data);

                return Ok(new ItemResponse(item));
            }
        }

        [HttpGet("user/list")]
        public async Task<IActionResult> GetUserList([FromQuery] string masterID)
        {
            if(CurrentUser == null)
                return BASE(1, "Not logged in.");
            
            using(var db = await Database.CreateAsync())
            {
                var vendor = Vendor.GetFromMasterID<Vendor>(db, masterID);
                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                var list = MarketplaceData.Models.User.GetListByVendor(db, vendor.ID);

                return LIST(list);
            }
        }

        [HttpGet("user/invite/list")]
        public async Task<IActionResult> GetUserInviteList([FromQuery] string masterID)
        {
            if(CurrentUser == null)
                return BASE(1, "Not logged in.");
            
            using(var db = await Database.CreateAsync())
            {
                var vendor = Vendor.GetFromMasterID<Vendor>(db, masterID);
                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                var list = UserInvite.GetListByVendor(db, vendor.ID);

                return LIST(list);
            }
        }

        [HttpPost("user/invite")]
        public async Task<IActionResult> PostUserInvite([FromBody] UserInvite req)
        {
            if(CurrentUser == null)
                return BASE(1, "Not logged in.");

            if(string.IsNullOrEmpty(req.Email))
                return BASE(3, "Email is blank.");
            
            using(var db = await Database.CreateAsync())
            {
                var vendor = Vendor.GetFromID<Vendor>(db, req.VendorID);
                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                var user = MarketplaceData.Models.User.GetUserByEmail(db, req.Email);
                if(user == null)
                {
                    req.Email = req.Email.ToLower().Trim();
                    if(UserInvite.GetValidUserInvite(db, req.Email) != null)
                        return BASE(5, "This email has already been invited.");
                    
                    req.Code = (Guid.NewGuid().ToString() + Guid.NewGuid().ToString()).Replace("-","");
                    req.CreatedDate = DateTime.UtcNow;
                    req.ExpiresDate = req.CreatedDate.AddDays(7);
                    
                    req.Insert(db);

                    MailUtil.SendVendorManagerInvite(vendor, req, CurrentUser.Lang);
                }
                else
                {
                    var uv = new UserVendor()
                    {
                        VendorID = vendor.ID,
                        UserID = user.ID
                    };
                    if(uv.SelectID(db, "VendorID,UserID"))
                        return BASE(4, "User is already a manager on this store.");
                    uv.Insert(db);

                    MailUtil.SendVendorManagerInviteUserExists(vendor, user, user.Lang);
                }
                return BASE();
            }
        }

        [HttpPost("user/remove")]
        public async Task<IActionResult> PostUserRemove([FromBody] UserVendor req)
        {
             if(CurrentUser == null)
                return BASE(1, "Not logged in.");
            
            using(var db = await Database.CreateAsync())
            {
                var vendor = Vendor.GetFromID<Vendor>(db, req.VendorID);
                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                if(!req.Select(db, "VendorID,UserID"))
                    return BASE(3, "Manager not found.");
                
                if(req.VendorID != vendor.ID)
                    return BASE(4, "Vendor mismatch.");

                if(req.UserID == CurrentUser.ID)
                    return BASE(5, "You can not remove yourself.");

                req.DeleteFromId(db);

                return BASE();
            }
        }

        [HttpPost("user/invite/remove")]
        public async Task<IActionResult> PostUserInviteRemove([FromBody] UserInvite req)
        {
             if(CurrentUser == null)
                return BASE(1, "Not logged in.");
            
            using(var db = await Database.CreateAsync())
            {
                var vendor = Vendor.GetFromID<Vendor>(db, req.VendorID);
                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                if(!req.Select(db, "ID,VendorID"))
                    return BASE(3, "Invite not found.");
                
                if(req.VendorID != vendor.ID)
                    return BASE(4, "Vendor mismatch.");

                req.DeleteFromId(db);

                return BASE();
            }
        }
    }
}
