/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Marketplace
{
    public static class VersionUtil
    {
        public class _VER
        {
            public double version { get; set; }
        }

        private static double V = 0;

        public static decimal Get()
        {
            return Math.Round((decimal)V, 3);
        }

        public static void Init()
        {
            try
            {
                var data = File.ReadAllText("version.json");
                var o = JsonConvert.DeserializeObject<_VER>(data);
                if (o != null)
                    V = o.version;
            }
            catch { }
        }
    }
}
