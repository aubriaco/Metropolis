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
using Ubriaco.Data;

namespace MarketplaceData.Models.Auction
{
    [Table("auctionqa")]
    public class AuctionQA : MasterModel
    {
        [ColEditable]
        [PublicProp]
        public long AuctionWrapID { get; set; }
        public long VehicleID { get; set; }
        public long ApplianceID { get; set; }
        public long UserID { get; set; }
        [ColEditable]
        [PublicProp]
        [VariableInfo("VARCHAR(400)")]
        public string Question { get; set; }
        [PublicProp]
        [VariableInfo("TEXT")]
        public string? Answer { get; set; }

        [ModelLocal]
        public bool IsAnswered
        {
            get
            {
                return !string.IsNullOrEmpty(Answer);
            }
        }

        [PublicProp]
        public DateTime AnswerDate { get; set; }
        public bool IsPublic { get; set; } = false;

        public bool Removed { get; set; }
        public DateTime RemovedDate { get; set; }

        [ModelLocal]
        public string? Name { get; set; }

        [ModelLocal]
        public string? Username { get; set; }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "AuctionWrapID");
            TryCreateIndex(db, "UserID");
            TryCreateIndex(db, "VehicleID,ApplianceID");
            TryExecuteCommand(db, "UPDATE auctionqa SET removed=false WHERE removed IS NULL");
        }

        public static List<AuctionQA> GetList(Database db, long auctionWrapID = 0, bool onlyPublic = false, long userID = 0)
        {
            var list = new List<AuctionQA>();
            using (var cmd = new NpgsqlCommand(@"SELECT q.*, w.name, u.username FROM auctionqa q INNER JOIN auctionwrap w ON w.id=q.auctionwrapid INNER JOIN _user u ON u.id=q.userid WHERE q.removed=false " + (auctionWrapID == 0 ? "" : " AND q.auctionwrapid=@wrapid ") + (userID != 0 ? " AND w.createdbyuserid=@userid " : " AND q.answer IS NOT NULL  ") + (onlyPublic ? " AND q.ispublic=true " : "") + @" ORDER BY q.answerdate DESC", db.C))
            {
                if(auctionWrapID != 0)
                    cmd.Parameters.AddWithValue("@wrapid", auctionWrapID);
                if(userID != 0)
                    cmd.Parameters.AddWithValue("@userid", userID);
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var item = new AuctionQA();
                        item.Populate(r);
                        if(onlyPublic)
                            list.Add(item.GetPublic<AuctionQA>());
                        else
                            list.Add(item);
                    }
                }
            }
            return list;
        }
    }
}
