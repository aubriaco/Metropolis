/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;
using Ubriaco.Models;

namespace MarketplaceData.Models
{
    [Table("fee")]
    public class Fee : BaseModel
    {
        public string Name { get; set; }
        [VariableInfo("DECIMAL(10,4)")]
        public decimal Percent { get; set; }
        public decimal Fixed { get; set; }
    }
}
