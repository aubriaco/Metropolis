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
    [Route("api/review")]
    public class ReviewController : BaseController
    {
        [HttpPost("submit")]
        public async Task<IActionResult> PostSubmit(Review req)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            if(req.Rating == 0)
                return BASE(4, "Please select a rating.");
            if(req.Rating < 0 || req.Rating > 5)
                return BASE(4, "Invalid rating (1-5).");                
            if(string.IsNullOrWhiteSpace(req.Body))
                return BASE(4, "Review is blank.");

            using (var db = await Database.CreateAsync())
            {
                var product = new Product() { ID = req.ProductID };
                if (!product.Select(db, "ID"))
                    return Ok(new BaseResponse(2, "Product not found."));

                req.UserID = CurrentUser.ID;

                var test = new Review() { ProductID = req.ProductID, UserID = CurrentUser.ID };
                if(test.Select(db, "ProductID,UserID"))
                    return Ok(new BaseResponse(3, "You already reviewed this product."));

                req.ID = req.Insert(db);

                product.ReviewCount++;
                product.Update(db, "ReviewCount");

                db.UpdateProductRating(product.ID);

                return Ok(new BaseResponse());
            }
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetList(long productId)
        {
            using (var db = await Database.CreateAsync())
            {
                //db.UpdateProductRating(productId);
                var list = db.GetReviewsByProduct(productId);
                return Ok(new ListResponse(list));
            }
        }

    }
}
