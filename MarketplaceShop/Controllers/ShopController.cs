/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 
using Marketplace.Controllers;
using MarketplaceData;
using MarketplaceShop.Models;
using Microsoft.AspNetCore.Mvc;

namespace MarketplaceShop.Controllers
{
    [ApiController]
    [Route("api/shop")]
    public class ShopController : BaseController
    {
        [HttpGet("config")]
        public IActionResult GetConfig()
        {
            using(var db = new Database())
            {
                var item = new ShopConfig();
                item.Load(db);
                return ITEM(item);
            }
        }
    }
}