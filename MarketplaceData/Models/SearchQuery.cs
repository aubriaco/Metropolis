/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MarketplaceData.Models
{
    public class SearchQuery
    {
        public class _Filter
        {
            public decimal? PriceStart { get; set; } = decimal.MinusOne;
            public decimal? PriceEnd { get; set; } = decimal.MinusOne;
            public bool? Featured { get; set; } = false;
            public int? Page { get; set; } = 1;
        }
        
        public string? Terms { get; set; }
        public string? CategoryIdent { get; set; }
        public List<long>? CategoryIDList { get; set; }
        public _Filter? Filter { get; set; }
        
    }
}
