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
    [Table("ModelSync")]
    public class ModelSync : BaseModel
    {
        public string? Name { get; set; }
        [VariableInfo("TEXT")]
        public string? Sig { get; set; }
    }
}
