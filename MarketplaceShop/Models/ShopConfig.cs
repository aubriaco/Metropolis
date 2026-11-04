/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 
using Marketplace;
using MarketplaceData;
using MarketplaceData.Models;

namespace MarketplaceShop.Models
{
    public class ShopConfig
    {
        public VendorView? Vendor { get; set; }

        public void Load(Database db)
        {
            if(Config.I == null)
                return;
            Vendor = new Vendor() { Ident = Config.I.VendorIdent };
            Vendor.Select(db, "Ident");
        }
    }
}