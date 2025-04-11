/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Ubriaco.Attributes;

namespace MarketplaceData.Models.WaiterNet
{
    [Table("menuorder")]
    public class MenuOrder : MasterModel
    {
        public long VendorID { get; set; }
        public long SeqID { get; set; }
        public long UserID { get; set; }
        public string? ExternalID { get; set; }
        [ColEditable]
        [ModelLocal]
        public List<MenuOrderItem> Items { get; set; } = new List<MenuOrderItem>();
        [ColEditable]
        public long TableID { get; set; } = 0;
        [ModelLocal]
        public FloorTable? Table { get; set; }
        [VariableInfo("TEXT")]
        public string? ItemsData { get; set; }
        public bool IsDone { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsCanceled { get; set; }
        public bool IsPaid { get; set; }
        public string? IPAddress { get; set; }
        public string? DisplayName { get; set; }
        public string? Email { get; set; }
        public double Lat { get; set; }
        public double Lng { get; set; }
        public int Quantity
        {
            get
            {
                int ret = 0;
                foreach (var item in Items)
                {
                    ret += item.Quantity;
                }
                return ret;
            }
        }
        public decimal SubTotal
        {
            get
            {
                decimal ret = 0;
                foreach (var item in Items)
                {
                    ret += item.SubTotal;
                }
                return ret;
            }
        }

        public decimal TaxPercent { get; set; } = 11.5M;
        public decimal TaxAmount
        {
            get
            {
                return SubTotal * (TaxPercent/100);
            }
        }
        public decimal Total
        {
            get
            {
                return SubTotal + TaxAmount;
            }
        }

        [ModelLocal]
        public string TimeDiff
        {
            get
            {
                var ts = DateTime.UtcNow.Subtract(CreatedDate);
                var r = "";
                if((int)ts.TotalHours > 0)
                    r += (int)ts.TotalHours + ":";
                r += ts.Minutes.ToString().PadLeft(2, '0') + ":";
                r += ts.Seconds.ToString().PadLeft(2, '0');
                return r;
            }
        }

        [ModelLocal]
        public PaymentMethod? Payment { get; set; }
    }
}