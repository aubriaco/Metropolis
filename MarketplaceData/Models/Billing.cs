/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;

namespace MarketplaceData.Models
{
    [Table("billing")]
    public class Billing : Address
    {
        public long UserID { get; set; }
        public long OrderID { get; set; }

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Company { get; set; }

        [ModelLocal]
        public bool Same { get; set; } = false;

        public override bool Validate(out string[] errorMessages)
        {
            var errors = new List<string>();
            if (FirstName == null)
                errors.Add("First Name is blank.");
            if (LastName == null)
                errors.Add("Last Name is blank.");
            if (Phone == null)
                errors.Add("Phone is blank.");
            else if (GeneralUtil.StripPhone(Phone).Length < 10)
                errors.Add("Phone is invalid.");

            string[] errs;
            base.Validate(out errs);

            errors.AddRange(errs);

            errorMessages = errors.ToArray();

            return errors.Count == 0;
        }
    }
}
