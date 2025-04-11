/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.Social;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Marketplace.Controllers.Social
{
    [ApiController]
    [Route("api/garage")]
    public class GarageController : BaseController
    {
        [HttpPost("save")]
        public async Task<IActionResult> PostSave([FromBody] Car req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                if(req.ID != 0)
                {
                    var item = Car.GetFromID<Car>(db, req.ID);
                    if (item == null)
                        return BASE(3, "Item not found.");
                    if (item.UserID != req.UserID)
                        return BASE(3, "Not your item.");
                }
                req.EmptyNonEditable();
                req.UserID = CurrentUser.ID;

                req.ID = req.Save(db);

                CarPhoto.Clean(db, req.ID);
                foreach (var i in req.Photos)
                {
                    var cp = new CarPhoto() { CarID = req.ID, UserID = CurrentUser.ID, StorageItemID = i.ID };
                    cp.ID = cp.Insert(db);
                    if (req.DisplayPhotoID == 0)
                    {
                        req.DisplayPhotoID = cp.ID;
                        req.Update(db, "DisplayPhotoID");
                    }
                }

                return ITEM(req);
            }
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetList([FromQuery] long? userID = 0)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                var list = Car.GetList(db, (userID != null && (long)userID != 0) ? (long)userID : CurrentUser.ID);
                return LIST(list);
            }
        }

        [HttpPost("remove")]
        public async Task<IActionResult> PostRemove([FromBody] Car req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                var car = new Car() { ID = req.ID, UserID = CurrentUser.ID };
                if (!car.Select(db, "ID,UserID"))
                    return BASE(2, "Not found.");

                car.Removed = true;
                car.RemovedDate = DateTime.UtcNow;

                car.Update(db, "Removed,RemovedDate");

                return BASE();
            }
        }

        [HttpGet("item/{id}")]
        public async Task<IActionResult> GetItem([FromRoute] string id)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                var item = Car.GetFromMasterID<Car>(db, id);
                if(item == null)
                    return BASE(2, "Not found.");

                item.PullChildren(db);

                return ITEM(item.GetPublic<Car>());
            }
        }
    }
}
