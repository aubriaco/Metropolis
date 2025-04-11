/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;

namespace MarketplaceData.Models
{
    [Table("vendorpayoutlink")]
    public class VendorPayoutLink : MasterModel
    {
        public long VendorID { get; set; }
        public string? IntegrationType { get; set; }
        public string? AccountID { get; set; }
        [VariableInfo("TEXT")]
        public string? InfoJson { get; set; }
        public bool Active { get; set; } = false;
    }
}
