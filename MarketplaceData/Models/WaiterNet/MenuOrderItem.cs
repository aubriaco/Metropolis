/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Ubriaco.Attributes;
using Ubriaco.Models;

namespace MarketplaceData.Models.WaiterNet
{
    public class MenuOrderItem : BaseModel
    {
        public long VendorID { get; set; }
        public long ItemID { get; set; }
        public int Quantity { get; set; }
        [ModelLocal]
        public MenuItem? Item { get; set; }
        public decimal Price { get; set; }
        public decimal SubTotal
        {
            get
            {
                return Price * Quantity;
            }
        }
        [ModelLocal]
        public bool Removed { get; set; } = false;
    }
}