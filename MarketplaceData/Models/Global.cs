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
    [Table("global")]
    public class Global : BaseModel
    {
        public string Name { get; set; }
        public string Value { get; set; }
    }
}
