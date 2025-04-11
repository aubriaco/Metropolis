/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;

namespace MarketplaceData.Models.Referral
{
    [Table("refaccountinfo")]
    public class RefAccountInfo : MasterModel
    {
        public long UserID { get; set; }
        public DateTime InvoiceDate { get; set; }
        public string? AccountNumber { get; set; }
        public bool HasNoService { get; set; } = false;
        public decimal KWHMonth { get; set; }
        public decimal CostMonth { get; set; }

        public long UtilityBillFileID { get; set; }

        [ModelLocal]
        public StorageItem? UtilityBillFile { get; set; }
    }
}
