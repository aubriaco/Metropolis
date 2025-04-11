/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Models.Responses;
using MarketplaceData;
using MarketplaceData.Models;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/category")]
    public class CategoryController : BaseController
    {

        [HttpGet("list")]
        public async Task<IActionResult> GetList([FromQuery] bool showEmpty = false)
        {
            using (var db = await Database.CreateAsync())
            {
                var list = Category.GetList(db, showEmpty);

                return Ok(new ListResponse(list));
            }
        }

    }
}
