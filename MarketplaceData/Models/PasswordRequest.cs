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
    [Table("PasswordRequests")]
    public class PasswordRequest : BaseModel
    {
        public long UserID { get; set; }
        public string Code { get; set; }
        public string IPAddress { get; set; }
        public DateTime ExpiresDate { get; set; }
    }
}
