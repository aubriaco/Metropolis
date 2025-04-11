/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace MarketplaceData.Util
{
    public static class GeneralUtil
    {
        public static double GetVersion()
        {
            try
            {
                dynamic? o = JsonConvert.DeserializeObject(System.IO.File.ReadAllText("version.json"));
                if (o == null)
                    throw new Exception("GeneralUtil: GetVersion: Version not found.");
                return (double)o.version;
            }
            catch
            {
                return 0;
            }
        }

        public static string? FilterDescriptionHTML(string? html)
        {
            if (html == null)
                return null;

            var allowedTags = new List<string>()
            {
                "!--startfragment--",
                "!--endfragment--",
                "br",
                "p",
                "b",
                "i",
                "u",
                "s",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "ul",
                "li"                
            };

            var regex = new Regex("<\\/?([^ ]*?)([^>]*?)>", RegexOptions.Multiline);
            var matches = regex.Matches(html);

            foreach(Match match in matches)
            {
                if(match.Groups.Count > 1)
                {
                    var tag = match.Groups[2].Value.ToLower();
                    if (!allowedTags.Contains(tag))
                        html = html.Replace(match.Groups[0].Value, "");
                }
            }

            return html;
        }

        public static string FormatPhone(string s)
        {
            if (s == null)
                return "";
            if (s.Length == 10)
                return "(" + s.Substring(0, 3) + ") " + s.Substring(3, 3) + "-" + s.Substring(6);
            else
                return s;
        }

        public static string? UsernameComliant(string username, bool isAdmin = false, string? allow = null)
        {
            if (username.Length < 3)
                return "Username is too short. Must be 3 characters or more.";
            if(new Regex("[A-Za-z0-9" + (allow != null ? allow : "") + "]").Replace(username, "").Length > 0)
                return "Username contains invalid characters. Only letters A-Z or numbers 0-9 are allowed.";
            if (!isAdmin)
            {
                if (username.ToLower().Contains("support") || username.ToLower().Contains("soporte") || username.ToLower().Contains("metropolis") || username.ToLower().Contains("bidea") || username.ToLower().Contains("ubriaco") || username.ToLower().Contains("alessando"))
                    return "Invalid username. Please do not use any conflicting terms.";
            }
            return null;
        }

        public static string? PasswordCompliant(string pwd, int securityLevel)
        {
            Regex regex;
            if (securityLevel == 0)
            {
                if (pwd.Length < 8)
                    return "Password is too short. Must contain at least 8 characters, uppercase letters, lowercase letters, 1 number or more and 1 symbol or more.";
            }
            else if (securityLevel == 1)
            {
                if (pwd.Length < 10)
                    return "Password is too short. Must contain at least 10 characters, uppercase letters, lowercase letters, 1 number or more and 1 symbol or more.";
            }
            else if (securityLevel == 2)
            {
                if (pwd.Length < 12)
                    return "Password is too short. Must contain at least 12 characters, uppercase letters, lowercase letters, 1 number or more and 1 symbol or more.";
            }

            string accum = "";
            regex = new Regex("[a-z]");
            var match = regex.Match(pwd);
            if(!match.Success)
                accum += " at least 1 lowercase letter";
            regex = new Regex("[A-Z]");
            match = regex.Match(pwd);
            if(!match.Success)
                accum += " at least 1 uppercase letter";
            regex = new Regex("[0-9]");
            match = regex.Match(pwd);
            if(!match.Success)
                accum += " at least 1 number";
            regex = new Regex("[A-Za-z0-9]+");
            if(regex.Replace(pwd, "").Length == 0)
                accum += " at least 1 symbol";
            if (accum.Length != 0)
                return "Password is not compliant. Must have" + accum;

            return null;
        }

        public static string GenerateSpecimenID(string prefix = "")
        {
            string s = Guid.NewGuid().ToString();
            s = s.Substring(0, s.IndexOf('-'));
            return prefix + s.ToUpper();
        }

       

        public static string StripPhone(string s)
        {
            return s.Trim().Replace("-", "").Replace("(", "").Replace(")", "").Replace(" ", "").Replace("+", "");
        }

        public static string StripSSN(string s)
        {
            return s.Replace("-", "").Replace(" ", "");
        }

        public static string StripName(string s)
        {
            var sb = new StringBuilder();
            foreach (var c in s)
            {
                if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || c == ' ' || c == '-')
                {
                    sb.Append(c);
                }
            }
            return sb.ToString().Trim();
        }

        public static string StripParenthesis(string s)
        {
            if (s.Contains("("))
            {
                int n = s.IndexOf("(");
                if (n > 0)
                {
                    s = s.Substring(0, n).Trim();
                }
            }
            return s;
        }

        public static string GenerateIdent(string name)
        {
            name = StripName(name).ToLower().Trim().Replace(' ', '-');
            return name;
        }

        public static void GenerateVendorIdent(Database db, Vendor item)
        {
            item.Ident = GenerateIdent(item.Name);

            int n = 2;
            var originalIdent = item.Ident;
            var test = new Vendor() { Ident = item.Ident };
            while (test.Select(db, "Ident"))
            {
                test.Ident = originalIdent + "-" + n;
                item.Ident = test.Ident;
                n++;
            }
        }

        public static void GenerateProductIdent(Database db, Product item)
        {
            item.Ident = GenerateIdent(item.Name);

            int n = 2;
            var originalIdent = item.Ident;
            var test = new Product() { Ident = item.Ident };
            while (test.Select(db, "Ident"))
            {
                test.Ident = originalIdent + "-" + n;
                item.Ident = test.Ident;
                n++;
            }
        }


    }
}
