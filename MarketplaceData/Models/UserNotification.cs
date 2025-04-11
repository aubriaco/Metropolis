/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Ubriaco.Attributes;

namespace MarketplaceData.Models
{
    [Table("usernotification")]
    public class UserNotification : MasterModel
    {
        public long UserID { get; set; }
        public string? TaskID { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime ReadDate { get; set; }
        public string? Message { get; set; }
    }
}
