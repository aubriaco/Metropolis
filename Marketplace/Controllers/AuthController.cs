/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Models.Responses;
using MarketplaceData.Models;
using MarketplaceData.Util;
using MarketplaceData;
using Marketplace.Util;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Newtonsoft.Json;
using System.Dynamic;
using Marketplace;
using System.Security.Cryptography;
using Marketplace.Models.Requests;
using Marketplace.Util.Models;
using MarketplaceData.Models.API;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : BaseController
    {

        [HttpGet("config")]
        [Produces("application/json")]
        public async Task<IActionResult> GetConfig()
        {
            if (Config.I == null)
                return BASE(1, "Not configured.");
            var bypass = Convert.ToBoolean(Request.Cookies["CM-Bypass"] ?? "false");

            dynamic r = new ExpandoObject();
            r.requireSSL = false;
            r.debug = Config.I.Debug;
            r.ident = Config.I.Ident;
            if (bypass)
                r.ident = "dev";
            if (!r.debug)
                r.requireSSL = true;
            return Ok(new ItemResponse(r));
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetUser()
        {
            var user = CurrentUser;

            if (user == null)
                return Ok(new BaseResponse(1, "Not logged in."));
            else
            {
                using (var db = await Database.CreateAsync())
                {
                    UserUtil.UpdateSession(user, db);
                }
                HttpContext.Response.Cookies.Append("CM-Auth", HttpContext.Request.Cookies["CM-Auth"], new CookieOptions()
                {
                    Expires = DateTime.UtcNow.AddDays(7),
                    Secure = Config.I.Debug ? false : true,
                    SameSite = Config.I.Debug ? SameSiteMode.Lax : SameSiteMode.None
                });
                user.Pin = null;
                return Ok(new ItemResponse(user));
            }
        }

        [HttpGet("user/full")]
        public async Task<IActionResult> UserFull()
        {
            var user = CurrentUser;

            if (user == null)
                return Ok(new BaseResponse(1, "Not logged in."));
            else
            {
                using (var db = await Database.CreateAsync())
                {
                    user.Address = new Address() { ID = user.AddressID };
                    if(user.Address.ID != 0)
                        user.Address.Select(db, "ID");
                    UserUtil.UpdateSession(user, db);
                }
                HttpContext.Response.Cookies.Append("CM-Auth", HttpContext.Request.Cookies["CM-Auth"], new CookieOptions()
                {
                    Expires = DateTime.UtcNow.AddDays(7),
                    Secure = Config.I.Debug ? false : true,
                    SameSite = Config.I.Debug ? SameSiteMode.Lax : SameSiteMode.None
                });
                return Ok(new ItemResponse(user));
            }
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> PostVerifyEmail([FromBody] CodeRequest req)
        {
            //if(CurrentUser == null)
            //    return Ok(new BaseResponse(1, "Not logged in."));

            using (var redis = await RedisUtil.CreateAsync())
            {
                var data = redis.Get(req.Code);
                if (string.IsNullOrEmpty(data))
                    return Ok(new BaseResponse(2, "Invalid session."));

                
                redis.Delete(req.Code);
                try
                {
                    var id = Convert.ToInt64(data);
                    using (var db = await Database.CreateAsync())
                    {
                        var user = new User();
                        user.ID = id;
                        if (!user.Select(db, "ID"))
                            return Ok(new BaseResponse(4, "User does not exist."));
                        if (user.EmailVerified)
                            return Ok(new BaseResponse(5, "This email is already validated."));
                        user.EmailVerified = true;
                        user.Update(db, "EmailVerified");
                        if (CurrentUser != null)
                        {
                            user.SID = CurrentUser.SID;
                            UserUtil.UpdateSession(user, db);
                        }
                        else
                        {
                            user.Password = null;
                            UserUtil.PutToSession(user, db);
                            HttpContext.Response.Cookies.Append("CM-Auth", user.SID, new CookieOptions()
                            {
                                Expires = DateTime.UtcNow.AddDays(7),
                                Secure = Config.I.Debug ? false : true,
                                SameSite = Config.I.Debug ? SameSiteMode.Lax : SameSiteMode.None
                            });
                        }
                        await AuditLog.WriteAsync(db, "Has verified email.", user.ID);
                        return ITEM(user.GetPublic<User>());
                    }
                }
                catch
                {
                    return Ok(new BaseResponse(3, "Invalid session data."));
                }
            }
        }

        [HttpPost("verify-email/resend")]
        public async Task<IActionResult> PostVerifyEmailResend()
        {
            if (Config.I == null || Config.I.BaseUrl == null)
                return Ok(new BaseResponse(-1, "Not configured."));

            if(CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            if (CurrentUser.EmailVerified)
                return Ok(new BaseResponse(5, "This email is already validated."));

            using (var redis = await RedisUtil.CreateAsync())
            {
                var lockName = "lock-ve-resend-" + CurrentUser.ID;
                var lck = redis.Get(lockName);
                if (!string.IsNullOrEmpty(lck))
                    return Ok(new BaseResponse(2, "You can not re-request a new verification email so soon."));


                var ident = Guid.NewGuid().ToString();
                redis.Put(ident, CurrentUser.ID.ToString(), DateTime.UtcNow.AddDays(7));
                

                MailUtil.SendUserInvite(CurrentUser, Config.I.BaseUrl);

                redis.Put(lockName, "true", DateTime.UtcNow.AddMinutes(1));


                return Ok(new BaseResponse());
            }
        }

        [HttpPost("verify-phone")]
        public async Task<IActionResult> PostVerifyPhone([FromBody] CodeRequest req)
        {
            //if(CurrentUser == null)
            //    return Ok(new BaseResponse(1, "Not logged in."));

            using (var redis = await RedisUtil.CreateAsync())
            {
                var data = redis.Get(req.Code);
                if (string.IsNullOrEmpty(data))
                    return Ok(new BaseResponse(2, "Invalid session."));

                redis.Delete(req.Code);
                try
                {
                    var id = Convert.ToInt64(data);
                    using (var db = await Database.CreateAsync())
                    {
                        var user = new User();
                        user.ID = id;
                        if (!user.Select(db, "ID"))
                            return Ok(new BaseResponse(4, "User does not exist."));
                        if (user.PhoneVerified)
                            return Ok(new BaseResponse(5, "This email is already validated."));
                        user.PhoneVerified = true;
                        user.Update(db, "PhoneVerified");
                        if (CurrentUser != null)
                        {
                            user.SID = CurrentUser.SID;
                            UserUtil.UpdateSession(user, db);
                        }
                        await AuditLog.WriteAsync(db, "Has verified phone.", user.ID);
                    }
                    return Ok(new BaseResponse());
                }
                catch
                {
                    return Ok(new BaseResponse(3, "Invalid session data."));
                }
            }
        }

        [HttpPost("verify-phone/resend")]
        public async Task<IActionResult> PostVerifyPhoneResend()
        {
            if (Config.I == null || Config.I.BaseUrl == null)
                return Ok(new BaseResponse(-1, "Not configured."));

            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Not logged in."));

            if (CurrentUser.PhoneVerified)
                return Ok(new BaseResponse(5, "This phone is already validated."));

            using (var redis = await RedisUtil.CreateAsync())
            {

                if(!LockUtil.Lock("lock-vp-resend", CurrentUser.ID.ToString(), 1, DateTime.UtcNow.AddMinutes(1)))
                    return Ok(new BaseResponse(2, "You can not re-request a new verification so soon."));


                var ident = Guid.NewGuid().ToString();
                redis.Put(ident, CurrentUser.ID.ToString(), DateTime.UtcNow.AddDays(7));


                TwilioUtil.SendUserInvite(CurrentUser, Config.I.BaseUrl);

                return Ok(new BaseResponse());
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] User req)
        {
            if(string.IsNullOrEmpty(req.Email))
                return Ok(new BaseResponse(1, "Email is blank."));

            using (var db = await Database.CreateAsync())
            {
                var user = new User()
                {
                    Email = req.Email.Trim().ToLower()
                };

                if(!user.Select(db, "Email"))
                    return Ok(new BaseResponse(1, "No user found registered with email."));

                using (var redis = await RedisUtil.CreateAsync())
                {
                    var lockName = "lock-ve-resend-" + user.ID;
                    var lck = redis.Get(lockName);
                    if (!string.IsNullOrEmpty(lck))
                        return Ok(new BaseResponse(2, "You can not re-request a password reset so soon."));


                    MailUtil.SendPasswordReset(user, user.IsAuctionUser ? Config.I.AuctionAppUrl : Config.I.BaseUrl);

                    redis.Put(lockName, "true", DateTime.UtcNow.AddMinutes(1));

                    await AuditLog.WriteAsync(db, "Requested password reset for user.", user.ID);

                    return Ok(new BaseResponse());
                }
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> SetPassword([FromBody] User req)
        {
            if (req.Password != req.ConfirmPassword)
                return Ok(new BaseResponse(3, "Passwords do not match"));

            var compliant = GeneralUtil.PasswordCompliant(req.Password, 0);

            if (compliant != null)
                return Ok(new BaseResponse(2, compliant));

            using (var redis = await RedisUtil.CreateAsync())
            {
                var userIdStr = redis.Get("passwordreset-" + req.Code);

                if (string.IsNullOrEmpty(userIdStr))
                    return Ok(new BaseResponse(6, "Invalid or expired reset link. Please request a new one."));


                redis.Delete("passwordreset-" + req.Code);

                using (var db = await Database.CreateAsync())
                {

                    var user = new User();
                    user.ID = Convert.ToInt64(userIdStr);
                    if (user.Select(db, "ID"))
                    {
                        user.Password = CryptUtil.HashPassword(req.Password);
                        user.EmailVerified = true;
                        user.Update(db, "Password,EmailVerified");
                        user.Password = req.Password;
                        await AuditLog.WriteAsync(db, "User has set a new password.", user.ID);
                        return await Login(user);
                    }
                    else
                        return Ok(new BaseResponse(5, "User does not exist."));

                }
            }
        }

        [HttpPost("password-compliant")]
        public async Task<IActionResult> PostPasswordCompliant([FromBody] User req)
        {
            if(string.IsNullOrEmpty(req.Password))
                return BASE(2, "Password is blank.");

            var compliant = GeneralUtil.PasswordCompliant(req.Password, 0);

            if (compliant != null)
                return Ok(new BaseResponse(2, compliant));

            return BASE();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User req)
        {
            using (var db = await Database.CreateAsync())
            {
                var user = db.Login(req);
                if (user == null)
                    return Ok(new BaseResponse(1, "Invalid credentials."));
                else
                {
                    user.Address = Address.GetFromID<Address>(db, user.AddressID);
                    string sid = UserUtil.PutToSession(user, db);
                    HttpContext.Response.Cookies.Append("CM-Auth", sid, new CookieOptions()
                    {
                        Expires = DateTime.UtcNow.AddDays(7),
                        Secure = Config.I.Debug ? false : true,
                        SameSite = Config.I.Debug ? SameSiteMode.Lax : SameSiteMode.None
                    });
                    if(!string.IsNullOrEmpty(req.ReturnLoc))
                        user.ReturnLoc = req.ReturnLoc;
                        
                    return Ok(new ItemResponse(user));
                }
            }
        }


        [HttpPost("login/email")]
        public async Task<IActionResult> LoginEmail([FromBody] User req)
        {
            if (string.IsNullOrWhiteSpace(req.Email))
                return BASE(2, "Email is blank.");
            if (string.IsNullOrEmpty(req.Password))
                return BASE(2, "Password is blank.");
            using (var db = await Database.CreateAsync())
            {
                var user = MarketplaceData.Models.User.LoginByEmail(db, req.Email, req.Password);
                if (user == null)
                {
                    var test = new User() { Email = req.Email.Trim().ToLower() };
                    if(!MailUtil.EmailIsOK(test.Email) || test.SelectID(db, "Email"))
                        return Ok(new BaseResponse(1, "Invalid credentials."));
                    else
                        return Ok(new BaseResponse(10, "Invalid credentials."));
                }
                else
                {
                    if(Config.I.ApplicationID != 7)
                    {
                        if (!user.EmailVerified)
                            return Ok(new BaseResponse(1, "Email is not verified. Please click the link you received in your email."));
                    }
                    user.Address = new Address() { ID = user.AddressID };
                    user.Address.Select(db, "ID");
                    string sid = UserUtil.PutToSession(user, db);
                    HttpContext.Response.Cookies.Append("CM-Auth", sid, new CookieOptions()
                    {
                        Expires = DateTime.UtcNow.AddDays(7),
                        Secure = Config.I.Debug ? false : true,
                        SameSite = Config.I.Debug ? SameSiteMode.Lax : SameSiteMode.None
                    });
                    if (!string.IsNullOrEmpty(req.ReturnLoc))
                        user.ReturnLoc = req.ReturnLoc;

                    await AuditLog.WriteAsync(db, "User has logged in.", user.ID);

                    return Ok(new ItemResponse(user));
                }
            }
        }


        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            using (var redis = await RedisUtil.CreateAsync())
            {
                redis.Delete(HttpContext.Request.Cookies["CM-Auth"]);
            }
            HttpContext.Response.Cookies.Delete("CM-Auth");
            return Ok(new BaseResponse());
        }

        [HttpPost("mode/view")]
        public async Task<IActionResult> PostModeView([FromBody] User req)
        {
            if(CurrentUser == null)
                return BASE(1, "Not logged in.");
            
            CurrentUser.Pin = req.Pin;
            CurrentUser.IsViewMode = true;
            UserUtil.UpdateSession(CurrentUser);

            return ITEM(CurrentUser);
        }

        [HttpPost("mode/reset")]
        public async Task<IActionResult> PostModeReset([FromBody] User req)
        {
            if(CurrentUser == null)
                return BASE(1, "Not logged in.");
            
            if(CurrentUser.Pin != req.Pin)
                return BASE(2, "Incorrect pin.");
                
            CurrentUser.IsViewMode = false;
            UserUtil.UpdateSession(CurrentUser);

            return ITEM(CurrentUser);
        }

        [HttpPost("session")]
        public async Task<IActionResult> PostSessionLoad(InboundSession req)
        {
            using(var db = await Database.CreateAsync())
            {
                using var consume = new NpgsqlCommand(
                    "DELETE FROM inboundsession WHERE sessionid = @id AND expiresdate > @now AND expiresdate <= @latest AND createddate >= @oldest RETURNING userid", db.C);
                consume.Parameters.AddWithValue("id", req.SessionID);
                var now = DateTime.UtcNow;
                consume.Parameters.AddWithValue("now", now);
                consume.Parameters.AddWithValue("latest", now.AddMinutes(5));
                consume.Parameters.AddWithValue("oldest", now.AddMinutes(-5));
                if (await consume.ExecuteScalarAsync() is not long userId)
                    return BASE(1, "Invalid or expired session.");

                var user = new User { ID = userId };
                if(!user.Select(db, "ID"))
                    return BASE(3, "User does not exist.");

                user.Address = new Address() { ID = user.AddressID };
                user.Address.Select(db, "ID");

                string sid = UserUtil.PutToSession(user, db);
                HttpContext.Response.Cookies.Append("CM-Auth", sid, new CookieOptions()
                {
                    HttpOnly = true,
                    Expires = DateTime.UtcNow.AddDays(7),
                    Secure = Config.I.Debug ? false : true,
                    SameSite = Config.I.Debug ? SameSiteMode.Lax : SameSiteMode.None
                });

                return ITEM(user);
            }
        }
    }
}
