/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Attributes;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models.Auction
{
    [Table("vehicle")]
    public class Vehicle : AuctionItem
    {
        [PublicProp]
        [ModelLocal]
        public string Type
        {
            get
            {
                return "Vehicle";
            }
        }

        [PublicProp]
        [ColEditable]
        public string VIN { get; set; }
        [ColEditable]
        [PublicProp]
        [VariableInfo("TEXT")]
        public string? VINInfo { get; set; }
        [ColEditable]
        [PublicProp]
        public int Year { get; set; } = 0;
        [ColEditable]
        [PublicProp]
        public string Make { get; set; }
        [ColEditable]
        [PublicProp]
        public string Model { get; set; }
        [ColEditable]
        [PublicProp]
        public int Milage { get; set; } = 0;
        [ColEditable]
        [PublicProp]
        public string Transmission { get; set; }
        [PublicProp]
        [VariableInfo("TEXT")]
        [ColEditable]
        public string? Highlights { get; set; }
        [PublicProp]
        [VariableInfo("TEXT")]
        [ColEditable]
        public string? Features { get; set; }
        [PublicProp]
        [ColEditable]
        public string? ModType { get; set; }
        [VariableInfo("TEXT")]
        [ColEditable]
        [PublicProp]
        public string? Mods { get; set; }
        [PublicProp]
        [ColEditable]
        public bool CosmeticFlaws { get; set; }
        [PublicProp]
        [VariableInfo("TEXT")]
        [ColEditable]
        public string? CosmeticFlawsDetail { get; set; }
        [PublicProp]
        [ColEditable]
        public bool TitleOwnership { get; set; }
        [PublicProp]
        [VariableInfo("TEXT")]
        [ColEditable]
        public string? TitleOwnershipRel { get; set; }
        [PublicProp]
        [ColEditable]
        public string TitleStatus { get; set; }
        [PublicProp]
        [ColEditable]
        public string SellerType { get; set; }
        [ColEditable]
        [PublicProp]
        public string? AdditionalFees { get; set; }
        [PublicProp]
        [ColEditable]
        public string? SalesRange { get; set; }
        [PublicProp]
        [ColEditable]
        public string? Referrer { get; set; }
        [ColEditable]
        [PublicProp]
        public bool FeeCover { get; set; }



        [ColEditable]
        [ModelLocal]
        public string _CosmeticFlaws
        {
            get
            {
                return CosmeticFlaws ? "True" : "False";
            }
            set
            {
                CosmeticFlaws = Convert.ToBoolean(value);
            }
        }

        [ColEditable]
        [ModelLocal]
        public string _TitleOwnership
        {
            get
            {
                return TitleOwnership ? "True" : "False";
            }
            set
            {
                TitleOwnership = Convert.ToBoolean(value);
            }
        }

        [ColEditable]
        [ModelLocal]
        public string _FeeCover
        {
            get
            {
                return FeeCover ? "True" : "False";
            }
            set
            {
                FeeCover = Convert.ToBoolean(value);
            }
        }

        // Soft Props
        [ColEditable]
        public string? DealershipName { get; set; }
        [ColEditable]
        public string? DealershipWebsite { get; set; }
        [ColEditable]
        [ModelLocal]
        public string? LicenseFileData { get; set; }
        [ColEditable]
        [ModelLocal]
        public string? IDFileData { get; set; }
        [ColEditable]
        [ModelLocal]
        public string? RegistrationFileData { get; set; }

        public long IDFileID { get; set; }
        public long LicenseFileID { get; set; }
        public long RegistrationFileID { get; set; }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryExecuteCommand(db, "ALTER TABLE " + GetDefaultTable() + " ALTER COLUMN started SET DEFAULT false");
            TryExecuteCommand(db, "ALTER TABLE " + GetDefaultTable() + " ALTER COLUMN started SET NOT NULL");
            TryExecuteCommand(db, "ALTER TABLE " + GetDefaultTable() + " ALTER COLUMN ended SET DEFAULT false");
            TryExecuteCommand(db, "ALTER TABLE " + GetDefaultTable() + " ALTER COLUMN ended SET NOT NULL");
            TryExecuteCommand(db, "ALTER TABLE " + GetDefaultTable() + " ALTER COLUMN paused SET DEFAULT false");
            TryExecuteCommand(db, "ALTER TABLE " + GetDefaultTable() + " ALTER COLUMN paused SET NOT NULL");
            TryExecuteCommand(db, "ALTER TABLE " + GetDefaultTable() + " ALTER COLUMN rejected SET DEFAULT false");
            TryExecuteCommand(db, "ALTER TABLE " + GetDefaultTable() + " ALTER COLUMN rejected SET NOT NULL");
            TryExecuteCommand(db, "ALTER TABLE " + GetDefaultTable() + " ALTER COLUMN currentbid SET DEFAULT 0");
            TryExecuteCommand(db, "ALTER TABLE " + GetDefaultTable() + " ALTER COLUMN currentbid SET NOT NULL");
            TryExecuteCommand(db, "ALTER TABLE " + GetDefaultTable() + " ALTER COLUMN reserveprice SET DEFAULT 0");
            TryExecuteCommand(db, "ALTER TABLE " + GetDefaultTable() + " ALTER COLUMN reserveprice SET NOT NULL");
            TryExecuteCommand(db, "ALTER TABLE " + GetDefaultTable() + " ALTER COLUMN bidcount SET DEFAULT 0");
            TryExecuteCommand(db, "ALTER TABLE " + GetDefaultTable() + " ALTER COLUMN bidcount SET NOT NULL");
        }

        public override void PullChildren(Database db)
        {
            base.PullChildren(db);
            var vs = new VehicleStorageItem() { ID = DisplayPhotoStorageItemID };
            if (vs.Select(db, "ID"))
            {
                DisplayPhoto.ID = vs.StorageItemID;
                DisplayPhoto.Select(db, "ID");
            }

            Photos.Clear();
            using (var cmd = new NpgsqlCommand(@"SELECT si.* FROM storageitem si INNER JOIN vehiclestorageitem vsi ON vsi.storageitemid=si.id WHERE vsi.vehicleid=@id", db.C))
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
        }

        private static object _GetList(Database db, bool counter = false)
        {
            var list = new List<Vehicle>();
            using (var cmd = new NpgsqlCommand(@"SELECT " + (counter ? " COUNT(v.id) AS counter " : " v.*, si.ident AS si_ident, si.ext AS si_ext, si.hasthumb AS si_hasthumb, si.thumbident AS si_thumbident ") + @" FROM vehicle v LEFT JOIN vehiclestorageitem vsi ON vsi.id=v.displayphotostorageitemid LEFT JOIN storageitem si ON si.id=vsi.storageitemid WHERE v.started=true AND v.ended=false AND v.enddate>@dt AND v.paused=false " + (counter ? "" : "ORDER BY v.enddate ASC"), db.C))
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
                        var item = new Vehicle();
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

        public static List<Vehicle> GetList(Database db)
        {
            return (List<Vehicle>)_GetList(db);
        }

        public static long GetActiveCount(Database db)
        {
            return (long)_GetList(db, true);
        }

       
    }
}
