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
    [Table("review")]
    public class Review : BaseModel
    {
        public long UserID { get; set; }
        public long ProductID { get; set; }
        [VariableInfo("TEXT")]
        public string Body { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public int Rating { get; set; }

        [ModelLocal]
        public string? FirstName { get; set; }
        [ModelLocal]
        public string? LastName { get; set; }


        [ModelLocal]
        public string? RatingHTML
        {
            get
            {
                string r = "";
                var t = Rating;
                for (int n = 1; n <= 5; n++)
                {
                    r += "<i class=\"bx bxs-star " + (n <= t ? "text-warning" : "text-light-4") + "\"></i>";
                }
                return r;
            }
        }
    }
}
