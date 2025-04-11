/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;

namespace MarketplaceData.Models.Referral
{
    [Table("referrallink")]
    public class ReferralLink : MasterModel
    {
        public long UserID { get; set; }
        public long ProgramID { get; set; }
        public string? Ident { get; set; }


        public override long Save(Database db)
        {
            if(string.IsNullOrEmpty(Ident))
                Ident = Guid.NewGuid().ToString();
            return base.Save(db);
        }
    }
}
