/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Models.Responses;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Util;
using Marketplace;
using Marketplace.Util;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Marketplace.Util.Models;
using MarketplaceData.Models.Referral;
using System.Security.Cryptography;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/signup")]
    public class SignupController : BaseController
    {
        [HttpPost("user")]
        public async Task<IActionResult> PostUser([FromBody] User req)
        {
            if (string.IsNullOrEmpty(req.FirstName))
                return Ok(new BaseResponse(1, "First Name can not be blank."));

            if (string.IsNullOrEmpty(req.LastName))
                return Ok(new BaseResponse(1, "Last Name can not be blank."));

            if (string.IsNullOrEmpty(req.Email) || !req.Email.Contains('@') || !req.Email.Contains('.'))
                return Ok(new BaseResponse(1, "Email must be valid."));            

            req.Email = req.Email.ToLower().Trim();

            if (!MailUtil.EmailIsOK(req.Email))
                return BASE(1, "Email is invalid or uses a blocked provider.");

            if (string.IsNullOrEmpty(req.Phone) || req.Phone.Length < 10)
                return Ok(new BaseResponse(1, "Phone can not be less than 10 characters."));

            string compliant = GeneralUtil.PasswordCompliant(req.Password, 0);

            if (compliant != null)
                return Ok(new BaseResponse(2, compliant));

            using (var db = await Database.CreateAsync())
            {
                var test = new User()
                {
                    Email = req.Email
                };
                if (test.Select(db, "Email"))
                    return Ok(new BaseResponse(1, "Email is already registered."));
            }


            using (var redis = await RedisUtil.CreateAsync())
            {
                req.Step = 1;
                string ident = Guid.NewGuid().ToString();
                redis.Put(ident, JsonConvert.SerializeObject(req), DateTime.UtcNow.AddHours(1));
                HttpContext.Response.Cookies.Append("CM-Signup", ident);
                return Ok(new ItemResponse(ident));
            }
        }

        [HttpPost("address")]
        public async Task<IActionResult> PostAddress([FromBody] Address req)
        {

            using (var redis = await RedisUtil.CreateAsync())
            {
                string sid = HttpContext.Request.Cookies["CM-Signup"];
                if (string.IsNullOrEmpty(sid))
                    return Ok(new BaseResponse(2, "Invalid session id."));

                string data = redis.Get(sid);

                if (string.IsNullOrEmpty(data))
                    return Ok(new BaseResponse(1, "Session not found."));

                
                using (var db = await Database.CreateAsync())
                {
                    var country = new Country() { ID = req.CountryID };
                    if (!country.Select(db, "ID"))
                        return Ok(new BaseResponse(4, "Country not found."));
                    req.Country = country.Name;
                }

                var user = JsonConvert.DeserializeObject<User>(data);
                user.Step = 2;
                user.Address = req;
                redis.Put(sid, JsonConvert.SerializeObject(user), DateTime.UtcNow.AddHours(1));
                HttpContext.Response.Cookies.Append("CM-Signup", sid);
                return Ok(new ItemResponse(sid));
            }
        }

        [HttpPost("type")]
        public async Task<IActionResult> PostType([FromBody] User req)
        {
            using (var redis = await RedisUtil.CreateAsync())
            {
                string sid = HttpContext.Request.Cookies["CM-Signup"];
                if (string.IsNullOrEmpty(sid))
                    return Ok(new BaseResponse(2, "Invalid session id."));

                string data = redis.Get(sid);

                if (string.IsNullOrEmpty(data))
                    return Ok(new BaseResponse(1, "Session not found."));

                var user = JsonConvert.DeserializeObject<User>(data);
                user.IsVendor = req.IsVendor;
                user.Step = 3;
                redis.Put(sid, JsonConvert.SerializeObject(user), DateTime.UtcNow.AddHours(1));
                HttpContext.Response.Cookies.Append("CM-Signup", sid);
                return Ok(new ItemResponse(sid));
            }
        }

        [HttpPost("check/email")]
        public async Task<IActionResult> PostCheckEmail([FromBody] User req)
        {
            using (var db = await Database.CreateAsync())
            {
                if (string.IsNullOrEmpty(req.Email))
                    return BASE(1, "Email is null.");
                req.Email = req.Email.Trim().ToLower();

                if (!Config.I.Debug)
                {
                    if (!MailUtil.EmailIsOK(req.Email))
                        return BASE(1, "Email is invalid or uses a blocked provider.");
                }

                if (req.Select(db, "Email"))
                    return BASE(2, "Email already is registered.");

                return BASE();
            }
        }

        [HttpPost("submit/basic")]
        public async Task<IActionResult> PostSubmitBasic([FromBody] User req)
        {
            if (string.IsNullOrWhiteSpace(req.Email))
                return BASE(1, "Email is blank.");
            if (string.IsNullOrWhiteSpace(req.Username))
                return BASE(1, "Username is blank.");
            if (string.IsNullOrWhiteSpace(req.Password))
                return BASE(1, "Password is blank.");
            req.Email = req.Email.Trim().ToLower();
            req.Username = req.Username.ToLower().Trim().Replace(" ", "");
            if(req.Username.Length < 4)
                return BASE(1, "Username must be at least 4 characters long.");
            if (req.Password.Length < 8)
                return BASE(1, "Password must be at least 8 characters long.");

            string? err;

            if(Config.I.ApplicationID != 0 && Config.I.ApplicationID != 7)
            {
                err = GeneralUtil.UsernameComliant(req.Username, false);
                if (err != null)
                    return BASE(3, err);
            }

            err = GeneralUtil.PasswordCompliant(req.Password, 0);
            if (err != null)
                return BASE(4, err);

            if (!Config.I.Debug)
            {
                if (!MailUtil.EmailIsOK(req.Email))
                    return BASE(2, "Email is invalid or uses a blocked provider.");
            }

            if(Config.I.ApplicationID == 7)
            {
                if(string.IsNullOrWhiteSpace(req.VendorName))
                    return BASE(2, "Vendor name cannot be blank.");
            }

            using (var db = await Database.CreateAsync())
            {
                if (req.Select(db, "Email"))
                    return BASE(2, "Email already is registered.");
                if(req.Select(db, "Username"))
                    return BASE(2, "Username is already registered.");

                if(req.IsRefClient)
                {
                    if (req.RefAccountInfo == null)
                        return BASE(2, "Reference account info is null.");

                    if (!req.RefAccountInfo.HasNoService && string.IsNullOrEmpty(req.RefAccountInfo.AccountNumber))
                        return BASE(2, "Reference Account Number is blank.");

                }

                var user = new User();
                user.Email = req.Email.ToLower();
                if(!string.IsNullOrEmpty(req.Phone))
                    user.Phone = GeneralUtil.StripPhone(req.Phone);
                user.Username = req.Username;
                user.Password = CryptUtil.HashPassword(req.Password);
                user.AddressID = new Address().Insert(db);
                user.IsRefUser = req.IsRefUser;
                user.IsRefClient = req.IsRefClient;
                user.IsAuctionUser = req.IsAuctionUser;
                user.IsBidder = req.IsBidder;
                user.IsAuctioneer = req.IsAuctioneer;
                user.FirstName = req.FirstName;
                user.LastName = req.LastName;
                if(user.Address != null)
                    user.AddressID = user.Address.Insert(db);
                user.ID = user.Insert(db);

                if(req.Vendor != null)
                {
                    if(req.Vendor.Address != null)
                        req.Vendor.AddressID = req.Vendor.Address.Insert(db);
                    var vendor = new Vendor() { Name = req.Vendor.Name };
                    req.Vendor.ID = vendor.ID = vendor.Insert(db);
                    req.Vendor.Update(db, "Name,Phone,Email,AddressID");
                    user.IsVendor = true;
                    user.Update(db, "IsVendor");
                    var uv = new UserVendor() { VendorID = vendor.ID, UserID = user.ID };
                    uv.Insert(db);
                }

                if(req.ReferralSurvey != null)
                {
                    req.ReferralSurvey.UserID = user.ID;
                    req.ReferralSurvey.Insert(db);
                }

                if(req.RefAccountInfo != null)
                {
                    req.RefAccountInfo.UserID = user.ID;
                    
                    if(req.RefAccountInfo.UtilityBillFile != null)
                    {
                        try
                        {
                            if (string.IsNullOrEmpty(req.RefAccountInfo.UtilityBillFile.Base64Content))
                                throw new Exception("Utility Bill data is blank.");
                            using (var ms = new MemoryStream(Convert.FromBase64String(req.RefAccountInfo.UtilityBillFile.Base64Content)))
                            {
                                var si = StorageUtil.Put(ms, Guid.NewGuid().ToString(), req.RefAccountInfo.UtilityBillFile.MimeType, req.RefAccountInfo.UtilityBillFile.OriginalFileName);
                                if (si != null)
                                    req.RefAccountInfo.UtilityBillFileID = si.ID;
                            }
                        }
                        catch(Exception ex)
                        {
                            Console.WriteLine("RefAccountInfo.UtilityBillFile Upload: Error: " + ex.Message);
                        }
                    }

                    req.RefAccountInfo.Insert(db);

                    if (req.ReferralSurvey == null)
                        req.ReferralSurvey = new ReferralOnboardSurvey();

                    req.ReferralSurvey.IsInterestedSolar = true;

                    if (!string.IsNullOrEmpty(HttpContext.Request.Cookies["CM-Session"]))
                    {
                        using (var redis = await RedisUtil.CreateAsync())
                        {
                            redis.Delete("referral-reg-" + HttpContext.Request.Cookies["CM-Session"]);
                            HttpContext.Response.Cookies.Delete("CM-Session");
                        }
                    }

                }

                bool leadExists = false;

                if (req.IsRefClient)
                {
                    if (!string.IsNullOrEmpty(user.Phone))
                    {
                        var lead = new ReferralLead() { Phone = GeneralUtil.StripPhone(user.Phone) };
                        if (lead.Select(db, "Phone"))
                        {
                            lead.LeadUserID = user.ID;
                            lead.Status = "Confirmed";
                            lead.Update(db, "LeadUserID,Status");
                            leadExists = true;
                        }
                    }
                }

                if (req.ReferralSurvey != null)
                {
                    if (req.ReferralSurvey.IsInterestedSolar && !leadExists)
                    {
                        var program = new ReferralProgram() { ID = 1 }; //TODO: make variable
                        program.Select(db, "ID");
                        var lead = new ReferralLead()
                        {
                            FullName = user.FirstName + ' ' + user.LastName,
                            FirstName = user.FirstName,
                            LastName = user.LastName,
                            Email = user.Email,
                            Phone = user.Phone,
                            ReferredByUserID = user.ID,
                            LeadUserID = user.ID,
                            Status = "Confirmed",
                            ProgramID = program.ID,
                            ProgramIdent = program.Ident
                        };
                        lead.Insert(db);
                    }
                }

                req.Password = null;

                string url = user.IsAuctionUser ? Config.I.AuctionAppUrl : (Config.I.AppUrl ?? Config.I.BaseUrl);

                if(Config.I.ApplicationID == 7)
                {
                    url = Config.I.AppUrl;
                    var vendor = new Vendor() { Name = req.VendorName, IsWaiterNet = true, CreatedByUserID = user.ID };
                    vendor.ID = vendor.Insert(db);
                    var userVendor = new UserVendor() { VendorID = vendor.ID, UserID = user.ID };
                    userVendor.Insert(db);
                    var se = new SessionExtra() { UserID = user.ID, ActiveVendorID = vendor.ID };
                    se.Insert(db);
                }

                MailUtil.SendUserInvite(user, url, Config.I.AppName);

                await AuditLog.WriteAsync(db, "Has created his user.", user.ID);

                try
                {
                    MailUtil.Send(Config.I.AdminEmail, "New user: " + user.Username, "User has registered in " + Config.I.AppName + " with username '" + user.Username + "' and email '" + user.Email + "'.");
                }
                catch {}

                if(Config.I.ApplicationID == 7)
                {
                    string sid = UserUtil.PutToSession(user, db);
                    HttpContext.Response.Cookies.Append("CM-Auth", sid, new CookieOptions()
                    {
                        Expires = DateTime.UtcNow.AddDays(7),
                        Secure = Config.I.Debug ? false : true,
                        SameSite = Config.I.Debug ? SameSiteMode.Lax : SameSiteMode.None
                    });
                }
                
                return BASE();
            }
        }

        [HttpPost("submit")]
        public async Task<IActionResult> PostSubmit()
        {
            using (var redis = await RedisUtil.CreateAsync())
            {
                string sid = HttpContext.Request.Cookies["CM-Signup"];
                if (string.IsNullOrEmpty(sid))
                    return Ok(new BaseResponse(2, "Invalid session id."));

                string data = redis.Get(sid);

                if (string.IsNullOrEmpty(data))
                    return Ok(new BaseResponse(1, "Session not found."));

                var user = JsonConvert.DeserializeObject<User>(data);

                if(user.Step < 3)
                    return Ok(new BaseResponse(2, "Not all steps are complete."));


                using (var db = await Database.CreateAsync())
                {
                    var ins = new User();
                    ins.AddressID = user.Address.Insert(db);
                    ins.Username = user.Email;
                    ins.Email = user.Email;
                    ins.Password = CryptUtil.HashPassword(user.Password);
                    ins.FirstName = user.FirstName;
                    ins.LastName = user.LastName;
                    ins.IsVendor = user.IsVendor;
                    ins.Phone = user.Phone;
                    ins.ID = ins.Insert(db);

                    ins.Password = null;
                    string usid = UserUtil.PutToSession(ins, db);
                    HttpContext.Response.Cookies.Append("CM-Auth", usid);

                    MailUtil.SendUserInvite(ins, Config.I.BaseUrl);

                    await AuditLog.WriteAsync(db, "Has created his user.", user.ID);
                    

                    var ident = Guid.NewGuid().ToString();
                    redis.Put(ident, CurrentUser.ID.ToString(), DateTime.UtcNow.AddDays(7));


                    TwilioUtil.SendUserInvite(CurrentUser, Config.I.BaseUrl);

                }

                redis.Delete(sid);

                return Ok(new BaseResponse());
            }
        }

        [HttpGet("session")]
        public async Task<IActionResult> GetSession()
        {
            using (var redis = await RedisUtil.CreateAsync())
            {
                string sid = HttpContext.Request.Cookies["CM-Signup"];

                if(string.IsNullOrEmpty(sid))
                    return Ok(new BaseResponse(2, "Invalid session id."));

                string data = redis.Get(sid);

                if (string.IsNullOrEmpty(data))
                    return Ok(new BaseResponse(1, "Session not found."));

                var user = JsonConvert.DeserializeObject<User>(data);

                user.Password = null;

                return Ok(new ItemResponse(user));
            }
        }
    }
}
