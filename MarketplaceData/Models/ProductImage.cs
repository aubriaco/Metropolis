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
    [Table("productimage")]
    public class ProductImage : BaseModel
    {
        public long ProductID { get; set; }
        public long StorageItemID { get; set; }
        public int OrderIndex { get; set; } = 0;
    }
}
