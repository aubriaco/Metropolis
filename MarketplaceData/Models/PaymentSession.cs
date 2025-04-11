/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MarketplaceData.Models
{
    public class PaymentSession
    {
        public string sid { get; set; }
        public string pk { get; set; }
        public long userID { get; set; }
    }
}
