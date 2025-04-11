/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData;
using MarketplaceData.Models;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/blog")]
    public class BlogController : BaseController
    {
        [HttpGet("list")]
        public async Task<IActionResult> GetList([FromQuery] int page = 1)
        {
            using(var db = await Database.CreateAsync())
            {
                long counter = BlogPost.GetList<long>(db, page);
                return LIST(BlogPost.GetList<List<BlogPost>>(db, page), counter, (long)Math.Ceiling((double)counter / 5));
            }
        }

        [HttpGet("get")]
        public async Task<IActionResult> Get([FromQuery] string ident)
        {
            using (var db = await Database.CreateAsync())
            {
                var item = new BlogPost() { Ident = ident };
                if(!item.Select(db, "Ident"))
                    return BASE(2, "Post not found.");
                item.PullChildren(db);
                return ITEM(item);
            }
        }
    }
}