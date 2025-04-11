/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Npgsql;
using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models
{
    [Table("product")]
    public class Product : ProductView
    {
        public long VendorID { get; set; } = 0;


        [ColVisible]
        public long CategoryID { get; set; } = 0;

        public long CreatedByUserID { get; set; } = 0;

        [ColVisible]
        public decimal HandlingFee { get; set; } = 0;

        [ColVisible]
        public decimal Cost { get; set; } = 0;


        [ColVisible]
        public int SKU { get; set; } = 0;
        [ColVisible]
        public string? Barcode { get; set; }


        [ColVisible]
        public bool IsDigital { get; set; } = false;
        [ColVisible]
        public bool IsService { get; set; } = false;

        public bool IsDeleted { get; set; } = false;
        public bool IsFeatured { get; set; } = false;

        public string? ExternalID { get; set; }

        public string Status
        {
            get
            {
                if (IsActive)
                    return "Active";
                return "Inactive";
            }
        }

        [ModelLocal]
        public bool GoodStatus
        {
            get
            {
                if (IsActive)
                    return true;
                return false;
            }
        }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "VendorID");
            TryExecuteCommand(db, "UPDATE " + GetDefaultTable() + " SET isdeleted=false WHERE isdeleted IS NULL");
        }

        public static List<Product> GetFeaturedTop(Database db)
        {
            var list = new List<Product>();
            using(var cmd = new NpgsqlCommand(@"SELECT p.* FROM product p INNER JOIN vendor v ON v.id=p.vendorid WHERE v.isactive=true AND p.isactive=true AND p.isdeleted=false AND p.isservice=false ORDER BY p.isfeatured DESC LIMIT 2", db.C))
            {
                using(var r = cmd.ExecuteReader())
                {
                    while(r.Read())
                    {
                        var item = new Product();
                        item.Populate(r);
                        list.Add(item);
                    }
                }
            }
            return list;
        }
    }
}
