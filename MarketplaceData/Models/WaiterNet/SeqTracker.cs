/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Npgsql;
using Ubriaco.Attributes;
using Ubriaco.Data;
using Ubriaco.Models;

namespace MarketplaceData.Models.WaiterNet
{
    [Table("seqtracker")]
    public class SeqTracker : BaseModel
    {
        public long VendorID { get; set; }
        public string DID { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-dd");
        public long SeqID { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public override void CreateIndexes(BaseConnection db)
        {
             base.CreateIndexes(db);
             TryCreateIndex(db, "DID,VendorID", true);
        }

        public static long GetSeq(Database db, long vendorID, string? did = null)
        {
            if(string.IsNullOrEmpty(did))
                did = DateTime.UtcNow.ToString("yyyy-MM-dd");
            using(var cmd = new NpgsqlCommand("UPDATE seqtracker SET seqid=seqid+1 WHERE vendorid=@vendorid AND did=@did; SELECT * FROM seqtracker WHERE vendorid=@vendorid AND did=@did LIMIT 1", db.C))
            {
                cmd.Parameters.AddWithValue("@vendorid", vendorID);
                cmd.Parameters.AddWithValue("@did", did);
                using(var r = cmd.ExecuteReader())
                {
                    if(r.Read())
                    {
                        return Convert.ToInt64(r["seqid"].ToString());
                    }
                }
            }
            var item = new SeqTracker();
            item.VendorID = vendorID;
            item.DID = did;
            item.SeqID = 1;
            item.Insert(db);
            return item.SeqID;
        }
    }
}