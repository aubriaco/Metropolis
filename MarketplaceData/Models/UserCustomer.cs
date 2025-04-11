/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;
using Ubriaco.Data;
using Ubriaco.Models;

namespace MarketplaceData.Models
{
    [Table("usercustomer")]
    public class UserCustomer : BaseModel
    {
        [ModelLocal]
        private string? _ExternalSource;

        public string? ExternalSource
        {
            get
            {
                return _ExternalSource;
            }
            set
            {
                if (value != null)
                    _ExternalSource = value.ToUpper();
                else
                    _ExternalSource = null;
            }            
        }
        public long UserID { get; set; }
        public string CustomerID { get; set; }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryExecuteCommand(db, "DROP INDEX usercustomeruserid");
            TryCreateIndex(db, "UserID,ExternalSource", true);
        }
    }
}
