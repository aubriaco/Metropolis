/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Controllers;
using MarketplaceData.Models.WaiterNet;
using MarketplaceData.Models;
using MarketplaceData;
using Microsoft.AspNetCore.Mvc;
using Marketplace.Util;
using Newtonsoft.Json;
using MarketplaceUtil.Util;

namespace WaiterNet.Controllers
{
    [ApiController]
    [Route("api/integration/clover")]
    public class WaiterIntegrationCloverController : BaseController
    {
        [HttpPost("hook")]
        public IActionResult PostHook()
        {
            return BASE();
        }

        [HttpGet("import/preset")]
        public IActionResult GetImportPreset()
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = new Database())
            {
                var se = SessionExtra.Get(db, CurrentUser);
                if (se == null)
                    return BASE(3, "Session extra not present.");

                var vendor = Vendor.GetFromID<Vendor>(db, se.ActiveVendorID);
                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                var vi = new VendorIntegration() { VendorID = vendor.ID, Name = "Clover" };
                if (!vi.Select(db, "VendorID"))
                    return BASE(3, "Integration does not exist.");

                return ITEM(vi.GetPublic<VendorIntegration>());
            }
        }

        [HttpGet("import/status")]
        public IActionResult GetImportStatus([FromQuery] string taskID)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = new Database())
            {
                var noti = new UserNotification() { UserID = CurrentUser.ID, TaskID = taskID };
                if (!noti.Select(db, "UserID,TaskID"))
                    return BASE(10, "In progress.");

                return ITEM(noti);
            }
        }

        [HttpPost("import")]
        public IActionResult PostImport([FromBody] VendorIntegration req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");


            using (var db = new Database())
            {
                var se = SessionExtra.Get(db, CurrentUser);
                if (se == null)
                    return BASE(3, "Session extra not present.");

                var vendor = Vendor.GetFromID<Vendor>(db, se.ActiveVendorID);
                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                var vi = new VendorIntegration() { VendorID = vendor.ID, Name = "Clover" };

                if (!vi.Select(db, "VendorID,Ident"))
                {
                    if (req.IsRerun)
                        return BASE(3, "Integration not found.");
                    vi.MerchantID = req.MerchantID;
                    vi.APIToken = req.APIToken;
                    vi.ID = vi.Insert(db);
                }
                else
                {
                    if (!req.IsRerun)
                    {
                        vi.MerchantID = req.MerchantID;
                        vi.APIToken = req.APIToken;
                        vi.Update(db, "MerchantID,APIToken");
                    }
                }

                using (var redis = new RedisUtil())
                {
                    var taskInfo = new WaiterTask() { UserID = CurrentUser.ID, TaskType = WaiterTaskType.Integration, Integration = vi };
                    redis.Push("waiter-tasks", JsonConvert.SerializeObject(taskInfo));
                    return ITEM(taskInfo);
                }

            }
        }

        [HttpPost("oauth")]
        public async Task<IActionResult> PostOAuth([FromBody] VendorIntegration req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            if (string.IsNullOrEmpty(req.MerchantID))
                return BASE(5, "Merchant ID is missing.");

            using (var db = new Database())
            {
                var se = SessionExtra.Get(db, CurrentUser);
                if (se == null)
                    return BASE(3, "Session extra not present.");

                var vendor = Vendor.GetFromID<Vendor>(db, se.ActiveVendorID);
                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                var vi = new VendorIntegration() { VendorID = vendor.ID, Name = "Clover" };

                if (string.IsNullOrEmpty(req.Code))
                    return BASE(3, "Code not specified.");

                try
                {
                    var integration = new CloverIntegration(vi);
                    req.APIToken = await integration.GetOAuthToken(req.Code);
                    if (string.IsNullOrEmpty(req.APIToken))
                        return BASE(4, "Token came back empty from Clover.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine("WaiterIntegrationCloverController: PostOAuth: ERROR: " + ex.Message);
                    return BASE(4, "Failed to aquire access token from Clover.");
                } 

                if (!vi.Select(db, "VendorID,Ident"))
                {
                    vi.MerchantID = req.MerchantID;
                    vi.APIToken = req.APIToken;
                    vi.ID = vi.Insert(db);
                }
                else
                {
                    vi.MerchantID = req.MerchantID;
                    vi.APIToken = req.APIToken;
                    vi.Update(db, "MerchantID,APIToken");
                }

                using (var redis = new RedisUtil())
                {
                    var taskInfo = new WaiterTask() { UserID = CurrentUser.ID, TaskType = WaiterTaskType.Integration, Integration = vi };
                    redis.Push("waiter-tasks", JsonConvert.SerializeObject(taskInfo));

                    taskInfo.Integration = vi.GetPublic<VendorIntegration>();
                    return ITEM(taskInfo);
                }
            }
        }


        [HttpPost("card/add")]
        public async Task<IActionResult> PostAddCard([FromBody] PaymentMethod req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            using (var db = new Database())
            {
                var se = SessionExtra.Get(db, CurrentUser);
                if (se == null)
                    return BASE(3, "Session extra not present.");

                var vendor = Vendor.GetFromID<Vendor>(db, se.ActiveVendorID);
                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                var vi = new VendorIntegration() { VendorID = vendor.ID, Name = "Clover" };

                if (!vi.Select(db, "VendorID,Ident"))
                    return BASE(3, "Inegration not found.");

                var integration = new CloverIntegration(vi);
                try
                {
                    var uc = new UserCustomer() { UserID = CurrentUser.ID, ExternalSource = "CLOVER" };
                    uc.SelectID(db, "UserID,ExternalSource");
                    _ = await integration.AddCustomerCard(uc, req, CurrentUser.Email, CurrentUser.Name);
                    if (uc.ID == 0)
                        uc.ID = uc.Insert(db);
                }
                catch(Exception ex)
                {
                    Console.WriteLine("PostAddCard: ERROR: " + ex.Message);
                    return BASE(4, "Failed to save card.");
                }
                return BASE();
            }
        }
    }
}
