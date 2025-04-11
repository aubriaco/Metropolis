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
    public class ProductView : MasterModel
    {
        [ColVisible]
        public string Name { get; set; } = string.Empty;

        [ModelLocal]
        public string? VendorMasterID { get; set; }


        [ColVisible]
        public bool IsActive { get; set; } = false;


        public string? Ident { get; set; }

        [ModelLocal]
        public string? CategoryName { get; set; }

        [ModelLocal]
        public string? CategoryIdent { get; set; }

        public long ReviewCount { get; set; } = 0;

        public decimal Rating { get; set; } = 0;

        [ModelLocal]
        public string? RatingHTML
        {
            get
            {
                string r = "";
                var t = (int)Math.Ceiling(Rating);
                for (int n = 1; n <= 5; n++)
                {
                    r += "<i class=\"bx bxs-star " + (n <= t ? "text-warning" : "text-light-4") + "\"></i>";
                }
                return r;
            }
        }

        [ModelLocal]
        public CartProduct? Cart { get; set; }

        [ModelLocal]
        public Category? Category { get; set; }


        [VariableInfo("TEXT")]
        [ColVisible]
        public string? Description { get; set; }

        [VariableInfo("VARCHAR(255)")]
        [ColVisible]
        public string? ShortDescription { get; set; }

        [ColVisible]
        public decimal Price { get; set; } = 0;
        [ColVisible]
        public decimal ComparePrice { get; set; } = 0;

        [ColVisible]
        public decimal Weight { get; set; } = 0;

        [ColVisible]
        public string WeightUnit { get; set; } = "lb";

        public long DisplayImageStorageItemID { get; set; } = 0;
        public string DisplayImageUrl { get; set; } = "/img/noimage.png";

        [ModelLocal]
        public List<StorageItem>? Images { get; set; }

        public class TAG
        {
            public string? id { get; set; }
            public string? text { get; set; }
        }

        [ModelLocal]
        public List<TAG> MTags
        {
            get
            {
                var list = new List<TAG>();
                if (Tags != null)
                {
                    foreach (var tag in Tags)
                    {
                        list.Add(new TAG() { id = tag, text = tag });
                    }
                }
                return list;
            }
            set
            {
                var tags = new List<string>();
                foreach(var tag in value)
                {
                    tags.Add(tag.text ?? "");
                }
                Tags = tags;
            }
        }

        [ModelLocal]
        public List<string>? Tags { get; set; }

        [ModelLocal]
        public List<object>? Reviews { get; set; }

        [ModelLocal]
        public VendorView? Vendor { get; set; }

        public void CalculateCart()
        {
            if(Cart != null)
                Cart.Calculate(this);
        }
    }
}
