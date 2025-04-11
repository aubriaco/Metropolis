/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using CsvHelper;
using Marketplace.Models.Responses;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Util;
using Marketplace;
using Marketplace.Util;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Globalization;
using System.Text.RegularExpressions;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/content")]
    public class ContentController : BaseController
    {
        public static string? ALL = null;

        [HttpGet("version")]
        public async Task<IActionResult> GetVersion()
        {
            return Ok(new ItemResponse(VersionUtil.Get()));
        }

        [HttpPost("bypass")]
        public async Task<IActionResult> PostBypass()
        {
            Response.Cookies.Append("CM-Bypass", "true");
            Response.Cookies.Delete("CM-Mode");
            return Ok(new BaseResponse());
        }


        [HttpGet("stage")]
        public async Task<IActionResult> GetStage()
        {
            if (Config.I == null)
                return Ok(new BaseResponse(-1, "Not configured."));
            var stage = Config.I.Stage ?? "default";
            return Ok(new ItemResponse(stage));
        }

        [HttpGet("mode/get")]
        public async Task<IActionResult> GetMode()
        {
            var mode = Request.Cookies["CM-Mode"];
            return Ok(new ItemResponse(mode));
        }

        [HttpPost("mode/set/vendorsignup")]
        public async Task<IActionResult> PostModeVendorSignup()
        {
            Response.Cookies.Append("CM-Mode", "vendorsignup", new CookieOptions() { Expires = DateTime.UtcNow.AddDays(1),
                Secure = Config.I.Debug ? false : true,
                SameSite = Config.I.Debug ? SameSiteMode.Lax : SameSiteMode.None
            });
            return Ok(new BaseResponse());
        }

        /*
        [HttpGet("js")]
        public async Task<IActionResult> JS()
        {
            if (Config.I == null)
                return BadRequest(new BaseResponse(-1, "Not configured."));
            if (ALL != null && !Config.I.Squish)
                return Content(ALL, "application/javascript");
            ContentUtil.SquishHTMLFiles("./", "wwwroot", false);
            ContentUtil.SquishHTMLFiles("views-src", "wwwroot/views");
            ContentUtil.SquishJSFiles("js-src", "wwwroot/js");
            ALL = System.IO.File.ReadAllText("wwwroot/js/all.js");
            return Content(ALL, "application/javascript");
        }
        */


        [HttpGet("lang/get")]
        public async Task<IActionResult> GetLang()
        {
            string? lang = Request.Cookies["CM-Lang"];
            if (string.IsNullOrEmpty(lang))
                lang = "es";
            return ITEM(lang);
        }

        [HttpPost("lang/set/{lang}")]
        public async Task<IActionResult> PostLangSet([FromRoute] string lang)
        {
            Response.Cookies.Append("CM-Lang", lang, new CookieOptions() { Expires = DateTime.UtcNow.AddYears(1),
                Secure = Config.I.Debug ? false : true,
                SameSite = Config.I.Debug ? SameSiteMode.Lax : SameSiteMode.None
            });
            if(CurrentUser != null)
            {
                using(var db = await Database.CreateAsync())
                {
                    CurrentUser.Lang = lang;
                    CurrentUser.Update(db, "Lang");
                    UserUtil.PutToSession(CurrentUser);
                }
            }
            return BASE();
        }

        [HttpGet("sticky/get/{name}")]
        public async Task<IActionResult> GetSticky([FromRoute] string name)
        {
            string? sticky = Request.Cookies["CM-Sticky-" + name];
            if (string.IsNullOrEmpty(sticky))
                return ITEM("");
            else
                return ITEM(sticky);
        }

        [HttpPost("sticky/set/{name}")]
        public async Task<IActionResult> PostStickySet([FromRoute] string name, [FromQuery] string? val = "true")
        {
            Response.Cookies.Append("CM-Sticky-" + name, val, new CookieOptions() { Expires = DateTime.UtcNow.AddYears(1),
                Secure = Config.I.Debug ? false : true,
                SameSite = Config.I.Debug ? SameSiteMode.Lax : SameSiteMode.None
            });
            return BASE();
        }

        private void ProcessMatches(ref string body, IEnumerable<Match> matches)
        {
            foreach (Match m in matches)
            {
                
                if (!string.IsNullOrWhiteSpace(m.Groups[1].Value))
                {
                    if(!m.Groups[1].Value.Contains('{') && !m.Groups[1].Value.Contains('>'))
                    {
                        var newValue = " {{getLang('" + m.Groups[1].Value.Trim().Replace("'", "\\'") + "')}} ";
                        body = body.Replace(">" + m.Groups[1].Value + "<", ">" + newValue + "<");
                    }
                }
            }
        }

        [HttpGet("process-html")]
        public async Task<IActionResult> ProcessHTML()
        {
            if (Config.I == null)
                return BadRequest(new BaseResponse(-1, "Not configured."));
            if (!Config.I.Debug)
                return BadRequest(new BaseResponse(1, "Not in debug mode."));
        
            var files = Directory.GetFiles("views-src", "*.html", SearchOption.AllDirectories);
            foreach (var file in files)
            {
                Console.WriteLine(file);
                var body = System.IO.File.ReadAllText(file);
                try
                {

                    var matches = Regex.Matches(body, ">([^<]+)<");

                    ProcessMatches(ref body, matches);

                    System.IO.File.WriteAllText(file, body);
                }
                catch
                {
                    Console.WriteLine("Error processing: " + file);
                }
            }

            return Ok(new BaseResponse());
        }

        [HttpGet("generate-lang-csv")]
        public async Task<IActionResult> GenerateLangCSV()
        {
            if(Config.I == null)
                return BadRequest(new BaseResponse(-1, "Not configured."));
            if (!Config.I.Debug)
                return BadRequest(new BaseResponse(1, "Not in debug mode."));

            var files = Directory.GetFiles("wwwroot/views", "*.html", SearchOption.AllDirectories);

            using (var csvFile = new MemoryStream())
            {
                using (var sw = new StreamWriter(csvFile))
                {
                    var used = new List<string>();
                    using (var csv = new CsvWriter(sw, CultureInfo.InvariantCulture))
                    {
                        csv.WriteField("English");
                        csv.WriteField("Spanish");
                        csv.NextRecord();
                        foreach (var file in files)
                        {
                            Console.WriteLine(file);
                            var body = System.IO.File.ReadAllText(file);
                            try
                            {

                                var matches = Regex.Matches(body, "{{getLang\\('([^\\)]+)'\\)}}");

                                foreach (Match match in matches)
                                {
                                    if (used.Contains(match.Groups[1].Value))
                                        continue;
                                    used.Add(match.Groups[1].Value);
                                    csv.WriteField(match.Groups[1].Value);
                                    csv.WriteField("");
                                    csv.NextRecord();
                                }

                            }
                            catch
                            {
                                Console.WriteLine("Error processing: " + file);
                            }
                        }
                    }
                }
                return File(csvFile.ToArray(), "text/csv");
            }

        }

        // Static

        public static string? GetMode(HttpContext ctx)
        {
            return ctx.Request.Cookies["CM-Mode"];
        }
    }
}
