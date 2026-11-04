/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models
{
    [Table("payment")]
    public class Payment : MasterModel
    {
        [ColEditable]
        public long UserID { get; set; }
        [ColEditable]
        public long PaymentMethodID { get; set; }
        [ColEditable]
        public decimal BidAmount { get; set; }
        [ColEditable]
        public decimal ChargeAmount { get; set; }
        [ColEditable]
        public long ItemID { get; set; }

        [ColEditable]
        public string? ItemType { get; set; }

        public bool Confirmed { get; set; } = false;
        public bool Rejected { get; set; } = false;

        public string? LastError { get; set; }

        public bool Canceled { get; set; } = false;
        public DateTime CanceledDate { get; set; }
        public bool Refunded { get; set; } = false;
        public DateTime RefundedDate { get; set; }
        public bool Captured { get; set; } = false;
        public DateTime CapturedDate { get; set; }


        public string? ChargeID { get; set; }
        public string? ReceiptURL { get; set; }
        public string? TransactionID { get; set; }
        public string? CheckoutFingerprint { get; set; }

        [ModelLocal]
        public string? Username { get; set; }
        [ModelLocal]
        public string? Email { get; set; }

        public static List<Payment> GetListByItemID(Database db, long itemID, long limit = 1, long notUserID = 0)
        {
            var list = new List<Payment>();
            using(var cmd = new NpgsqlCommand(@"SELECT p.*, u.username, u.email FROM payment p INNER JOIN _user u ON u.id=p.userid WHERE p.itemid=@itemid AND p.userid!=@userid ORDER BY p.id DESC LIMIT " + limit,db.C))
            {
                cmd.Parameters.AddWithValue("@itemid", itemID);
                cmd.Parameters.AddWithValue("@userid", notUserID);
                using(var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var item = new Payment();
                        item.Populate(r);
                        list.Add(item);
                    }
                }
            }
            return list;
        }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "UserID");
            TryCreateIndex(db, "PaymentMethodID");
            TryCreateIndex(db, "ItemID");
        }
    }
}
