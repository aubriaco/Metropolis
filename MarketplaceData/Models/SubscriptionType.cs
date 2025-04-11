/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models
{
    [Table("subscriptiontype")]
    public class SubscriptionType : MasterModel
    {
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

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "Service", true);
            var item = new SubscriptionType() { Service = "WAITERNET100", PriceAmount = 100, CycleType = (int)SubscriptionCycleType.Monthly };
            if (!item.SelectID(db, "Service"))
                item.ID = item.Insert(db);
            else
                item.Update(db);
        }
    }
}
