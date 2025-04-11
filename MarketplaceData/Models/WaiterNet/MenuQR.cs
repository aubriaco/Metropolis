/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Ubriaco.Attributes;

namespace MarketplaceData.Models.WaiterNet
{
    [Table("menuqr")]
    public class MenuQR : MasterModel
    {
        public long VendorID { get; set; }
        public long TableID { get; set; }
        public string? Ident { get; set; } = (Guid.NewGuid().ToString() + Guid.NewGuid().ToString()).Replace("-", "");
        public string? Name { get; set; }
    }
}