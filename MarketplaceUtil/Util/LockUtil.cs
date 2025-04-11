/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Marketplace.Util
{
    public static class LockUtil
    {
        public static bool Lock(string lockName, string lockIdent, int maxCount, DateTime expires)
        {
            var keyName = "lock-" + lockName + "-" + lockIdent;
            using (var redis = new RedisUtil())
            {
                var data = redis.Get(keyName);
                if (string.IsNullOrEmpty(data))
                {
                    redis.Put(keyName, (maxCount - 1).ToString(), expires);
                    return true;
                }
                else
                {
                    var curCount = Convert.ToInt32(data);
                    if (curCount > 0)
                    {
                        var exp = redis.GetTTL(keyName);
                        if (exp == null)
                            exp = expires;
                        redis.Put(keyName, (curCount - 1).ToString(), (DateTime)exp);
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
    }
}
