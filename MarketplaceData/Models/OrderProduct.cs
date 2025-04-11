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
    [Table("_orderproduct")]
    public class OrderProduct : MasterModel
    {
        public long UserID { get; set; }
        public long VendorID { get; set; }
        public decimal Paid { get; set; }
        public long ProductID { get; set; }
        public string? ProductName { get; set; }
    }
}
