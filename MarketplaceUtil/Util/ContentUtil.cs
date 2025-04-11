/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Marketplace.Util
{
    public class ContentUtil
    {
        private static Dictionary<string, string> FileHashes = new Dictionary<string, string>();

        public static void SquishJSFiles(string srcPath, string dstPath)
        {
            if(!Directory.Exists(dstPath))
                Directory.CreateDirectory(dstPath);
            var all = "";
            var files = Directory.GetFiles(srcPath, "*.js", SearchOption.AllDirectories);
            Array.Sort(files);
            int sameHash = 0;
            using (SHA256 sha256 = SHA256.Create())
            {
                foreach (var file in files)
                {
                    using(var hf = File.Open(file, FileMode.Open))
                    {
                        var data = BitConverter.ToString(sha256.ComputeHash(hf));
                        if(FileHashes.ContainsKey(file))
                        {
                            if (FileHashes[file] == data)
                                sameHash++;
                            else
                                FileHashes[file] = data;
                        }
                        else
                            FileHashes.Add(file, data);

                    }

                    var body = System.IO.File.ReadAllText(file);
                    all += body;
                }
            }

            Console.WriteLine("Same: " + sameHash + " Length: " + files.Length);

            if (sameHash == files.Length)
            {
                Console.WriteLine("SquishJSFiles: No update required.");
                return;
            }

            var matches = Regex.Matches(all, "\\{ templateUrl: '(.*?)' \\}");

            foreach (Match m in matches)
            {
                all = all.Replace(m.Groups[0].Value, "{ templateUrl: '" + m.Groups[1].Value + "?v=" + GeneralUtil.GetVersion() + "' }");
            }

            using (var w = File.Open(dstPath + Path.DirectorySeparatorChar + "all.js", FileMode.Create))
            {
                using (var sw = new StreamWriter(w))
                {
                    sw.Write(all);
                    sw.Flush();
                    Console.WriteLine("Wrote: " + dstPath + Path.DirectorySeparatorChar + "all.js");
                }
            }
        }
        /*
        public static void SquishHTMLFiles(string srcPath, string dstPath, bool deep = true)
        {
            if (!Directory.Exists(dstPath))
                Directory.CreateDirectory(dstPath);
            var files = Directory.GetFiles(srcPath, "*.html", (deep ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly));

            int sameHash = 0;

            using (SHA256 sha256 = SHA256.Create())
            {
                foreach (var f in files)
                {
                    using (var hf = File.Open(f, FileMode.Open))
                    {
                        var data = BitConverter.ToString(sha256.ComputeHash(hf));
                        if (FileHashes.ContainsKey(f))
                        {
                            if (FileHashes[f] == data)
                                sameHash++;
                            else
                                FileHashes[f] = data;
                        }
                        else
                            FileHashes.Add(f, data);
                    }
                }
            }

            Console.WriteLine("Same: " + sameHash + " Length: " + files.Length);
            if(sameHash == files.Length)
            {
                Console.WriteLine("SquishHTMLFiles: No update required.");
                return;
            }

            foreach (var f in files)
            {
                var n = f.IndexOf(srcPath);
                if (n == -1)
                    continue;

                var fp = f.Substring(n + srcPath.Length);
                if (fp.StartsWith(Path.DirectorySeparatorChar))
                    fp = fp.Substring(1);

                Console.WriteLine("FP " + fp);

                using (var file = File.OpenText(f))
                {
                    var body = file.ReadToEnd();
                    body = body.Replace("\n", " ").Replace("\r", "");
                    var regex = new Regex("<!--(.*?)-->", RegexOptions.Multiline);
                    var matches = regex.Matches(body);
                    foreach (Match match in matches)
                    {
                        body = body.Replace(match.Groups[0].Value, " ");
                    }

                    body = body.Replace("[[Version]]", VersionUtil.Get().ToString());

                    var d = Path.GetDirectoryName(fp);
                    if (!string.IsNullOrWhiteSpace(d) && !Directory.Exists(dstPath + Path.DirectorySeparatorChar + d))
                    {
                        Directory.CreateDirectory(dstPath + Path.DirectorySeparatorChar + d);
                        Console.WriteLine("Create dir: " + d);
                    }

                    using (var w = File.Open(dstPath + Path.DirectorySeparatorChar + fp, FileMode.Create))
                    {
                        using (var sw = new StreamWriter(w))
                        {
                            sw.Write(body);
                            sw.Flush();
                            Console.WriteLine("Wrote: " + dstPath + Path.DirectorySeparatorChar + fp);
                        }
                    }
                }
            }
        }
        */
    }
}
