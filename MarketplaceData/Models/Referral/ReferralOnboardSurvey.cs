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
    [Table("referralonboardsurvey")]
    public class ReferralOnboardSurvey : MasterModel
    {
        public long UserID { get; set; }
        public bool HasEnergyProvider { get; set; }
        public bool IsSunrunClient { get; set; }
        public bool IsInterestedSolar { get; set; }
    }
}
