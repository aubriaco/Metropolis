/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System.Text.RegularExpressions;
using MarketplaceData;
using MarketplaceData.Models;

namespace Marketplace
{
    public static class Loader
    {
        public static string ReplaceMetas(string content, string? description, string? title = null, string? imageUrl = null)
        {
            if (Config.I == null)
                return content;
            if (string.IsNullOrEmpty(description) && string.IsNullOrEmpty(title) && string.IsNullOrEmpty(imageUrl))
                return content;
            var regex = new Regex("<meta(.*?)name=\"(.*?)\"(.*?)content=\"(.*?)\"(.*?)/>");
            var matches = regex.Matches(content);
            foreach (Match match in matches)
            {
                if (!string.IsNullOrEmpty(description) && match.Groups[2].Value == "description")
                    content = content.Replace(match.Groups[0].Value, "<meta" + match.Groups[1].Value + "name=\"" + match.Groups[2].Value + "\"" + match.Groups[3].Value + "content=\"" + description + "\"" + match.Groups[5].Value + " />");
            }
            regex = new Regex("<meta(.*?)property=\"(.*?)\"(.*?)content=\"(.*?)\"(.*?)/>");
            matches = regex.Matches(content);
            foreach (Match match in matches)
            {
                if (!string.IsNullOrEmpty(description) && match.Groups[2].Value == "og:description")
                    content = content.Replace(match.Groups[0].Value, "<meta" + match.Groups[1].Value + "name=\"" + match.Groups[2].Value + "\"" + match.Groups[3].Value + "content=\"" + description + "\"" + match.Groups[5].Value + " />");
                else if (!string.IsNullOrEmpty(title) && match.Groups[2].Value == "og:title")
                    content = content.Replace(match.Groups[0].Value, "<meta" + match.Groups[1].Value + "name=\"" + match.Groups[2].Value + "\"" + match.Groups[3].Value + "content=\"" + title + "\"" + match.Groups[5].Value + " />");
                else if (!string.IsNullOrEmpty(imageUrl) && match.Groups[2].Value == "og:image")
                    content = content.Replace(match.Groups[0].Value, "<meta" + match.Groups[1].Value + "name=\"" + match.Groups[2].Value + "\"" + match.Groups[3].Value + "content=\"" + Config.I.AppUrl + imageUrl + "\"" + match.Groups[5].Value + " />");
            }
            return content;
        }

        public static async Task Render(HttpContext context)
        {
            if (context.Request.Path.ToString().StartsWith("/.well-known/"))
            {
                if (File.Exists("wwwroot/" + context.Request.Path.ToString()))
                {
                    var content = File.ReadAllText("wwwroot/" + context.Request.Path.ToString());
                    await context.Response.WriteAsync(content);
                    return;
                }
            }
            else if (context.Request.Path.ToString() == "/robots.txt")
            {
                var content = "# https://www.robotstxt.org/robotstxt.html\nUser-agent: *\nDisallow: /my/\nSitemap: " + Config.I.AppUrl + "/sitemap.xml\n";
                await context.Response.WriteAsync(content);
                return;
            }
            else if (context.Request.Path.ToString().StartsWith("/sitemap"))
            {

                var content = $@"<?xml version=""1.0"" encoding=""UTF-8""?>

<urlset xmlns=""http://www.sitemaps.org/schemas/sitemap/0.9"" xmlns:image=""http://www.google.com/schemas/sitemap-image/1.1"">

    <url>
        <loc>{Config.I.AppUrl}</loc>
    </url>
    <url>
        <loc>{Config.I.AppUrl}/about</loc>
    </url>
    <url>
        <loc>{Config.I.AppUrl}/contact</loc>
    </url>
    <url>
        <loc>{Config.I.AppUrl}/blog</loc>
    </url>
";
                using(var db = new Database())
                {
                    var list = (List<ProductView>)db.GetProductSearch(new SearchQuery(){}, false);
                    foreach(var product in list)
                    {
                        content += $@"<url>
    <loc>{Config.I.AppUrl}/p/{product.Ident}</loc>";
                        if(product.Images != null)
                        {
                            foreach(var image in product.Images)
                            {
                                content += $@"<image:image>
      <image:loc>{Config.I.BaseUrl}/api/storage/image?ident={image.Ident}</image:loc>
    </image:image>";
                            }
                        }
                        content += "</url>";
                    }
                }

                content += "</urlset>";
                await context.Response.WriteAsync(content);
                return;
            }
            else
            {
                var indexContent = File.ReadAllText("wwwroot/index.html");
                if (context.Request.Path.ToString().StartsWith("/blog/"))
                {
                    var ident = context.Request.Path.ToString().Substring(6);
                    using (var db = new Database())
                    {
                        var blogPost = new BlogPost() { Ident = ident };
                        if (blogPost.Select(db, "Ident"))
                        {
                            indexContent = ReplaceMetas(indexContent, blogPost.ShortDescription, blogPost.Title + " - Metropolis", blogPost.DisplayImageUrl);
                        }
                    }
                }
                context.Response.Headers.ContentType = "text/html";
                context.Response.Headers.CacheControl = "no-cache";
                await context.Response.WriteAsync(indexContent);
                return;
            }
        }
    }
}