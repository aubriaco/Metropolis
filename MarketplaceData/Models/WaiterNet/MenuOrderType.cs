/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MarketplaceData.Models.WaiterNet
{
    public class MenuOrderType
    {
        public string? Name { get; set; }
        public string? ExternalID { get; set; }
        public bool IsDefault { get; set; }
    }
}
