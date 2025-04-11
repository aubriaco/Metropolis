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
    [Table("vendor")]
    public class Vendor : VendorView
    {

        public const int RequiredDocumentCount = 2;

        public string? TaxID { get; set; }
        public string? TaxType { get; set; }


        public long CreatedByUserID { get; set; } = 0;


        [ModelLocal]
        public int Step { get; set; } = 0;

        public bool IsLocalReviewed { get; set; } = false;

        public bool IsAgreeTerms { get; set; } = false;

        public bool IsWaiterNet { get; set; } = false;

        [ModelLocal]
        public object? Settings { get; set; }

        public string? ExternalMerchantID { get; set; }

        [ModelLocal]
        public User? UserInfo { get; set; }

        [ModelLocal]
        public List<Product>? Products { get; set; }

        public bool CanEdit(Database db, User user)
        {
            if (new UserVendor() { UserID = user.ID, VendorID = ID }.Select(db, "UserID,VendorID"))
                return true;
            return false;
        }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryExecuteCommand(db, "DROP INDEX IF EXISTS vendor_name_idx");
            TryExecuteCommand(db, "ALTER TABLE " + GetDefaultTable() + " ALTER COLUMN deliverysettingsjsondata TYPE TEXT");
        }
    }
}
