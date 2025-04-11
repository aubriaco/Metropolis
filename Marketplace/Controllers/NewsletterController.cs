/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Util;
using MarketplaceData;
using MarketplaceData.Models;
using Marketplace;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/newsletter")]
    public class NewsletterController : BaseController
    {
        [HttpPost("subscribe")]
        public async Task<IActionResult> PostSubscribe([FromBody] NewsletterSub req)
        {
            string? ipAddr = AuthUtil.GetClientIPAddress(HttpContext);

            if (ipAddr == null)
                return BASE(1, "Can not detect IP address.");


            if (!LockUtil.Lock("newsletter", ipAddr, 1, DateTime.UtcNow.AddMinutes(1)))
                return BASE(2, "Flood Protection: Locked state: You have reached the request limit. Please wait a minute and try again.");

            if(string.IsNullOrWhiteSpace(req.Email))
                return BASE(3, "Email address is blank.");

            req.Email = req.Email.Trim();

            using (var db = await Database.CreateAsync())
            {
                if(req.SelectID(db, "Email"))
                    return BASE(3, "Email address is already it database.");

                req.IPAddress = ipAddr;
                req.CreatedDate = DateTime.UtcNow;

                req.Insert(db);

                if (Config.I != null)
                {
                    MailUtil.Send(req.Email, "You have signed up to our Newsletter", "Hello.<br /><br />Thank you for signing up for our newsletter on <strong>Metropolis Market</strong>.<br /><br /><small>If you did not sign up please <a href=\"" + LinkUtil.Get("/newsletter/unsubscribe/" + req.MasterID) + "\">click here to unsubscribe.</a><br /><br />Thanks!");
                    MailUtil.Send(Config.I.GetJoinNotifyEmails(), "Newsletter Signup", "Email address has signed up for the newsletter: " + req.Email + "<br />IP Address: " + req.IPAddress);
                }


                return BASE();
            }
        }
    }
}
