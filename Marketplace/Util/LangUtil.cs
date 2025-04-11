/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 namespace Marketplace.Util
{
    public static class LangUtil
    {
        public static string Get(HttpRequest request)
        {
            string? lang = request.Cookies["CM-Lang"];
            if (string.IsNullOrEmpty(lang))
                lang = "es";
            return lang;
        }
    }
}