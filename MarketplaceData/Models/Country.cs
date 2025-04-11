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
    [Table("country")]
    public class Country : BaseModel
    {
        public string Name { get; set; }
        [VariableInfo("DECIMAL(10,4)")]
        public decimal TaxPercent { get; set; } = 0M;
        public decimal TaxFixed { get; set; } = 0;
    }
}
