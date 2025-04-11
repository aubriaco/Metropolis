/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Ubriaco.Attributes;

namespace MarketplaceData.Models.API
{
    [Table("inboundsession")]
    public class InboundSession : MasterModel
    {
        public long UserID { get; set; }
        public long VendorID { get; set; }
        public string SessionID { get; set; } = (Guid.NewGuid().ToString() + Guid.NewGuid().ToString()).Replace("-","");
        public DateTime ExpiresDate { get; set; } = DateTime.UtcNow.AddDays(30);

        [ModelLocal]
        public string? Url
        {
            get
            {
                return AppURL + "/session/" +  SessionID;
            }
        }

        // Private

        private string AppURL { get; set; } = string.Empty;

        public InboundSession() {}

        public InboundSession(string appUrl)
        {
            AppURL = appUrl;
        }
    }
}