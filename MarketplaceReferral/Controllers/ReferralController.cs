/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace;
using Marketplace.Controllers;
using Marketplace.Models.Responses;
using Marketplace.Util;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.Referral;
using MarketplaceData.Util;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using Tesseract;

namespace MarketplaceReferral.Controllers
{
    [ApiController]
    [Route("api/referral")]
    public class ReferralController : BaseController
    {
        [HttpGet("program/list")]
        public IActionResult GetProgramList()
        {
            using (var db = new Database())
            {
                var list = new ReferralProgram().List<ReferralProgram>(db, "");

                return LIST(ReferralProgram.GetPublicList<ReferralProgram>(list));
            }
        }

        [HttpGet("program")]
        public IActionResult GetProgram([FromQuery] string ident)
        {
            if (string.IsNullOrWhiteSpace(ident))
                return BASE(2, "Invalid program id.");

            using (var db = new Database())
            {
                var item = new ReferralProgram() { Ident = ident };
                if (!item.Select(db, "Ident"))
                    return BASE(2, "Program not found.");

                return ITEM(item.GetPublic<ReferralProgram>());
            }
        }

        [HttpGet("lead/list")]
        public IActionResult GetLeadList()
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = new Database())
            {
                var list = new ReferralLead() { ReferredByUserID = CurrentUser.ID }.List<ReferralLead>(db, "ReferredByUserID");

                return LIST(ReferralLead.GetPublicList(list));
            }
        }

        [HttpGet("lead/admin/list")]
        public IActionResult GetLeadAdminList()
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = new Database())
            {
                var list = new ReferralLead().List<ReferralLead>(db, "");
                return LIST(ReferralLead.GetPublicList(list));
            }
        }

        [HttpGet("lead/self")]
        public IActionResult GetLeadSelf()
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = new Database())
            {
                var item = new ReferralLead() { LeadUserID = CurrentUser.ID };
                if (!item.Select(db, "LeadUserID"))
                    return BASE(2, "None.");

                return ITEM(item);
            }
        }

        [HttpPost("lead/save")]
        public IActionResult PostLeadSave([FromBody] ReferralLead req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            if (string.IsNullOrWhiteSpace(req.FullName))
                return BASE(2, "Full Name is blank.");
            if (string.IsNullOrWhiteSpace(req.Email))
                return BASE(2, "Email is blank.");
            if (string.IsNullOrWhiteSpace(req.Phone))
                return BASE(2, "Phone is blank.");

            req.FullName = req.FullName.Trim();

            req.Phone = GeneralUtil.StripPhone(req.Phone);

            if (req.Phone.Length < 10)
                return BASE(2, "Invalid phone number.");

            using (var db = new Database())
            {
                req.EmptyNonEditable();

                var test = new ReferralLead() { Phone = req.Phone };
                if (test.Select(db, "Phone"))
                    return BASE(2, "This lead is already in our database.");

                req.ReferredByUserID = CurrentUser.ID;

                var p = req.FullName.Split(' ');
                req.FirstName = p[0];
                if (p.Length > 1)
                    req.LastName = p[1];

                req.ID = 0;

                var program = new ReferralProgram() { ID = 1 }; //TODO: make variable
                program.Select(db, "ID");

                req.ProgramID = program.ID;
                req.ProgramIdent = program.Ident;

                req.Ident = Guid.NewGuid().ToString().Replace("-", "");
                req.ID = req.Save(db);

                try
                {
                    MailUtil.Send(req.Email, "Programa de energía renovable", "Saludos " + req.FirstName + "!<br /><br />" + CurrentUser.Name + " te ha referido a nuestro programa de incentivos solares que puede ser de tu beneficio.<br /><br />Para mas información: <a href=\"" + Config.I.AppUrl + "/r/" + req.Ident + "\">" + Config.I.AppUrl + "/r/" + req.Ident + "</a><br /><br />O llamar: <a href=\"tel:(787)602-6285\">(787) 602-6285</a><br />Gracias por su atención!");
                }
                catch { }
                try
                {
                    TwilioUtil.Send(req.Phone, "Saludos " + req.FirstName + "! " + CurrentUser.Name + " te ha referido a nuestro programa de incentivos solares que puede ser de tu beneficio. Para mas información: " + Config.I.AppUrl + "/r/" + req.Ident + " ó # (787) 602-6285");
                }
                catch { }

                return BASE();
            }
        }

        [HttpGet("chart/rewards")]
        public IActionResult GetChartRewards()
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = new Database())
            {
                return LIST(ReferralLead.GetStatusChartData(db, CurrentUser.ID));
            }
        }

        [HttpPost("register/session/get")]
        public IActionResult PostRegisterSessionGet()
        {
            if (string.IsNullOrEmpty(HttpContext.Request.Cookies["CM-Session"]))
                return BASE(2, "Session empty.");
            var sid = HttpContext.Request.Cookies["CM-Session"];
            using (var redis = new RedisUtil())
            {
                var data = redis.Get("referral-reg-" + sid);
                if (string.IsNullOrEmpty(data))
                    return BASE(2, "Session not found.");

                dynamic? o = JsonConvert.DeserializeObject(data);
                if (o == null)
                    return BASE(2, "Session data invalid.");

                return Content(data);
            }
        }

        [HttpPost("register/session/save")]
        public async Task<IActionResult> PostRegisterSessionSave()
        {
            using (var redis = new RedisUtil())
            {
                using (var sr = new StreamReader(HttpContext.Request.Body))
                {
                    string sid = Guid.NewGuid().ToString();
                    var body = await sr.ReadToEndAsync();


                    redis.Put("referral-reg-" + sid, body, DateTime.UtcNow.AddDays(14));

                    HttpContext.Response.Cookies.Append("CM-Session", sid, new CookieOptions()
                    {
                        Expires = DateTime.UtcNow.AddDays(14),
                        Secure = Config.I.Debug ? false : true,
                        SameSite = Config.I.Debug ? SameSiteMode.Lax : SameSiteMode.None
                    });

                    return BASE();
                }
            }
        }

        [HttpPost("link")]
        public IActionResult PostLink([FromBody] ReferralLead req)
        {
            if (string.IsNullOrEmpty(req.Ident))
                return BASE(2, "Ref link ident is null.");

            using (var db = new Database())
            {
                if (!req.Select(db, "Ident"))
                    return BASE(2, "Ref link not found.");

                HttpContext.Response.Cookies.Append("CM-Ref", req.Ident, new CookieOptions()
                {
                    Expires = DateTime.UtcNow.AddDays(14),
                    Secure = Config.I.Debug ? false : true,
                    SameSite = Config.I.Debug ? SameSiteMode.Lax : SameSiteMode.None
                });

                return ITEM(req);
            }
        }

        [HttpPost("link/get")]
        public IActionResult PostLinkGet()
        {
            var ident = HttpContext.Request.Cookies["CM-Ref"];
            if (string.IsNullOrEmpty(ident))
                return BASE(2, "Ident is blank.");

            using (var db = new Database())
            {
                var item = new ReferralLead() { Ident = ident };
                if (!item.Select(db, "Ident"))
                    return BASE(2, "Lead not found.");

                if (item.Status != "Created")
                    return BASE(3, "Invalid lead status.");

                return ITEM(item.GetPublic<ReferralLead>());
            }
        }

        [HttpGet("product/recommend")]
        public IActionResult GetProductRecommend([FromQuery] int monthlyProduction)
        {
            if (monthlyProduction < 0)
                return BASE(2, "Invalid KWRate.");

            using (var db = new Database())
            {
                var item = RefProduct.GetForMonthlyProduction(db, monthlyProduction);
                if (item == null)
                    return BASE(3, "KWRate not found.");

                return ITEM(item);
            }
        }

        [HttpGet("register/pdf/upload/status")]
        public IActionResult GetRegisterPDFUploadStatus([FromQuery] string ident)
        {
            if (string.IsNullOrEmpty(ident))
                return BASE(2, "Ident is null.");

            using (var redis = new RedisUtil())
            {
                var data = redis.Get("register-pdf-upload-" + ident);
                if (string.IsNullOrEmpty(data))
                    return BASE(3, "No data.");

                if (data.StartsWith("PENDING"))
                    return BASE(10, data.Substring(8));

                return ITEM(JsonConvert.DeserializeObject<User>(data));
            }
        }

        [HttpPost("register/pdf/upload")]
        public IActionResult PostRegisterPDFUpload([FromBody] StorageItem req)
        {
            if (string.IsNullOrEmpty(req.Base64Content))
                return BASE(2, "Content is null.");

            string runIdent = Guid.NewGuid().ToString();

            Task.Run(() =>
            {
                var data = Convert.FromBase64String(req.Base64Content);

                var ident = Guid.NewGuid().ToString();


                var tmpDir = "./tmp";

                if (!Directory.Exists(tmpDir))
                    Directory.CreateDirectory(tmpDir);

                System.IO.File.WriteAllBytes(tmpDir + "/" + ident + ".pdf", data);

                using (var redis = new RedisUtil())
                {
                    redis.Put("register-pdf-upload-" + runIdent, "PENDING-Parsing Document", DateTime.UtcNow.AddMinutes(5));
                }

                var wd = tmpDir;

                Process process = new Process();
                process.StartInfo.FileName = Config.I.gs;
                process.StartInfo.Arguments = "-dBATCH -dNOPAUSE -sDEVICE=png16m -r600 -o \"" + wd + "/" + ident + "-%d.png\" \"" + wd + "/" + ident + ".pdf\"";
                process.Start();
                process.WaitForExit();


                System.IO.File.Delete(tmpDir + "/" + ident + ".pdf");

                var item = new User();
                item.Address = new Address();
                item.PhysicalAddress = new Address();
                item.ReferralSurvey = new ReferralOnboardSurvey();

                item.Address.Country = "Puerto Rico";
                item.PhysicalAddress.Country = "Puerto Rico";

                List<string>? cities = null;

                if (System.IO.File.Exists("const/pr-cities.json"))
                {
                    cities = JsonConvert.DeserializeObject<List<string>>(System.IO.File.ReadAllText("const/pr-cities.json"));
                }

                if (cities == null)
                    cities = new List<string>();

                var isAround = (Rect rect, long x, long y) =>
                {
                    var thresh = 25;
                    if (rect.X1 >= x - thresh && rect.X1 <= x + thresh && rect.Y1 >= y - thresh && rect.Y1 <= y + thresh)
                        return true;
                    return false;
                };

                for (var pn = 1; pn < 10; pn++)
                {
                    var fn = tmpDir + "/" + ident + "-" + pn + ".png";

                    if (System.IO.File.Exists(fn))
                    {
                        Console.WriteLine("FOUND: " + fn);
                        using (var redis = new RedisUtil())
                        {
                            redis.Put("register-pdf-upload-" + runIdent, "PENDING-Page " + pn, DateTime.UtcNow.AddMinutes(5));
                        }

                        var pngData = System.IO.File.ReadAllBytes(fn);

                        System.IO.File.Delete(fn);


                        using (var engine = new TesseractEngine(Config.I.tessdata, "spa", EngineMode.Default))
                        {
                            using (var img = Pix.LoadFromMemory(pngData))
                            {

                                using (var page = engine.Process(img))
                                {
                                    Console.WriteLine("Mean confidence: {0}", page.GetMeanConfidence());
                                    var lvl = PageIteratorLevel.Block;
                                    using (var it = page.GetIterator())
                                    {
                                        it.Begin();
                                        do
                                        {

                                            if (it.TryGetBoundingBox(lvl, out var rect))
                                            {
                                                var ls = it.GetText(lvl).Replace("\r", "").Trim();
                                                try
                                                {
                                                    Console.WriteLine("RECT: " + rect.X1 + " " + rect.Y1 + "\tTEXT: " + ls);
                                                    if (pn == 1)
                                                    {
                                                        if (isAround(rect, 2895, 466))
                                                        {
                                                            var lines = ls.Split('\n');
                                                            if (lines.Length > 0)
                                                            {
                                                                var name = lines[0];
                                                                Console.WriteLine("FullName: " + name);
                                                                var n = name.IndexOf(',');
                                                                if (n != -1)
                                                                {
                                                                    item.FirstName = name.Substring(n + 1);
                                                                    item.LastName = name.Substring(0, n);
                                                                }
                                                                else
                                                                {
                                                                    item.FirstName = name;
                                                                }
                                                            }
                                                            foreach (var l in lines)
                                                            {
                                                                if (l.StartsWith("Su número de cuenta:"))
                                                                {
                                                                    Console.WriteLine("Account #" + l.Substring(20).Trim());
                                                                    item.RefAccountInfo.AccountNumber = l.Substring(20).Trim();
                                                                }
                                                            }
                                                        }
                                                        else if (isAround(rect, 829, 1614))
                                                        {
                                                            var regex = new Regex("[^0-9\\.]");
                                                            var cost = Convert.ToDecimal(regex.Replace(ls, ""));
                                                            Console.WriteLine("Month cost: " + cost);
                                                            item.RefAccountInfo.CostMonth = cost;
                                                        }
                                                        else if (isAround(rect, 3833, 1583) || isAround(rect, 3883, 1583))
                                                        {
                                                            var regex = new Regex("[^0-9]");
                                                            var kwh = decimal.Parse(regex.Replace(ls, ""));
                                                            Console.WriteLine("KWH: " + kwh);
                                                            item.RefAccountInfo.KWHMonth = kwh;
                                                        }
                                                        else if (isAround(rect, 610, 5737))
                                                        {
                                                            var p = ls.Split('\n');
                                                            item.Address.Line1 = p[1];
                                                            item.PhysicalAddress.Line1 = p[1];
                                                            if (p.Length > 3)
                                                            {
                                                                item.Address.Line2 = p[2];
                                                                item.PhysicalAddress.Line2 = p[2];
                                                                ls = p[3];
                                                            }
                                                            else
                                                                ls = p[2];
                                                            var n = ls.LastIndexOf(' ');
                                                            if (n >= 0)
                                                            {
                                                                item.Address.PostalCode = ls.Substring(n + 1);
                                                                item.PhysicalAddress.PostalCode = ls.Substring(n + 1);
                                                                Console.WriteLine("Postal Code: " + item.Address.PostalCode);
                                                                ls = ls.Substring(0, n);
                                                                n = ls.LastIndexOf(' ');
                                                                if (n >= 0)
                                                                {
                                                                    item.Address.State = ls.Substring(n + 1);
                                                                    item.PhysicalAddress.State = ls.Substring(n + 1);
                                                                    Console.WriteLine("State: " + item.Address.State);
                                                                    ls = ls.Substring(0, n);
                                                                    item.Address.City = ls.Trim();
                                                                    item.PhysicalAddress.City = ls.Trim();
                                                                    Console.WriteLine("City: " + item.Address.City);
                                                                }
                                                            }
                                                        }
                                                        else if (isAround(rect, 2387, 1630))
                                                        {
                                                            var dt = DateTime.Parse(ls);
                                                            Console.WriteLine("Date: " + dt.ToString("yyyy-MM-dd"));
                                                            item.RefAccountInfo.InvoiceDate = dt;
                                                        }
                                                    }
                                                    else if (pn == 3)
                                                    {
                                                        if (isAround(rect, 518, 2949))
                                                        {
                                                            if (ls.StartsWith("Dirección del servicio:"))
                                                            {
                                                                ls = ls.Substring(25).Trim();

                                                                if (ls.Contains("Periodo:"))
                                                                {
                                                                    ls = ls.Substring(0, ls.IndexOf("Periodo:")).Trim();
                                                                }

                                                                var n = ls.LastIndexOf(' ');
                                                                if (n >= 0)
                                                                {
                                                                    item.PhysicalAddress.PostalCode = ls.Substring(n + 1);
                                                                    ls = ls.Substring(0, n).Trim();
                                                                    n = ls.LastIndexOf(' ');
                                                                    if (n >= 0)
                                                                    {
                                                                        item.PhysicalAddress.Country = "Puerto Rico";
                                                                        ls = ls.Substring(0, n).Trim();
                                                                        int len = 0;
                                                                        string? selectedCity = null;
                                                                        foreach (var city in cities)
                                                                        {
                                                                            if (ls.ToLower().EndsWith(city.ToLower()))
                                                                            {
                                                                                selectedCity = city;
                                                                                len = city.Length;
                                                                                break;
                                                                            }
                                                                        }

                                                                        if (selectedCity != null)
                                                                        {
                                                                            ls = ls.Substring(0, ls.Length - len).Trim();
                                                                        }
                                                                        else
                                                                        {
                                                                            n = ls.LastIndexOf(' ');
                                                                            if (n >= 0)
                                                                            {
                                                                                selectedCity = ls.Substring(n + 1).Trim();
                                                                                ls = ls.Substring(0, n).Trim();
                                                                            }
                                                                        }

                                                                        item.PhysicalAddress.Line1 = ls;
                                                                        item.PhysicalAddress.Line2 = "";

                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                catch (Exception ex)
                                                {
                                                    Console.WriteLine("Error: " + ex.Message);
                                                    Console.WriteLine("Line Data: " + ls);
                                                }
                                            }

                                        } while (it.Next(lvl));
                                    }



                                }
                            }
                        }
                    }
                }
                using (var redis = new RedisUtil())
                {
                    redis.Put("register-pdf-upload-" + runIdent, JsonConvert.SerializeObject(item), DateTime.UtcNow.AddMinutes(5));
                }
            });

            using (var redis = new RedisUtil())
            {
                redis.Put("register-pdf-upload-" + runIdent, "PENDING-Processing...", DateTime.UtcNow.AddMinutes(5));
            }

            return ITEM(runIdent);
        }
    }
}
