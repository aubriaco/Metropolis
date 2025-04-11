/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models.API
{
    [Table("token")]
    public class Token : MasterModel
    {
        public string Name { get; set; } = string.Empty;
        public string? Bearer { get; set; }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "Name", true);
        }
    }
}