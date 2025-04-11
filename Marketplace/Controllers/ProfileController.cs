/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Util;
using Marketplace.Util.Models;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Util;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/profile")]
    public class ProfileController : BaseController
    {
        [HttpGet("get/{username}")]
        public async Task<IActionResult> PostGet([FromRoute] string username)
        {
            if (string.IsNullOrEmpty(username))
                return BASE(2, "No username requested.");
            using(var db = await Database.CreateAsync())
            {
                username = username.ToLower().Trim();
                var user = new User() { Username = username };
                if (!user.Select(db, "Username"))
                    return BASE(3, "Profile not found.");
                var up = new UserProfile() { UserID = user.ID };
                up.Select(db, "UserID");
                up.Username = user.Username;
                up.PullChildren(db);
                return ITEM(up);
            }
        }

        [HttpPost("save")]
        public async Task<IActionResult> PostSave([FromBody] UserProfile req)
        {
            if (CurrentUser == null)
                return BASE(1, "No user.");


            using (var db = await Database.CreateAsync())
            {
                req.UserID = CurrentUser.ID;

                // Disabled: Username change
                /*
                if(!string.IsNullOrEmpty(req.Username))
                {
                    if (req.Username != CurrentUser.Username)
                    {
                        req.Username = req.Username.ToLower().Trim();
                        var err = GeneralUtil.UsernameComliant(req.Username, CurrentUser.IsAdmin);
                        if (err != null)
                            return BASE(3, err); var test = new User() { Username = req.Username };
                        if (test.SelectID(db, "Username"))
                            return BASE(2, "Username is taken by another user.");
                        CurrentUser.Username = req.Username;
                        CurrentUser.Update(db, "Username");
                        UserUtil.UpdateSession(CurrentUser, db);
                    }
                }
                */

                var exist = new UserProfile() { UserID = CurrentUser.ID };
                if (!exist.Select(db, "UserID"))
                    req.ID = req.Insert(db);
                else
                {
                    req.ID = exist.ID;
                    req.Update(db, "Bio,DisplayPhotoID");
                }

                await AuditLog.WriteAsync(db, "Edited their profile.", CurrentUser.ID);

                return ITEM(req);
            }
        }
    }
}
