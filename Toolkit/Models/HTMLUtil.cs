/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Toolkit.Models
{
    internal static class HTMLUtil
    {

        public static void ProcessMatches(ref string body, IEnumerable<Match> matches)
        {
            foreach (Match m in matches)
            {

                if (!string.IsNullOrWhiteSpace(m.Groups[1].Value))
                {
                    if (!m.Groups[1].Value.Contains('{') && !m.Groups[1].Value.Contains('>'))
                    {
                        var newValue = " {{getLang('" + m.Groups[1].Value.Trim().Replace("'", "\\'") + "')}} ";
                        body = body.Replace(">" + m.Groups[1].Value + "<", ">" + newValue + "<");
                    }
                }
            }
        }
    }
}
