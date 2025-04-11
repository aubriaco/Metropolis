/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Models.Responses;
using Marketplace.Util;
using MarketplaceData.Models;
using MarketplaceData;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/wishlist")]
    public class WishlistController : BaseController
    {
        [HttpGet("list")]
        public async Task<IActionResult> GetList()
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                var list = db.GetProductsFromWishlist(CurrentUser.ID);
                return LIST(list);
            }
        }

        [HttpPost("add")]
        public async Task<IActionResult> PostAdd([FromBody] WishProduct req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");


            using (var db = await Database.CreateAsync())
            {
                var wp = new WishProduct() { UserID = CurrentUser.ID, ProductID = req.ProductID };
                if(!wp.Select(db, "UserID,ProductID"))
                {
                    wp.ID = wp.Insert(db);
                    return BASE();
                }
                else
                    return BASE(2, "Product already in your wishlist.");
            }            
        }

        [HttpPost("remove")]
        public async Task<IActionResult> PostRemove([FromBody] CartProduct req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");


            using (var db = await Database.CreateAsync())
            {
                var wp = new WishProduct() { UserID = CurrentUser.ID, ProductID = req.ProductID };
                if (wp.Select(db, "UserID,ProductID"))
                {
                    wp.DeleteFromId(db);
                    return BASE();
                }
                else
                    return BASE(2, "Wishlist product not found.");
            }
        }
    }
}
