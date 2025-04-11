/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Attributes;
using Npgsql;
using Ubriaco.Attributes;
using Ubriaco.Data;
using Ubriaco.Models;

namespace MarketplaceData.Models
{
    [Table("userprofile")]
    public class UserProfile : BaseModel
    {
        public long UserID { get; set; }
        [ModelLocal]
        [PublicProp]
        public string? Username { get; set; }

        [PublicProp]
        public string? Bio { get; set; }

        public long DisplayPhotoID { get; set; }

        [ModelLocal]
        [PublicProp]
        public StorageItem DisplayPhoto { get; set; } = new StorageItem();

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "userid", true);
        }

        public void PullChildren(Database db)
        {
            if(DisplayPhotoID != 0)
            {
                DisplayPhoto.ID = DisplayPhotoID;
                DisplayPhoto.Select(db, "ID");
            }
        }

        public static List<UserProfile> Search(Database db, string search)
        {
            search = search.ToLower().Trim();
            var list = new List<UserProfile>();
            using (var cmd = new NpgsqlCommand(@"SELECT up.*, u.username, si.id AS si_id, si.ident AS si_ident, si.hasthumb AS si_hasthumb, si.thumbident AS si_thumbident FROM _user u
                                            LEFT JOIN userprofile up ON up.userid=u.id
                                            LEFT JOIN storageitem si ON si.id=up.displayphotoid
                                            WHERE 
                                            lower(u.firstname||' '||u.lastname) LIKE @search
                                            OR lower(u.lastname||' '||u.firstname) LIKE @search
                                            OR u.email=@searchExact
                                            OR u.username=@searchExact
                                        ORDER BY lower(u.firstname||' '||u.lastname) ASC
                                    ", db.C))
            {
                cmd.Parameters.AddWithValue("@search", search.Replace("%", "") + "%");
                cmd.Parameters.AddWithValue("@searchExact", search.Replace("%", ""));
                using(var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var item = new UserProfile();
                        item.Populate(r);
                        if (r["si_id"] != null && r["si_id"] != DBNull.Value)
                            item.DisplayPhoto.ID = Convert.ToInt64(r["si_id"]);
                        if (r["si_ident"] != null && r["si_ident"] != DBNull.Value)
                            item.DisplayPhoto.Ident = r["si_ident"].ToString();
                        if (r["si_hasthumb"] != null && r["si_hasthumb"] != DBNull.Value)
                            item.DisplayPhoto.HasThumb = Convert.ToBoolean(r["si_hasthumb"]);
                        if (r["si_thumbident"] != null && r["si_thumbident"] != DBNull.Value)
                            item.DisplayPhoto.ThumbIdent = r["si_thumbident"].ToString();
                        list.Add(item);
                    }
                }
            }
            return list;
        }
    }
}
