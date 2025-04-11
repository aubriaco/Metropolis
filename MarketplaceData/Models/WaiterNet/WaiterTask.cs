/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 
namespace MarketplaceData.Models.WaiterNet
{
    public enum WaiterTaskType
    {
        Integration,
        Order
    }

    public class WaiterTask
    {
        public string TaskID { get; set; } = Guid.NewGuid().ToString();
        public WaiterTaskType TaskType { get; set; }
        public long UserID { get; set; } = 0;
        public MenuOrder? Order { get; set; }
        public VendorIntegration? Integration { get; set; }
    }
}
