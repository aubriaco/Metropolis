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
    [Table("appliancetype")]
    public class ApplianceType : MasterModel
    {
        public string? Name { get; set; }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            ApplianceType item;
            item = new ApplianceType() { Name = "Furniture" }; if (!item.Select(db, "Name")) item.Insert(db);
            item = new ApplianceType() { Name = "Electronics" }; if (!item.Select(db, "Name")) item.Insert(db);
            item = new ApplianceType() { Name = "Computers" }; if (!item.Select(db, "Name")) item.Insert(db);
            item = new ApplianceType() { Name = "Cellular Phones" }; if (!item.Select(db, "Name")) item.Insert(db);
            item = new ApplianceType() { Name = "Collectibles" }; if (!item.Select(db, "Name")) item.Insert(db);
            item = new ApplianceType() { Name = "Tools" }; if (!item.Select(db, "Name")) item.Insert(db);
            item = new ApplianceType() { Name = "Fashion" }; if (!item.Select(db, "Name")) item.Insert(db);
        }
    }
}
