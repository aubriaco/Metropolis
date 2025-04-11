/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Util;
using Marketplace.Util.Models;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.Auction;
using MarketplaceUtil.Util;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Marketplace.Controllers.Auction
{
    [ApiController]
    [Route("api/vehicle")]
    public class VehicleController : BaseController
    {
        [HttpGet("fees")]
        public async Task<IActionResult> GetFees()
        {
            if (Config.I == null)
                return BASE(1, "Config is null.");
            return ITEM(Config.I.Fees.Vehicle);
        }


        [HttpPost("submit")]
        public async Task<IActionResult> PostSubmitVehicle([FromBody] Vehicle req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                if (!UserAgreement.IsAgreed(db, CurrentUser.ID, "TOSSellers"))
                    return BASE(10, "Must agree to terms and conditions.");

                req.EmptyNonEditable();
                req.ID = req.Insert(db);
                req.CreatedByUserID = CurrentUser.ID;
                req.CreatedDate = DateTime.UtcNow;
                req.Update(db, "CreatedByUserID,CreatedDate");
                req.DisplayPhotoStorageItemID = 0;
                foreach (var i in req.Photos)
                {
                    var vsi = new VehicleStorageItem() { VehicleID = req.ID, StorageItemID = i.ID };
                    vsi.ID = vsi.Insert(db);
                    if (req.DisplayPhotoStorageItemID == 0)
                    {
                        req.DisplayPhotoStorageItemID = vsi.ID;
                        req.Update(db, "DisplayPhotoStorageItemID");
                    }
                }

                if (!string.IsNullOrEmpty(req.IDFileData))
                {
                    dynamic? file = JsonConvert.DeserializeObject(req.IDFileData);
                    if (file != null && file.fileName != null)
                    {
                        using (var ms = new MemoryStream(Convert.FromBase64String((string)file.base64Content)))
                        {
                            var si = StorageUtil.Put(ms, Guid.NewGuid().ToString(), (string)file.fileType, (string)file.fileName);
                            if (si != null)
                            {
                                req.IDFileID = si.ID;
                                req.Update(db, "IDFileID");
                            }
                        }
                    }
                }
                if (!string.IsNullOrEmpty(req.LicenseFileData))
                {
                    dynamic? file = JsonConvert.DeserializeObject(req.LicenseFileData);
                    if (file != null && file.fileName != null)
                    {
                        using (var ms = new MemoryStream(Convert.FromBase64String((string)file.base64Content)))
                        {
                            var si = StorageUtil.Put(ms, Guid.NewGuid().ToString(), (string)file.fileType, (string)file.fileName);
                            if (si != null)
                            {
                                req.LicenseFileID = si.ID;
                                req.Update(db, "LicenseFileID");
                            }
                        }
                    }
                }
                if (!string.IsNullOrEmpty(req.RegistrationFileData))
                {
                    dynamic? file = JsonConvert.DeserializeObject(req.RegistrationFileData);
                    if (file != null && file.fileName != null)
                    {
                        using (var ms = new MemoryStream(Convert.FromBase64String((string)file.base64Content)))
                        {
                            var si = StorageUtil.Put(ms, Guid.NewGuid().ToString(), (string)file.fileType, (string)file.fileName);
                            if (si != null)
                            {
                                req.RegistrationFileID = si.ID;
                                req.Update(db, "RegistrationFileID");
                            }
                        }
                    }
                }

                var msi = await MapUtil.GetCircledImage(req.PostalCode);
                if (msi != null)
                {
                    req.MapImageID = msi.ID;
                    req.Update(db, "MapImageID");
                }

                var awID = new AuctionWrap() { CreatedByUserID = req.CreatedByUserID, ApplianceID = req.ID, Name = req.Year + " " + req.Make + " " + req.Model }.Insert(db);
                req.AuctionWrapID = awID;
                req.Update(db, "AuctionWrapID");

                await AuditLog.WriteAsync(db, "Has submitted a new vehicle: " + req.Year + " " + req.Make + " " + req.Model, CurrentUser.ID, "/admin/listings/" + req.ID);
                return ITEM(req);
            }
        }

        [HttpGet("vin/decode")]
        public async Task<IActionResult> GetVinDecode([FromQuery] string vin, [FromQuery] int year)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var client = new HttpClient())
            {
                var resp = await client.GetAsync("https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/" + vin + "?format=json&modelyear=" + year);
                if (resp.IsSuccessStatusCode)
                {
                    dynamic? json = JsonConvert.DeserializeObject(await resp.Content.ReadAsStringAsync());
                    if (json == null)
                        return BASE(2, "Error requesting decode vin.");

                    var item = new Vehicle();

                    foreach (dynamic i in json.Results)
                    {
                        if (i.Value != null)
                        {
                            var name = (string)i.Variable;
                            var val = (string)i.Value;

                            if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(val))
                                continue;

                            if (name == "Make") item.Make = val;
                            if (name == "Model") item.Model = val;

                        }
                    }

                    item.VINInfo = JsonConvert.SerializeObject(json);

                    return ITEM(item);
                }
                return BASE(3, "Failed to decode vin.");
            }
        }

        [HttpGet("item")]
        public async Task<IActionResult> GetItem([FromQuery] long id, [FromQuery] bool preview = false)
        {
            using (var db = await Database.CreateAsync())
            {
                var item = MasterModel.GetFromID<Vehicle>(db, id);
                if (item == null)
                    return BASE(1, "Auction not found.");

                if (!preview)
                {
                    if (!item.Started)
                        return BASE(2, "Auction has not started.");
                    if (item.Paused)
                        return BASE(3, "Auction has been paused.");
                }
                else
                {
                    if (CurrentUser == null)
                        return BASE(4, "No user.");
                    if (!CurrentUser.IsAdmin && !CurrentUser.IsValidator)
                        return BASE(5, "No access.");
                }

                item.PullChildren(db);

                return ITEM(preview ? item : item.GetPublic<Vehicle>());
            }
        }

        [HttpPost("list")]
        public async Task<IActionResult> PostList()
        {

            using (var db = await Database.CreateAsync())
            {
                var list = Vehicle.GetList(db);
                return LIST(list);
            }
        }

        [HttpGet("active/count")]
        public async Task<IActionResult> GetActiveCount()
        {
            using (var db = await Database.CreateAsync())
            {
                return ITEM(Vehicle.GetActiveCount(db));
            }
        }

        [HttpGet("my/list")]
        public async Task<IActionResult> GetMyList()
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                var list = new Vehicle() { CreatedByUserID = CurrentUser.ID }.List<Vehicle>(db, "CreatedByUserID", null, "CreatedDate DESC");

                return LIST(list);
            }
        }

        [HttpGet("admin/list")]
        public async Task<IActionResult> GetAdminList()
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            if (!CurrentUser.IsAdmin)
                return BASE(1, "No access.");

            using (var db = await Database.CreateAsync())
            {
                var list = new Vehicle() { Rejected = false }.List<Vehicle>(db, "Rejected", null, "CreatedDate DESC");

                return LIST(list);
            }
        }

        [HttpPost("admin/approve")]
        public async Task<IActionResult> PostAdminApprove([FromBody] Vehicle req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            if (!CurrentUser.IsAdmin)
                return BASE(1, "No access.");

            using (var db = await Database.CreateAsync())
            {
                if (!req.Select(db, "ID"))
                    return BASE(2, "Item not found.");
                req.Started = true;
                if (req.SelectedStart)
                    req.StartDate = req.SelectedStartDate;
                else
                    req.StartDate = DateTime.UtcNow;
                req.EndDate = req.StartDate.AddHours(req.RunTimeHours);
                req.Update(db, "Started,StartDate,EndDate");
                await AuditLog.WriteAsync(db, "Approved vehicle: " + req.Year + " " + req.Make + " " + req.Model, CurrentUser.ID, "/admin/listings/" + req.ID);

                var seller = new User() { ID = req.CreatedByUserID };
                if (seller.Select(db, "ID"))
                    MailUtil.SendVehicleAuctionStartSeller(req, seller);

                return ITEM(req);
            }
        }

        [HttpPost("admin/reject")]
        public async Task<IActionResult> PostAdminReject([FromBody] Vehicle req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            if (!CurrentUser.IsAdmin)
                return BASE(1, "No access.");

            using (var db = await Database.CreateAsync())
            {
                if (!req.Select(db, "ID"))
                    return BASE(2, "Item not found.");
                req.Rejected = true;
                req.RejectedDate = DateTime.UtcNow;
                req.Update(db, "Rejected,RejectedDate");
                await AuditLog.WriteAsync(db, "Rejected vehicle: " + req.Year + " " + req.Make + " " + req.Model, CurrentUser.ID, "/admin/listings/" + req.ID);
                return ITEM(req);
            }
        }

        [HttpPost("admin/pause")]
        public async Task<IActionResult> PostAdminPause([FromBody] Vehicle req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            if (!CurrentUser.IsAdmin)
                return BASE(1, "No access.");

            using (var db = await Database.CreateAsync())
            {
                if (!req.Select(db, "ID"))
                    return BASE(2, "Item not found.");
                req.Paused = true;
                req.PausedDate = DateTime.UtcNow;
                req.Update(db, "Paused,PausedDate");
                await AuditLog.WriteAsync(db, "Paused vehicle: " + req.Year + " " + req.Make + " " + req.Model, CurrentUser.ID, "/admin/listings/" + req.ID);
                return ITEM(req);
            }
        }

        [HttpPost("admin/unpause")]
        public async Task<IActionResult> PostAdminUnpause([FromBody] Vehicle req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            if (!CurrentUser.IsAdmin)
                return BASE(1, "No access.");

            using (var db = await Database.CreateAsync())
            {
                if (!req.Select(db, "ID"))
                    return BASE(2, "Item not found.");
                var delta = DateTime.UtcNow.Subtract(req.PausedDate);
                req.EndDate.Add(delta);
                req.Paused = false;
                req.Update(db, "Paused,EndDate");
                await AuditLog.WriteAsync(db, "Un-paused vehicle: " + req.Year + " " + req.Make + " " + req.Model, CurrentUser.ID, "/admin/listings/" + req.ID);
                return ITEM(req);
            }
        }
    }
}
