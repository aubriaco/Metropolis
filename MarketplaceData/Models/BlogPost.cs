/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System.Text.RegularExpressions;
using MarketplaceData.Attributes;
using MarketplaceData.Util;
using Npgsql;
using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models
{
    [Table("blogpost")]
    public class BlogPost : MasterModel
    {
        public string? Ident { get; set; }
        public DateTime PublishedDate { get; set; } = DateTime.UtcNow;
        public long CreatedByUserID { get; set; }
        [ModelLocal]
        public string? CreatedByUserName { get; set; }
        [ColEditable]
        [RequiredProp]
        public string? Title { get; set; }
        [ColEditable]
        public string? ShortDescription { get; set; }
        [VariableInfo("TEXT")]
        [ColEditable]
        [RequiredProp]
        public string? Body { get; set; }
        public long CommentCount { get; set; } = 0;

        [ModelLocal]
        public List<StorageItem> Images { get; set; } = new List<StorageItem>();

        public long DisplayImageStorageItemID { get; set; } = 0;
        public string DisplayImageUrl { get; set; } = "/img/noimage.png";

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "Ident", true);
            TryCreateIndex(db, "CreatedByUserID");
            TryCreateIndex(db, "Title");
        }

        public void PullChildren(Database db)
        {
            Images = BlogPostImage.GetStorageItems(db, ID);
            var cbu = new User() { ID = CreatedByUserID };
            if(cbu.Select(db, "ID"))
            {
                CreatedByUserName = cbu.FirstName;
            }
        }

        public override long Save(Database db)
        {
            if(string.IsNullOrEmpty(Title))
                throw new Exception("Title is empty.");

            Ident = GeneralUtil.GenerateIdent(Title);

            var test = new BlogPost() { Ident = Ident };
            while(test.Select(db, "Ident"))
            {
                Ident += "-";
                test.Ident = Ident;
            }

            if(!string.IsNullOrEmpty(Body))
            {
                if(Body.Contains("<br />"))
                    ShortDescription = Body.Substring(0, Body.IndexOf("<br />"));
                else if(Body.Contains("</p>"))
                    ShortDescription = Body.Substring(0, Body.IndexOf("</p>"));
                else if(Body.Contains("\n"))
                    ShortDescription = Body.Substring(0, Body.IndexOf("\n"));
                    
                else
                    ShortDescription = Body;

                var regex = new Regex("<(.*?)>",  RegexOptions.Multiline);
                ShortDescription = regex.Replace(ShortDescription, "").Replace("&nbsp;", "");

                if(ShortDescription.Length > 200)
                    ShortDescription = ShortDescription.Substring(0, 200) + "...";
            }

            var id = base.Save(db);
            if(id == 0)
                return 0;

            if(Images.Count > 0)
            {
                DisplayImageStorageItemID = Images[0].ID;
                DisplayImageUrl = Images[0].Url;
                Update(db, "DisplayImageStorageItemID,DisplayImageUrl");
            }


            db.Clean("blogpostimage", "blogpostid", ID);
            int idx = 0;
            foreach(var i in Images)
            {
                var bpi = new BlogPostImage() { BlogPostID = ID, StorageItemID = i.ID, OrderIndex = idx };
                bpi.Insert(db);
                idx++;
            }

            return id;
        }

        public static T GetList<T>(Database db, int page = 1)
        {
            using(var cmd = new NpgsqlCommand("SELECT " + (typeof(T) == typeof(long) ? " COUNT(b.id) AS counter" : "b.*, u.firstname AS createdbyusername ") + " FROM blogpost b LEFT JOIN _user u ON u.id=b.createdbyuserid " + (typeof(T) == typeof(long) ? "" : " ORDER BY publisheddate DESC LIMIT 5 OFFSET " + ((page-1) * 5)), db.C))
            {
                using(var r = cmd.ExecuteReader())
                {
                    if(typeof(T) == typeof(long))
                    {
                        long counter = 0;
                        if(r.Read())
                            counter = Convert.ToInt64(r["counter"]);
                        return (T)(object)counter;
                    }
                    else if (typeof(T) == typeof(List<BlogPost>))
                    {
                        var list = new List<BlogPost>();
                        while (r.Read())
                        {
                            var item = new BlogPost();
                            item.Populate(r);
                            list.Add(item);
                        }
                        return (T)(object)list;
                    }
                    else
                        throw new Exception("No valid template type.");
                }
            }
        }
    }
}