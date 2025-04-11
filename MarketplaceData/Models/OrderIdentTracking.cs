/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Ubriaco.Models;
using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models
{

    [Table("orderidenttracking")]
    public class OrderIdentTracking : BaseModel
    {
        public string? DT { get; set; }
        public long SeqID { get; set; } = 0;

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "DT", true);
        }
    }
}