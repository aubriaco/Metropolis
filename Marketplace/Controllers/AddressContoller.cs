/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData;
using MarketplaceData.Models;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/address")]
    public class AddressContoller : BaseController
    {
        [HttpGet("country/list")]
        public async Task<IActionResult> GetCountryList()
        {
            using (var db = await Database.CreateAsync())
            {
                var list = new Country().List<Country>(db, "", null, "name ASC");
                return LIST(list);
            }
        }
    }
}
