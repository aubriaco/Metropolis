/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Newtonsoft.Json;
using Npgsql;
using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models.Auction
{
    [Table("auctionwrap")]
    public class AuctionWrap : MasterModel
    {
        public string AuctionType
        {
            get
            {
                if (VehicleID != 0)
                    return "Vehicle";
                else if (ApplianceID != 0)
                    return "Appliance";
                else
                    return "Unknown";
            }
        }
        public string? Name { get; set; }
        public long VehicleID { get; set; }
        public long ApplianceID { get; set; }
        public long CreatedByUserID { get; set; }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "Name");
            
            TryExecuteCommand(db, "DROP INDEX auctionwrapapplianceid");
            TryExecuteCommand(db, "DROP INDEX auctionwrapvehicleid");

            TryCreateIndex(db, "VehicleID,ApplianceID", true);

        }
    }
}
