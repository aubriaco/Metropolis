/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Models.Auction;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;

namespace MarketplaceData.Models.Social
{
    [Table("racetrack")]
    public class RaceTrack : MasterModel
    {
        [ColEditable]
        public string? Name { get; set; }
        [ColEditable]
        public long DisplayPhotoID { get; set; }

        [ColEditable]
        [ModelLocal]
        public StorageItem DisplayPhoto { get; set; } = new StorageItem();

        public void PullChildren(Database db)
        {
            if(DisplayPhotoID != 0)
            {
                DisplayPhoto.ID = DisplayPhotoID;
                DisplayPhoto.Select(db, "ID");
            }
        }

        private static object _GetList(Database db, bool counter = false)
        {
            var list = new List<RaceTrack>();
            using (var cmd = new NpgsqlCommand(@"SELECT " + (counter ? " COUNT(v.id) AS counter " : " v.*, si.ident AS si_ident, si.ext AS si_ext, si.hasthumb AS si_hasthumb, si.thumbident AS si_thumbident ") + @" FROM racetrack v LEFT JOIN storageitem si ON si.id=v.displayphotoid " + (counter ? "" : "ORDER BY v.name ASC"), db.C))
            {
                cmd.Parameters.AddWithValue("@dt", DateTime.UtcNow);
                using (var r = cmd.ExecuteReader())
                {
                    if (counter)
                    {
                        if (r.Read())
                            return Convert.ToInt64(r["counter"]);
                        return 0;
                    }
                    while (r.Read())
                    {
                        var item = new RaceTrack();
                        item.Populate(r);
                        if (r["si_ident"] != null && r["si_ident"] != DBNull.Value)
                            item.DisplayPhoto.Ident = r["si_ident"].ToString();
                        if (r["si_ext"] != null && r["si_ext"] != DBNull.Value)
                            item.DisplayPhoto.Ext = r["si_ext"].ToString();
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

        public static List<RaceTrack> GetList(Database db)
        {
            return (List<RaceTrack>)_GetList(db);
        }
    }
}
