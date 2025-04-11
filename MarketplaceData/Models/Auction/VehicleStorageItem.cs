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
using Ubriaco.Models;

namespace MarketplaceData.Models.Auction
{
    [Table("vehiclestorageitem")]
    public class VehicleStorageItem : BaseModel
    {
        public long VehicleID { get; set; }
        public long StorageItemID { get; set; }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            //TryCreateIndex(db, "StorageItemID", true);

        }
    }
}
