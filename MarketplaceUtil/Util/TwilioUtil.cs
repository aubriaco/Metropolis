/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Marketplace.Util
{
    public static class TwilioUtil
    {
        private static bool Initialized = false;
        private static string? DefaultPhone = null, SID = null, Token = null;

        public static bool Enabled
        {
            get
            {
                return Initialized;
            }
        }

        public static void Init(string sid, string token, string defaultPhone)
        {
            SID = sid;
            Token = token;
            if (defaultPhone == null)
                throw new Exception("Default phone must be configured.");
            DefaultPhone = defaultPhone.Replace("-", "").Replace(" ", "").Replace("(", "").Replace(")", "");
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            Initialized = true;
        }



        public static string? _Send(string to, string msg)
        {
            if (!Initialized)
                return null;
            if(DefaultPhone == null)
                throw new Exception("DefaultPhone is null.");
            if (to == null)
                throw new Exception("TO is null.");
            if (msg == null)
                throw new Exception("MSG is null.");


            to = FormatPhone(to);

            if (!PhoneAllowed(to))
                return null;

            try
            {
                using (HttpClient client = new HttpClient())
                {
                    MultipartFormDataContent content = new MultipartFormDataContent
                    {
                        { new StringContent(msg), "Body" },
                        { new StringContent(DefaultPhone), "From" },
                        { new StringContent(to), "To" }
                    };
                    client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.ASCII.GetBytes(SID + ":" + Token)));
                    var response = client.PostAsync("https://api.twilio.com/2010-04-01/Accounts/" + SID + "/Messages.json", content).Result;
                    string respBody = response.Content.ReadAsStringAsync().Result;
                    if (response.IsSuccessStatusCode)
                    {
                        dynamic? o = JsonConvert.DeserializeObject(respBody);
                        if (o != null)
                        {
                            if (o.sid != null)
                                return (string?)o.sid;
                        }
                        throw new Exception("TWILIO ERROR: RESPONSE: " + respBody);
                    }
                    else
                        throw new Exception("TWILIO ERROR: CODE: " + response.StatusCode + " RESPONSE: " + respBody);
                }
            }
            catch(Exception e)
            {
                throw new Exception("TWILIO ERROR: " + e.Message);
            }
        }

        public static string FormatPhone(string s)
        {
            s = s.Replace("-", "").Replace("(", "").Replace(")", "").Replace(" ", "").Replace("+", "");
            if (s.Length < 11)
                s = "1" + s;
            return "+" + s;
        }

        public static bool PhoneAllowed(string s)
        {
            return s.StartsWith("+1");
        }


        // App Specific

        public static bool Send(string to, string msg)
        {
            if (Config.I == null)
                return false;
            var bmsg = Config.I.TitleShort + ": " + msg;
            var resp = _Send(to, bmsg);
            return (resp != null);
        }

        public static void SendUserInvite(User user, string baseUrl)
        {
            if (Config.I == null)
                throw new Exception("TwilioUtil: SendUserInvite: Not configured.");
            if (user.Phone == null)
                throw new Exception("TwilioUtil: SendUserInvite: User email is null.");
            using (var redis = new RedisUtil())
            {
                var ident = Guid.NewGuid().ToString();
                redis.Put(ident, user.ID.ToString(), DateTime.UtcNow.AddHours(1));
                Send(user.Phone, "You have registered with this phone. Please click the link to verify: " + baseUrl + "/my/verify-phone/" + ident);
            }
        }

    }
}
