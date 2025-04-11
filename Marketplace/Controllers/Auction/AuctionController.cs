/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Util.Models;
using Marketplace.Util;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.Auction;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using MarketplaceUtil.Util;
using SkiaSharp;
using System.Drawing;

namespace Marketplace.Controllers.Auction
{
    [ApiController]
    [Route("api/auction")]
    public class AuctionController : BaseController
    {
        [HttpGet("appliance/fees")]
        public async Task<IActionResult> GetFees()
        {
            if (Config.I == null)
                return BASE(1, "Config is null.");
            return ITEM(Config.I.Fees.Appliance);
        }

        [HttpGet("appliance/type/list")]
        public async Task<IActionResult> GetApplianceTypeList()
        {
            using (var db = await Database.CreateAsync())
            {
                return LIST(new ApplianceType().List<ApplianceType>(db, ""));
            }
        }

        [HttpGet("appliance/condition/list")]
        public async Task<IActionResult> GetApplianceConditionList()
        {
            using (var db = await Database.CreateAsync())
            {
                return LIST(new ApplianceConditionType().List<ApplianceConditionType>(db, ""));
            }
        }

        [HttpPost("appliance/submit")]
        public async Task<IActionResult> PostApplianceSubmit([FromBody] Appliance req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                if (!UserAgreement.IsAgreed(db, CurrentUser.ID, "TOSSellers"))
                    return BASE(10, "Must agree to terms and conditions.");

                req.EmptyNonEditable();

                if (string.IsNullOrEmpty(req.PostalCode) || req.PostalCode.Length != 5)
                    return BASE(2, "Invalid postal code.");

                if (req.ApplianceTypeID == 0)
                    return BASE(2, "Invalid appliance type.");
                var at = new ApplianceType() { ID = req.ApplianceTypeID };
                if (!at.Select(db, "ID"))
                    return BASE(2, "Invalid appliance type.");

                if (req.ConditionTypeID == 0)
                    return BASE(2, "Invalid condition type.");
                var ct = new ApplianceConditionType() { ID = req.ConditionTypeID };
                if (!ct.Select(db, "ID"))
                    return BASE(2, "Invalid condition type.");

                req.ID = req.Insert(db);
                req.CreatedByUserID = CurrentUser.ID;
                req.CreatedDate = DateTime.UtcNow;
                req.Update(db, "CreatedByUserID,CreatedDate");
                req.DisplayPhotoStorageItemID = 0;

                foreach (var i in req.Photos)
                {
                    var vsi = new ApplianceStorageItem() { ApplianceID = req.ID, StorageItemID = i.ID };
                    vsi.ID = vsi.Insert(db);
                    if (req.DisplayPhotoStorageItemID == 0)
                    {
                        req.DisplayPhotoStorageItemID = vsi.ID;
                        req.Update(db, "DisplayPhotoStorageItemID");
                    }
                }

                var si = await MapUtil.GetCircledImage(req.PostalCode);
                if (si != null)
                {
                    req.MapImageID = si.ID;
                    req.Update(db, "MapImageID");
                }


                var awID = new AuctionWrap() { CreatedByUserID = req.CreatedByUserID, ApplianceID = req.ID, Name = req.Name }.Insert(db);
                req.AuctionWrapID = awID;
                req.Update(db, "AuctionWrapID");

                await AuditLog.WriteAsync(db, "Has submitted a new appliance: " + req.Name, CurrentUser.ID, "/admin/listings/appliance/" + req.ID);
                return ITEM(req);
            }
        }

        [HttpGet("appliance/item")]
        public async Task<IActionResult> GetItem([FromQuery] long id, [FromQuery] bool preview = false)
        {
            using (var db = await Database.CreateAsync())
            {
                var item = MasterModel.GetFromID<Appliance>(db, id);
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

                return ITEM(preview ? item : item.GetPublic<Appliance>());
            }
        }

        [HttpGet("appliance/my/list")]
        public async Task<IActionResult> GetMyList()
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                var list = new Appliance() { CreatedByUserID = CurrentUser.ID }.List<Appliance>(db, "CreatedByUserID", null, "CreatedDate DESC");

                return LIST(list);
            }
        }

        [HttpPost("appliance/list")]
        public async Task<IActionResult> PostList()
        {

            using (var db = await Database.CreateAsync())
            {
                var list = Appliance.GetList(db);
                return LIST(list);
            }
        }

        [HttpGet("appliance/active/count")]
        public async Task<IActionResult> GetActiveCount()
        {
            using (var db = await Database.CreateAsync())
            {
                return ITEM(Appliance.GetActiveCount(db));
            }
        }

        [HttpGet("appliance/admin/list")]
        public async Task<IActionResult> GetAdminList()
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            if (!CurrentUser.IsAdmin)
                return BASE(1, "No access.");

            using (var db = await Database.CreateAsync())
            {
                var list = new Appliance() { Rejected = false }.List<Appliance>(db, "Rejected", null, "CreatedDate DESC");

                return LIST(list);
            }
        }

        [HttpPost("appliance/admin/approve")]
        public async Task<IActionResult> PostAdminApprove([FromBody] Appliance req)
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
                await AuditLog.WriteAsync(db, "Approved appliance: " + req.Name, CurrentUser.ID, "/admin/listings/appliance/" + req.ID);

                var seller = new User() { ID = req.CreatedByUserID };
                if (seller.Select(db, "ID"))
                    MailUtil.SendApplianceAuctionStartSeller(req, seller);

                return ITEM(req);
            }
        }

        [HttpPost("appliance/admin/reject")]
        public async Task<IActionResult> PostAdminReject([FromBody] Appliance req)
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
                await AuditLog.WriteAsync(db, "Rejected appliance: " + req.Name, CurrentUser.ID, "/admin/listings/appliance/" + req.ID);
                return ITEM(req);
            }
        }

        [HttpPost("appliance/admin/pause")]
        public async Task<IActionResult> PostAdminPause([FromBody] Appliance req)
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
                await AuditLog.WriteAsync(db, "Paused appliance: " + req.Name, CurrentUser.ID, "/admin/listings/appliance/" + req.ID);
                return ITEM(req);
            }
        }

        [HttpPost("appliance/admin/unpause")]
        public async Task<IActionResult> PostAdminUnpause([FromBody] Appliance req)
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
                await AuditLog.WriteAsync(db, "Un-paused appliance: " + req.Name, CurrentUser.ID, "/admin/listings/appliance/" + req.ID);
                return ITEM(req);
            }
        }

        // AuctionQA

        [HttpGet("qa/list")]
        public async Task<IActionResult> GetAuctionQAList([FromQuery] long wrapID)
        {
            using (var db = await Database.CreateAsync())
            {
                var list = AuctionQA.GetList(db, wrapID, true);
                return LIST(list);
            }
        }

        [HttpGet("qa/my/list")]
        public async Task<IActionResult> GetAuctionQAMyList()
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            using (var db = await Database.CreateAsync())
            {
                var list = AuctionQA.GetList(db, 0, false, CurrentUser.ID);
                return LIST(list);
            }
        }

        [HttpPost("qa/post")]
        public async Task<IActionResult> GetAuctionQAPost([FromBody] AuctionQA req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            if (string.IsNullOrEmpty(req.Question))
                return BASE(2, "Question can not be blank.");

            if(req.Question.Length > 400)
                return BASE(2, "Question max length is 400 characters.");

            
            using (var db = await Database.CreateAsync())
            {
                var wrap = AuctionWrap.GetFromID<AuctionWrap>(db, req.AuctionWrapID);
                if (wrap == null)
                    return BASE(2, "Auction to comment on not found.");

                if (!LockUtil.Lock("auction-qa-post", CurrentUser.ID.ToString() + "-" + wrap.ID, 2, DateTime.UtcNow.AddMinutes(5)))
                    return BASE(3, "You can only ask 2 questions per auction every 5 minutes.");


                req.EmptyNonEditable();

                req.ApplianceID = wrap.ApplianceID;
                req.VehicleID = wrap.VehicleID;
                req.UserID = CurrentUser.ID;

                req.ID = req.Insert(db);

                var seller = new User() { ID = wrap.CreatedByUserID };
                if (seller.Select(db, "ID"))
                {
                    MailUtil.Send(seller.Email, "Te enviaron una pregunta - They asked you a question", $@"Hola {seller.FirstName}.<br /><br />
Te han hecho una pregunta sobre tu subasta <strong>{req.Name}</strong>. Por favor entrar y contestarla en el enlace:<br />
<a href=""{Config.I.AuctionAppUrl}/my/listings"">{Config.I.AuctionAppUrl}/my/listings</a><br /><br />
<i>
Helo {seller.FirstName}<br /><br />
You have been asked a question about your auction <strong>{req.Name}</strong>. Please login and answer at:<br />
<a href=""{Config.I.AuctionAppUrl}/my/listings"">{Config.I.AuctionAppUrl}/my/listings</a><br /><br />
</i>
", Config.I.AuctionAppUrl + "/my/listings", "Ver pregunta / View question");
                }

                return ITEM(req);
            }
        }

        [HttpPost("qa/answer")]
        public async Task<IActionResult> GetAuctionQAAnswer([FromBody] AuctionQA req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            if (string.IsNullOrEmpty(req.Answer))
                return BASE(2, "Answer can not be blank.");

            using (var db = await Database.CreateAsync())
            {
                var item = new AuctionQA() { ID = req.ID };
                if (!item.Select(db, "ID"))
                    return BASE(2, "Question not found.");

                var wrap = AuctionWrap.GetFromID<AuctionWrap>(db, item.AuctionWrapID);
                if (wrap == null)
                    return BASE(2, "Auction to answer question for not found.");

                if (wrap.CreatedByUserID != CurrentUser.ID)
                    return BASE(2, "This question is not from your auction.");
                req.AnswerDate = DateTime.UtcNow;
                req.Update(db, "Answer,AnswerDate,IsPublic");

                return ITEM(req);
            }
        }
    }
}
