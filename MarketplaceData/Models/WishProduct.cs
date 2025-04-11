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
    [Table("wishproduct")]
    public class WishProduct : BaseModel
    {
        public long UserID { get; set; }
        public long ProductID { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
