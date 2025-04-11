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
    [Table("carphoto")]
    public class CarPhoto : BaseModel
    {
        public long StorageItemID { get; set; }
        public long CarID { get; set; }
        public long UserID { get; set; }

        public static void Clean(Database db, long carID)
        {
            db.Clean("carphoto", "carid", carID);
        }
    }
}
