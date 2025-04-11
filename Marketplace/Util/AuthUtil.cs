/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Models;
using MarketplaceData;
using Marketplace.Util;
using Marketplace;
using Newtonsoft.Json;
using Microsoft.Extensions.Primitives;

namespace Marketplace.Util
{
    public static class AuthUtil
    {
        public static string GetClientIPAddress(HttpContext context)
        {
            string? ipAddr = null;
            StringValues sv;
            if (context.Request.Headers.TryGetValue("X-Forwarded-For", out sv))
                ipAddr = sv.ToString();
            else
                ipAddr = context.Connection.RemoteIpAddress.ToString();
            return ipAddr;
        }

        public static User GetCurrentUser(HttpContext context)
        {
            string uuid = GetSID(context);
            if (uuid == null)
                return null;
            using (var redis = new RedisUtil())
            {
                string userJson = redis.Get(uuid);
                if (userJson != null)
                {
                    var user = JsonConvert.DeserializeObject<User>(userJson);
                    if (user == null)
                        return null;
                    if ((bool)user.RequireMFA && !(bool)user.MFA)
                        return null;
                    return user;
                }
            }
            return null;
        }

        public static bool IsHasAccess(Database db, HttpContext context, int roleId)
        {
            var r = HasAccess(db, context, roleId);
            return r;
        }


        public static bool HasAccess(Database db, string uuid, int roleId)
        {
            //todo
            return true;
        }

        public static bool HasAccess(Database db, HttpContext context, int roleId)
        {
            string uuid = GetSID(context);
            if (uuid == null)
                return false;
            return HasAccess(db, uuid, roleId);
        }

        public static string? GetSID(HttpContext context)
        {
            return context.Request.Cookies["CM-Auth"];
        }


    }
}
