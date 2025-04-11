/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Models.Responses;
using Marketplace.Util;
using MarketplaceData;
using MarketplaceData.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/user")]
    public class UserController : BaseController
    {
        [HttpPost("info/save")]
        public async Task<IActionResult> PostInfoSave([FromBody] User req)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            using (var db = await Database.CreateAsync())
            {
                var user = new User() { ID = CurrentUser.ID };
                if (!user.Select(db, "ID"))
                    return Ok(new BaseResponse(2, "User not found."));

                if(!string.IsNullOrEmpty(req.FirstName))
                    user.FirstName = req.FirstName;
                if (!string.IsNullOrEmpty(req.LastName))
                    user.LastName = req.LastName;
                if(req.BirthDateY != 0 && req.BirthDateM !=0 && req.BirthDateD != 0)
                {
                    user.BirthDate = req.BirthDate;
                }
                if (!string.IsNullOrEmpty(req.Email))
                {
                    req.Email = req.Email.Trim().ToLower();
                    if(req.Email != user.Email)
                    {

                    }
                    //todo
                }
                if (!string.IsNullOrEmpty(req.Phone))
                {
                    req.Phone = req.Phone.Trim();
                    if (req.Phone != user.Phone)
                    {

                    }
                    // todo
                    user.Phone = req.Phone;
                }
                
                if(req.Address != null)
                {
                    Address address;
                    if (user.AddressID != 0)
                    {
                        address = new Address() { ID = user.AddressID };
                        address.Select(db, "ID");
                    }
                    else
                    {
                        address = new Address();
                        address.ID = address.Insert(db);
                        user.AddressID = address.ID;
                        user.Update(db, "AddressID");
                    }

                    var props = req.Address.GetType().GetProperties();
                    foreach(var prop in props)
                    {
                        if (prop.CanWrite && prop.PropertyType == typeof(string) && !string.IsNullOrEmpty((string?)prop.GetValue(req.Address)))
                            prop.SetValue(address, prop.GetValue(req.Address));
                        else if(prop.CanWrite && prop.PropertyType == typeof(long) && (long)prop.GetValue(req.Address) != 0)
                            prop.SetValue(address, prop.GetValue(req.Address));
                    }

                    address.Update(db);
                }

                user.Update(db, "FirstName,LastName,Phone,BirthDate");

                user.SID = CurrentUser.SID;
                user.Address = Address.GetFromID<Address>(db, user.AddressID);

                UserUtil.UpdateSession(user, db);

                var se = new SessionExtra() { UserID = user.ID };
                if(!se.Select(db, "UserID") || se.ActiveVendorID == 0)
                {
                    var uv = new UserVendor() { UserID = user.ID };
                    if(uv.Select(db, "UserID"))
                    {
                        se.ActiveVendorID = uv.VendorID;
                        se.Update(db, "ActiveVendorID");
                    }
                }

                return Ok(new BaseResponse());
            }
        }

        [HttpPost("agreement/check")]
        public async Task<IActionResult> PostAgreementCheck([FromBody] UserAgreement req)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            if (string.IsNullOrEmpty(req.DocumentName))
                return BASE(2, "No document selected to agree to.");

            using (var db = await Database.CreateAsync())
            {
                try
                {
                    if (UserAgreement.IsAgreed(db, CurrentUser.ID, req.DocumentName))
                        return ITEM(true);
                    else
                        return BASE(10, "Need agreement.");
                }
                catch (Exception ex)
                {
                    return BASE(3, ex.Message);
                }
            }
        }

        [HttpPost("agreement/agree")]
        public async Task<IActionResult> PostAgreementAgree([FromBody] UserAgreement req)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            if (string.IsNullOrEmpty(req.DocumentName))
                return BASE(2, "No document selected to agree to.");

            using (var db = await Database.CreateAsync())
            {
                try
                {
                    if(!UserAgreement.IsAgreed(db, CurrentUser.ID, req.DocumentName))
                    {
                        req.UserID = CurrentUser.ID;
                        req.DocumentRevision = UserAgreement.CurrentAgreements.First(item => item.DocumentName == req.DocumentName).DocumentRevision;
                        req.AgreedDate = DateTime.UtcNow;
                        req.Agreed = true;
                        req.Insert(db);
                    }
                    return BASE();
                }
                catch (Exception ex)
                {
                    return BASE(3, ex.Message);
                }
            }
        }

        
        [HttpGet("extra")]
        public async Task<IActionResult> GetExtra()
        {
            if(CurrentUser == null)
                return BASE(1, "Not logged in.");
            
            using(var db = await Database.CreateAsync())
            {
                var item = new SessionExtra() { UserID = CurrentUser.ID };
                item.Select(db, "UserID");
                return ITEM(item);
            }
        }
    }
}
