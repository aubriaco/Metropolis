/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceUtil.Util;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/payout")]
    public class PayoutController : BaseController
    {
        [HttpPost("setup")]
        public async Task<IActionResult> PostSetup([FromQuery] long vendorID)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            if (!CurrentUser.IsVendor)
                return BASE(1, "Not a vendor user.");
            if (Config.I == null)
                return BASE(-1, "Not configured.");

            using (var db = await Database.CreateAsync())
            {
                var vendor = Vendor.GetFromID<Vendor>(db, vendorID);

                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                var util = PaymentUtil.GetUtil(Config.I.PaymentIntegration);

                var accountID = await util.CreateAccount();

                var vpl = new VendorPayoutLink() { VendorID = vendorID, IntegrationType = Config.I.PaymentIntegration, AccountID = accountID };
                if (vpl.SelectID(db, "VendorID,IntegrationType"))
                    vpl.Update(db);
                else
                    vpl.Insert(db);

                var url = await util.CreateAccountLink(accountID, Config.I.AppUrl + "/my/stores/manage/" + vendor.MasterID + "/payouts", Config.I.AppUrl + "/my/stores/manage/" + vendor.MasterID + "/payouts");

                return ITEM(url);
            }
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus([FromQuery] long vendorID)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            if (!CurrentUser.IsVendor)
                return BASE(1, "Not a vendor user.");
            if (Config.I == null)
                return BASE(-1, "Not configured.");

            using (var db = await Database.CreateAsync())
            {
                var vendor = Vendor.GetFromID<Vendor>(db, vendorID);

                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                var vpl = new VendorPayoutLink() { VendorID = vendorID, IntegrationType = Config.I.PaymentIntegration };
                if (!vpl.Select(db, "VendorID,IntegrationType"))
                    return BASE(2, "No link found.");

                if (string.IsNullOrEmpty(vpl.AccountID))
                    return BASE(2, "Account ID from link is null.");

                var util = PaymentUtil.GetUtil(Config.I.PaymentIntegration);

                var data = await util.GetAccount(vpl.AccountID);

                vpl.InfoJson = JsonConvert.SerializeObject(data);
                vpl.Active = (bool)data.payouts_enabled;

                if (!vpl.Active)
                    return BASE(3, "Your payout integration is inactive.");

                vpl.Update(db, "InfoJson,Active");

                vpl.InfoJson = null;

                return ITEM(vpl);
            }
        }
    }
}
