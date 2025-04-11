/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Attributes;
using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models
{
    [Table("vendorintegration")]
    public class VendorIntegration : MasterModel
    {
        [PublicProp]
        public string? Name { get; set; }
        public string? Ident
        {
            get
            {
                return (Name ?? "").ToUpper();
            }
        }
        [PublicProp]
        public long VendorID { get; set; }

        [PublicProp]
        public string? MerchantID { get; set; }

        public string? APIKey { get; set; }
        public string? APISecret { get; set; }
        public string? APIToken { get; set; }
        
        [ModelLocal]
        public string? Code { get; set; }

        [ModelLocal]
        public bool IsRerun { get; set; } = false;

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "VendorID");
        }
    }
}
