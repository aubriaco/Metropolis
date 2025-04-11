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
using Ubriaco.Models;

namespace MarketplaceData.Models
{
    [Table("cartproduct")]
    public class CartProduct : BaseModel
    {
        public long UserID { get; set; }
        public long OrderID { get; set; }
        public long ParentOrderID { get; set; }
        public long ProductID { get; set; }
        public int Quantity { get; set; }
        public DateTime CreatedDate { get; set; }
        public decimal Price { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal Shipping { get; set; } = 0;
        public decimal Handling { get; set; } = 0;
        public decimal Tip { get; set; } = 0;
        public decimal SalesTax { get; set; }
        public decimal SalesTaxPercent { get; set; }
        public decimal TotalTax { get; set; }
        public decimal TotalShipping { get; set; }
        public decimal Total { get; set; }
        public decimal Discount { get; set; } = 0;
        public bool IsProcessable { get; set; } = false;

        public string Status { get; set; } = "New";

        [ModelLocal]
        public Product? Product { get; set; }
        
        public void Calculate(ProductView product)
        {
            Price = product.Price;
            TotalPrice = Price * (decimal)Quantity;
            TotalTax = SalesTax * (decimal)Quantity;
            Total = TotalPrice + TotalTax;
        }

        public static List<CartProduct> GetByOrder(Database db, long orderID)
        {
            var list = new List<CartProduct>();
            using(var cmd = new NpgsqlCommand(@"SELECT cp.*, p.name, p.ident, p.displayimageurl FROM cartproduct cp LEFT JOIN product p ON p.id=cp.productid WHERE cp.orderid=@orderid", db.C))
            {
                cmd.Parameters.AddWithValue("@orderid", orderID);
                using(var r = cmd.ExecuteReader())
                {
                    while(r.Read())
                    {
                        var item = new CartProduct();
                        item.Populate(r);
                        item.Product = new Product();
                        item.Product.Populate(r);
                        list.Add(item);
                    }
                }
            }
            return list;
        }
    }
}
