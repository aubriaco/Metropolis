/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Util;
using MarketplaceUtil.Util;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/geo")]
    public class GeoController : BaseController
    {
        [HttpGet("address")]
        public async Task<IActionResult> GetAddress([FromQuery] double lat, [FromQuery] double lng)
        {
            var address = await MapUtil.GetAddress(lat, lng);
            if (address == null)
                return BASE(2, "Could not get address information.");
            return ITEM(address);
        }
    }
}
