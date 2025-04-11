/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models
{
    [Table("paymentmethod")]
    public class PaymentMethod : MasterModel
    {
        public long UserID { get; set; }
        public string? ExternalID { get; set; }
        [PublicProp]
        public string? Brand { get; set; }
        [PublicProp]
        public string? LastFour { get; set; }
        [ModelLocal]
        public string CardNumber { get; set; }
        [PublicProp]
        public int ExpMonth { get; set; }
        [PublicProp]
        public int ExpYear { get; set; }
        [ModelLocal]
        public int CVC { get; set; }
        [PublicProp]
        public bool IsDefault { get; set; } = false;

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "UserID");
            TryExecuteCommand(db, "UPDATE " + GetDefaultTable() + " SET IsDefault=false WHERE IsDefault IS NULL");
        }
    }
}
