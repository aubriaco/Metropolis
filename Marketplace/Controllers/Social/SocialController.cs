/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.Social;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Controllers.Social
{
    [ApiController]
    [Route("api/social")]
    public class SocialController : BaseController
    {
        public class SearchResults
        {
            public List<UserProfile> Profiles { get; set; } = new List<UserProfile>();
            public List<TimelinePost> Posts { get; set; } = new List<TimelinePost>();
        }

        [HttpGet("search")]
        public async Task<IActionResult> GetSearch([FromQuery] string query)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                var results = new SearchResults();
                results.Profiles = UserProfile.Search(db, query);
                results.Posts = TimelinePost.Search(db, query);
                return ITEM(results);
            }
        }
    }
}
