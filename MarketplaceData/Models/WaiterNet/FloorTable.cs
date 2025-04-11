/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Ubriaco.Attributes;

namespace MarketplaceData.Models.WaiterNet
{
    [Table("floortable")]
    public class FloorTable : MasterModel
    {
        public long CreatedByUserID { get; set; }
        public long VendorID { get; set; }
        [ColEditable]
        public string? Name { get; set; }
    }
}