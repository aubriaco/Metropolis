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

namespace MarketplaceData.Models.Referral
{
    [Table("referralprogram")]
    public class ReferralProgram : MasterModel
    {
        [PublicProp]
        public string? Ident { get; set; }
        [PublicProp]
        public string? Name { get; set; }
        public long OwnerUserID { get; set; }

    }
}
