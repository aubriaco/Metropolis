/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MarketplaceData.Util
{
    public static class TaxUtil
    {
        public static void CalculateTaxes(Database db, CartProduct cartProduct, Address billingAddress)
        {
            if (billingAddress.Country == "USA" && billingAddress.State == "PR")
            {
                cartProduct.SalesTaxPercent = 10.5M;
            }
            else
            {
                cartProduct.IsProcessable = false;
                return;
            }
            var product = db.GetProductWithImage(cartProduct.ProductID);
            if (product == null)
            {
                cartProduct.IsProcessable = false;
                return;
            }    

            cartProduct.Price = product.Price;
            cartProduct.SalesTax = cartProduct.Price * (cartProduct.SalesTaxPercent / 100M);
            cartProduct.TotalTax = cartProduct.SalesTax;
            cartProduct.IsProcessable = true;
        }
    }
}
