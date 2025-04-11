/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Attributes;
using Newtonsoft.Json;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models.Social
{
    [Table("timelinepost")]
    public class TimelinePost : MasterModel
    {
        public long UserID { get; set; }

        [ColEditable]
        public long ReplyToTimelinePostID { get; set; } = 0;

        [PublicProp]
        [ModelLocal]
        public string? Username { get; set; }

        [PublicProp]
        [ColEditable]
        public string Message { get; set; }

        [PublicProp]
        [ColEditable]
        [ModelLocal]
        public List<StorageItem> Photos { get; set; } = new List<StorageItem>();

        [PublicProp]
        [ColEditable]
        public int PrivacyLevel { get; set; } = 0;

        [ModelLocal]
        public List<TimelinePost>? _Replies;

        [PublicProp]
        [ModelLocal]
        public List<TimelinePost> Replies
        {
            get
            {
                if(_Replies != null)
                    return _Replies;
                var o = JsonConvert.DeserializeObject<List<TimelinePost>>(RecentRepliesJson);
                if (o != null)
                    return o;
                return new List<TimelinePost>();
            }
            set
            {
                _Replies = value;
            }
        }

        [VariableInfo("TEXT")]
        public string RecentRepliesJson { get; set; } = "[]";

        [VariableInfo("TEXT")]
        public string PhotosJson { get; set; } = "[]";

        [ModelLocal]
        public StorageItem UserDisplayPhoto { get; set; } = new StorageItem();

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "userid");
            TryCreateIndex(db, "replytotimelinepostid");
            TryCreateIndex(db, "to_tsvector(message)", false, null, true);
            TryCreateIndex(db, "to_tsvector('english',message)", false, null, true);
            TryCreateIndex(db, "to_tsvector('spanish',message)", false, null, true);
            TryExecuteCommand(db, "UPDATE timelinepost SET replytotimelinepostid=0 WHERE replytotimelinepostid IS NULL");
            TryExecuteCommand(db, "UPDATE timelinepost SET recentrepliesjson='[]' WHERE recentrepliesjson IS NULL");
        }

        public static List<TimelinePost> GetList(Database db, long userID, long profileUserID = 0, long replyToPostID = 0, int limit = 50)
        {
            var list = new List<TimelinePost>();
            using (var cmd = new NpgsqlCommand(@"SELECT t.*, u.username, si.id AS si_id, si.ident AS si_ident, si.hasthumb AS si_hasthumb, si.thumbident AS si_thumbident
                                                FROM timelinepost t
                                                INNER JOIN _user u ON u.id=t.userid
                                                LEFT JOIN userprofile up ON up.userid=u.id
                                                LEFT JOIN storageitem si ON si.id=up.displayphotoid
                                                WHERE t.userid!=0 " + (replyToPostID != 0 ? "  AND t.replytotimelinepostid=" + replyToPostID + " " : " AND t.replytotimelinepostid=0 ") + (profileUserID != 0 ? " AND t.userid=@profileuserid " : "") + " ORDER BY t.createddate DESC LIMIT " + limit, db.C))
            {
                if(profileUserID != 0)
                    cmd.Parameters.AddWithValue("@profileuserid", profileUserID);
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var item = new TimelinePost();
                        item.Populate(r);
                        var photos = JsonConvert.DeserializeObject<List<StorageItem>>(item.PhotosJson);
                        if(photos != null)
                            item.Photos = photos;
                        if (r["si_id"] != null && r["si_id"] != DBNull.Value)
                            item.UserDisplayPhoto.ID = Convert.ToInt64(r["si_id"]);
                        if (r["si_ident"] != null && r["si_ident"] != DBNull.Value)
                            item.UserDisplayPhoto.Ident = r["si_ident"].ToString();
                        if (r["si_hasthumb"] != null && r["si_hasthumb"] != DBNull.Value)
                            item.UserDisplayPhoto.HasThumb = Convert.ToBoolean(r["si_hasthumb"]);
                        if (r["si_thumbident"] != null && r["si_thumbident"] != DBNull.Value)
                            item.UserDisplayPhoto.ThumbIdent = r["si_thumbident"].ToString();
                        list.Add(item);
                    }
                }
            }
            return list;
        }

        public static List<TimelinePost> Search(Database db, string search)
        {
            search = search.ToLower().Trim();
            var list = new List<TimelinePost>();
            using (var cmd = new NpgsqlCommand(@"SELECT t.*, u.username, si.id AS si_id, si.ident AS si_ident, si.hasthumb AS si_hasthumb, si.thumbident AS si_thumbident
                                            FROM timelinepost t
                                            INNER JOIN _user u ON u.id=t.userid
                                            LEFT JOIN userprofile up ON up.userid=u.id
                                            LEFT JOIN storageitem si ON si.id=up.displayphotoid
                                            WHERE 
                                            lower(u.firstname||' '||u.lastname) LIKE @search
                                            OR lower(u.lastname||' '||u.firstname) LIKE @search
                                            OR u.email=@searchExact
                                            OR u.username=@searchExact
                                            OR to_tsvector(t.message) @@ to_tsquery(@searchExact)
                                        ORDER BY t.createddate DESC
                                    ", db.C))
            {
                cmd.Parameters.AddWithValue("@search", search.Replace("%", "") + "%");
                cmd.Parameters.AddWithValue("@searchExact", search.Replace("%", ""));
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var item = new TimelinePost();
                        item.Populate(r);
                        if (r["si_id"] != null && r["si_id"] != DBNull.Value)
                            item.UserDisplayPhoto.ID = Convert.ToInt64(r["si_id"]);
                        if (r["si_ident"] != null && r["si_ident"] != DBNull.Value)
                            item.UserDisplayPhoto.Ident = r["si_ident"].ToString();
                        if (r["si_hasthumb"] != null && r["si_hasthumb"] != DBNull.Value)
                            item.UserDisplayPhoto.HasThumb = Convert.ToBoolean(r["si_hasthumb"]);
                        if (r["si_thumbident"] != null && r["si_thumbident"] != DBNull.Value)
                            item.UserDisplayPhoto.ThumbIdent = r["si_thumbident"].ToString();
                        list.Add(item);
                    }
                }
            }
            return list;
        }
    }
}
