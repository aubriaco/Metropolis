/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData;
using MarketplaceData.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Marketplace.Util
{
    public class UserUtil
    {

        public static string PutToSession(User user, Database? db = null)
        {
            using (var redis = new RedisUtil())
            {
                string ident = Guid.NewGuid().ToString();
                user.Password = null;
                user.SID = ident;
                redis.Put(ident, JsonConvert.SerializeObject(user), DateTime.UtcNow.AddDays(7));
                if (db != null)
                {
                    user.LastSeenDate = DateTime.UtcNow;
                    user.Update(db, "LastSeenDate");
                }
                return ident;
            }
        }

        public static void UpdateSession(User user, Database db = null)
        {
            using (var redis = new RedisUtil())
            {
                user.Password = null;
                redis.Put(user.SID, JsonConvert.SerializeObject(user), DateTime.UtcNow.AddDays(7));
                if(db != null)
                {
                    user.LastSeenDate = DateTime.UtcNow;
                    user.Update(db, "LastSeenDate");
                }
            }
        }


        public static User GetFromSession(string? sid)
        {
            using (var redis = new RedisUtil())
            {
                string? data = redis.Get(sid);
                if (data != null)
                    return JsonConvert.DeserializeObject<User>(data);
                else
                    return null;
            }
        }

        public static bool CanManageVendor(Database db, long userId, long vendorId)
        {
            var uv = new UserVendor()
            {
                UserID = userId,
                VendorID = vendorId
            };
            if (uv.Select(db, "UserID,VendorID"))
                return true;
            return false;
        }

        public static bool CheckEmail(string email)
        {
            email = email.ToLower().Trim();
            if (email.Contains("@yopmail"))
                return false;
            return true;
        }
    }
}
