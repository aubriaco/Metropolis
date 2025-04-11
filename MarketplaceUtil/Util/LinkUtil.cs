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
    public static class LinkUtil
    {
        public static string Get(string loc)
        {
            if (Config.I == null)
                throw new Exception("LinkUtil: Get(" + loc + "): Not configured.");
            if (!loc.StartsWith('/'))
                loc = "/" + loc;
            return Config.I.BaseUrl + loc;
        }
    }
}
