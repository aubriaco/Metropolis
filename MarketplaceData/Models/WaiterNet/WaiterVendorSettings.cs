/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Ubriaco.Attributes;
using Ubriaco.Data;
using Ubriaco.Models;

namespace MarketplaceData.Models.WaiterNet
{
    [Table("waitervendorsettings")]
    public class WaiterVendorSettings : BaseModel
    {
        public long VendorID { get; set; }
        public bool RequireUpfrontPayment { get; set; } = false;
        public bool RequireUserRegistration { get; set; } = false;
        public bool RejectUnconfirmedLocation { get; set; } = false;

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "VendorID", true);
        }
    }
}
