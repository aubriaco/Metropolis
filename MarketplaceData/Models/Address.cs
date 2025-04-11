/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Attributes;
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
    [Table("address")]
    public class Address : MasterModel
    {
        [RequiredProp]
        public string? Line1 { get; set; }
        public string? Line2 { get; set; }
        [RequiredProp]
        public string? City { get; set; }
        [RequiredProp]
        public string? State { get; set; }
        [RequiredProp]
        public string? Country { get; set; }
        public long CountryID { get; set; } = 0;
        [RequiredProp]
        public string? PostalCode { get; set; }

        public virtual bool Validate(out string[] errorMessages)
        {
            var errors = new List<string>();
            if (string.IsNullOrWhiteSpace(Line1))
                errors.Add("Line 1 is blank.");
            if (string.IsNullOrWhiteSpace(City))
                errors.Add("City is blank.");
            if (string.IsNullOrWhiteSpace(State))
                errors.Add("State is blank.");
            if (string.IsNullOrWhiteSpace(Country))
                errors.Add("Country is blank.");
            if (string.IsNullOrWhiteSpace(PostalCode))
                errors.Add("Postal Code is blank.");
            errorMessages = errors.ToArray();
            return errors.Count == 0;
        }

        public override string ToString()
        {
            return Line1 + (!string.IsNullOrWhiteSpace(Line2) ? "\n" + Line2 : "") + "\n" + City + ", " + State + " " + PostalCode + "\n" + Country;
        }

        public string ToString(string lineSeparator = "\n")
        {
            return Line1 + (!string.IsNullOrWhiteSpace(Line2) ? lineSeparator + Line2 : "") + lineSeparator + City + ", " + State + " " + PostalCode + lineSeparator + Country;
        }

        public string ToString(bool html)
        {
            if(html)
                return Line1 + (!string.IsNullOrWhiteSpace(Line2) ? "<br />\n" + Line2 : "") + "<br />\n" + City + ", " + State + " " + PostalCode + "<br />\n" + Country;
            return ToString();
        }

        public string ToDeliveryString()
        {
            if(State == "PR")
                return Line1 + (!string.IsNullOrWhiteSpace(Line2) ? ", " + Line2 : "") + ", " + City + ", " + PostalCode + ", Puerto Rico";
            return Line1 + (!string.IsNullOrWhiteSpace(Line2) ? ", " + Line2 : "") + ", " + City + ", " + State + " " + PostalCode + ", " + Country;
        }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryExecuteCommand(db, "UPDATE " + GetDefaultTable() + " SET country='USA' WHERE country IS NULL OR country='' OR country='Puerto Rico'");
            TryExecuteCommand(db, "UPDATE " + GetDefaultTable() + " SET state='PR' WHERE state IS NULL OR state=''");
        }
    }
}
