/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 
namespace MarketplaceData.Models.Cart
{
    public class CartData
    {
        public List<CartProduct> List { get; set; } = new List<CartProduct>();
        public List<ProductView>? Products { get; set; }
        public Order? Order { get; set; }
        public int Step { get; set; } = 1;

        public List<Vendor> GetVendors(Database db)
        {
            var list = new List<Vendor>();
            foreach (var i in List)
            {
                i.Product = db.GetProductWithImage(i.ProductID);
                if (i.Product == null)
                    continue;
                if (list.Find(a => a.ID == i.Product.VendorID) == null)
                {
                    var vendor = Vendor.GetFromID<Vendor>(db, i.Product.VendorID);
                    if (vendor == null)
                        continue;
                    list.Add(vendor);
                }
            }
            return list;
        }       
    }
}