/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Ubriaco.Attributes;
using Ubriaco.Models;

namespace MarketplaceData.Models
{
    [Table("useragreement")]
    public class UserAgreement : BaseModel
    {
        public static List<UserAgreement> CurrentAgreements = new List<UserAgreement>()
        {
            new UserAgreement() { DocumentName = "TOSBuyers", DocumentRevision = "2023-07-06" },
            new UserAgreement() { DocumentName = "TOSSellers", DocumentRevision = "2023-07-06" }
        };

        public long UserID { get; set; }
        public string? DocumentName { get; set; }
        public string? DocumentRevision { get; set; }
        public bool Agreed { get; set; }
        public DateTime AgreedDate { get; set; }

        public static bool IsAgreed(Database db, long userID, string documentName)
        {
            var agreement = CurrentAgreements.First(item => item.DocumentName == documentName);
            if (agreement == null)
                throw new Exception("Agreement not found.");

            var ua = new UserAgreement() { UserID = userID, DocumentName = agreement.DocumentName, DocumentRevision = agreement.DocumentRevision, Agreed = true };

            if (ua.Select(db, "UserID,DocumentName,DocumentRevision,Agreed"))
                return true;

            return false;
        }
    }
}
