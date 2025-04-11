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

namespace MarketplaceData.Models.Social
{
    [Table("timelinephoto")]
    public class TimelinePhoto : BaseModel
    {
        public long TimelineID { get; set; }
        public long UserID { get; set; }
        public long StorageItemID { get; set; }
    }
}
