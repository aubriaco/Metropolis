/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Ubriaco.Attributes;

namespace MarketplaceData.Models
{
    public class VendorView : MasterModel
    {
        public string Name { get; set; } = string.Empty;
        public string? Ident { get; set; }
        [VariableInfo("TEXT")]
        public string? Description { get; set; }
        public long AddressID { get; set; }
        [ModelLocal]
        public Address? Address { get; set; }
        [ModelLocal]
        public List<VendorDocument>? Documents { get; set; }

        public string? Phone { get; set; }
        public string? Email { get; set; }

        public string? ImageIdent { get; set; }
        public string? CoverImageIdent { get; set; } = "/img/bg-default.png";
        public bool IsActive { get; set; } = false;
        public bool IsDeclined { get; set; } = false;

        [ModelLocal]
        public int PendingCount { get; set; } = 0;
        [ModelLocal]
        public int ProcessedCount { get; set; } = 0;
        [ModelLocal]
        public int ConfirmedCount { get; set; } = 0;

        [ModelLocal]
        public string? ImageUrl
        {
            get
            {
                if (string.IsNullOrEmpty(ImageIdent))
                    return null;
                return "/api/storage/image?ident=" + ImageIdent;
            }
        }

        [ModelLocal]
        public string? CoverImageUrl
        {
            get
            {
                if (string.IsNullOrEmpty(CoverImageIdent))
                    return null;
                return "/api/storage/image?ident=" + CoverImageIdent;
            }
        }


        [ModelLocal]
        public string Status
        {
            get
            {
                if (IsActive)
                    return "Active";
                else if(IsDeclined)
                    return "Declined";
                else
                    return "Pending Review";
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

        [VariableInfo("TEXT")]
        public string? DeliverySettingsJsonData { get; set; }

        public void PullChildren(Database db)
        {
            Address = new Address() { ID = AddressID };
            Address.Select(db, "ID");
        }

    }
}
