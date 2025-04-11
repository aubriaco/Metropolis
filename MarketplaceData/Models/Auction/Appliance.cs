/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Attributes;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;

namespace MarketplaceData.Models.Auction
{
    [Table("appliance")]
    public class Appliance : AuctionItem
    {
        [PublicProp]
        [ModelLocal]
        public string Type
        {
            get
            {
                return "Appliance";
            }
        }

        [PublicProp]
        [ColEditable]
        public long ApplianceTypeID { get; set; }

        [PublicProp]
        [ColEditable]
        public string? ApplianceSubType { get; set; }

        [PublicProp]
        [ColEditable]
        public string? Make { get; set; }

        [PublicProp]
        [ColEditable]
        public string? Model { get; set; }

        [PublicProp]
        [ColEditable]
        public string Name { get; set; }

        [PublicProp]
        [ColEditable]
        public string? Material { get; set; }

        [PublicProp]
        [ColEditable]
        public string? Color { get; set; }

        [PublicProp]
        [ColEditable]
        public string? Size { get; set; }

        [PublicProp]
        [ColEditable]
        public long ConditionTypeID { get; set; }

        [ModelLocal]
        [PublicProp]
        public ApplianceType ApplianceType { get; set; } = new ApplianceType();

        [ModelLocal]
        [PublicProp]
        public ApplianceConditionType Condition { get; set; } = new ApplianceConditionType();

        [ColEditable]
        [PublicProp]
        [VariableInfo("TEXT")]
        public string Description { get; set; }


        public override void PullChildren(Database db)
        {
            base.PullChildren(db);
            var vs = new ApplianceStorageItem() { ID = DisplayPhotoStorageItemID };
            if (vs.Select(db, "ID"))
            {
                DisplayPhoto.ID = vs.StorageItemID;
                DisplayPhoto.Select(db, "ID");
            }

            Photos.Clear();
            using (var cmd = new NpgsqlCommand(@"SELECT si.* FROM storageitem si INNER JOIN appliancestorageitem vsi ON vsi.storageitemid=si.id WHERE vsi.applianceid=@id", db.C))
            {
                cmd.Parameters.AddWithValue("@id", ID);
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var si = new StorageItem();
                        si.Populate(r);
                        Photos.Add(si);
                    }
                }
            }

            var user = new User() { ID = CreatedByUserID };
            if (user.Select(db, "ID"))
                CreatedByUserName = user.Username;

            if (CurrentBidUserID != 0)
            {
                user = new User() { ID = CurrentBidUserID };
                if (user.Select(db, "ID"))
                    CurrentBidUserName = user.Username;
            }

            ApplianceType.ID = ApplianceTypeID;
            ApplianceType.Select(db, "ID");

            Condition.ID = ConditionTypeID;
            Condition.Select(db, "ID");

        }

        private static object _GetList(Database db, bool counter = false)
        {
            var list = new List<Appliance>();
            using (var cmd = new NpgsqlCommand(@"SELECT " + (counter ? " COUNT(v.id) AS counter " : " v.*, si.ident AS si_ident, si.ext AS si_ext, si.hasthumb AS si_hasthumb, si.thumbident AS si_thumbident ") + @" FROM appliance v LEFT JOIN appliancestorageitem vsi ON vsi.id=v.displayphotostorageitemid LEFT JOIN storageitem si ON si.id=vsi.storageitemid WHERE v.started=true AND v.ended=false AND v.enddate>@dt AND v.paused=false " + (counter ? "" : "ORDER BY v.enddate ASC"), db.C))
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
                        var item = new Appliance();
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

        public static List<Appliance> GetList(Database db)
        {
            return (List<Appliance>)_GetList(db);
        }

        public static long GetActiveCount(Database db)
        {
            return (long)_GetList(db, true);
        }
    }
}
