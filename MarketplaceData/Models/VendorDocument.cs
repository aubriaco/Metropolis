/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;

namespace MarketplaceData.Models
{
    [Table("vendordocument")]
    public class VendorDocument : MasterModel
    {
        public const int MaxDocumentCount = 10;

        public string Name { get; set; }
        public long VendorID { get; set; } = 0;
        public long StorageItemID { get; set; }
        public bool Accepted { get; set; } = false;
    }
}
