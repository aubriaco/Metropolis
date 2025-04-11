/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models.Auction
{
    [Table("applianceconditiontype")]
    public class ApplianceConditionType : MasterModel
    {
        public string? Name { get; set; }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            ApplianceConditionType item;
            item = new ApplianceConditionType() { Name = "New" }; if (!item.Select(db, "Name")) item.Insert(db);
            item = new ApplianceConditionType() { Name = "New (Opened)" }; if (!item.Select(db, "Name")) item.Insert(db);
            item = new ApplianceConditionType() { Name = "Used (Mint Condition)" }; if (!item.Select(db, "Name")) item.Insert(db);
            item = new ApplianceConditionType() { Name = "Used (Damaged Condition)" }; if (!item.Select(db, "Name")) item.Insert(db);
        }
    }
}
