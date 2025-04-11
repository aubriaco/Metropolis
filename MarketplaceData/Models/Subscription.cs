/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Ubriaco.Attributes;

namespace MarketplaceData.Models
{
    public enum SubscriptionCycleType
    {
        Daily,
        Weekly,
        Monthly,
        Yearly
    }

    [Table("subscription")]
    public class Subscription : MasterModel
    {
        public long VendorID { get; set; }
        public long UserID { get; set; }
        public long SubscriptionTypeID { get; set; }
        public long PaymentMethodID { get; set; }
        [ModelLocal]
        private string _Service = "";
        public string Service
        {
            get
            {
                return _Service.ToUpper();
            }
            set
            {
                _Service = value.ToUpper();
            }
        }
        public decimal PriceAmount { get; set; }
        public int CycleType { get; set; } = (int)SubscriptionCycleType.Monthly;
        public long LastPaymentID { get; set; }
        public DateTime LastPaymentDate { get; set; }
        public DateTime NextPaymentDate { get; set; }
        public bool IsActive { get; set; } = false;
    }
}
