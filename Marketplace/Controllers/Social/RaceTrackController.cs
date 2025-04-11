/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Util;
using MarketplaceData;
using MarketplaceData.Models.Social;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Marketplace.Controllers.Social
{
    [ApiController]
    [Route("api/race-track")]
    public class RaceTrackController : BaseController
    {
        [HttpGet("list")]
        public async Task<IActionResult> GetList()
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                return LIST(RaceTrack.GetList(db));
            }
        }

        [HttpGet("item")]
        public async Task<IActionResult> GetItem([FromQuery] long id)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            using (var db = await Database.CreateAsync())
            {
                var item = RaceTrack.GetFromID<RaceTrack>(db, id);
                if (item == null)
                    return BASE(2, "Item not found.");
                item.PullChildren(db);
                return ITEM(item);
            }
        }

        [HttpPost("save")]
        public async Task<IActionResult> PostSave([FromBody] RaceTrack req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            if(!CurrentUser.IsAdmin)
                return BASE(1, "Not admin.");

            using(var db = await Database.CreateAsync())
            {
                if(!string.IsNullOrEmpty(req.DisplayPhoto.Base64Content))
                {
                    var data = Convert.FromBase64String(req.DisplayPhoto.Base64Content);
                    using (var ms = new MemoryStream(data))
                    {
                        var si = StorageUtil.Put(ms, Guid.NewGuid().ToString(), req.DisplayPhoto.MimeType, req.DisplayPhoto.OriginalFileName);
                        req.DisplayPhotoID = si.ID;
                    }
                }

                req.ID = req.Save(db);

                return ITEM(req);
            }
        }
    }
}
