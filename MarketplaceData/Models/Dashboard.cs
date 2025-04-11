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
    public class Dashboard
    {
        public long TotalOrderCount { get; set; } = 0;
        public long ProcessedOrderCount { get; set; } = 0;
        public long ConfirmedOrderCount { get; set; } = 0;
    }
}
