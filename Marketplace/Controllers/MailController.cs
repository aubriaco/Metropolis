/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System.Dynamic;
using Marketplace.Util;
using MarketplaceData;
using MarketplaceData.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/mail")]
    public class MailController : BaseController
    {
        public class InboundMail
        {
            public string headers { get; set; } = "";
            public string dkim { get; set; } = "";
            public string contentIds { get; set; } = "";
            public string to { get; set; } = "";
            public string from { get; set; } = "";
            public string html { get; set; } = "";
            public string text { get; set; } = "";
            public string sender_ip { get; set; } = "";
            public string spam_report { get; set; } = "";
            public string envelope { get; set; } = "";
            public string attachments { get; set; } = "";
            public string subject { get; set; } = "";
            public string spam_score { get; set; } = "";
            public string attachmentInfo { get; set; } = "";
            public string charsets { get; set; } = "";
            public string SPF { get; set; } = "";
        }

        private static string GetField(string body, string field)
        {
            int idx = body.IndexOf("\r\n");
            if(idx > -1)
            {
                string sep = body.Substring(0, idx);
                string find = sep + "\r\nContent-Disposition: form-data; name=\"" + field + "\"\r\n\r\n";
                idx = body.IndexOf(find);
                if(idx > -1)
                { 
                    string tmp = body.Substring(idx + find.Length);
                    idx = tmp.IndexOf("\r\n" + sep);
                    if(idx > -1)
                    {
                        return tmp.Substring(0, idx);
                    }
                }
            }
            return "";
        }

        [HttpPost("inbound")]
        public async Task<IActionResult> PostInbound()
        {
            string body;
            using(var sr = new StreamReader(Request.Body))
            {
                body = await sr.ReadToEndAsync();
                string subject = GetField(body, "subject");
                string html = GetField(body, "html");
                string text = GetField(body, "text");
                string from = GetField(body, "from");
                string to = GetField(body, "to");

                using(var db = await Database.CreateAsync())
                {
                    var mm = new MailData()
                    {
                        Subject = subject,
                        MailFrom = from,
                        MailTo = to,
                        BodyHtml = html,
                        BodyText = text
                    };
                    mm.Insert(db);
                }

                MailUtil.Send("aubriaco@solusek.com", subject, string.IsNullOrWhiteSpace(html) ? text : html, null, null, null, from);
                MailUtil.Send("alessandro.ubriaco@gmail.com", subject, string.IsNullOrWhiteSpace(html) ? text : html, null, null, null, from);
            }
            return BASE();
        }
    }
}