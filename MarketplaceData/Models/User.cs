/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Attributes;
using MarketplaceData.Models.Referral;
using MarketplaceData.Util;
using Newtonsoft.Json;
using Npgsql;
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
    [Table("_user")]
    public class User : MasterModel
    {
        [PublicProp]
        public string? Username { get; set; }
        [PublicProp]
        [RequiredProp]
        public string? Email { get; set; }
        [PublicProp]
        public string? Password { get; set; }
        [ModelLocal]
        public string? ConfirmPassword { get; set; }
        [PublicProp]
        [RequiredProp]
        public string? FirstName { get; set; }
        [PublicProp]
        [RequiredProp]
        public string? LastName { get; set; }

        [ModelLocal]
        public string Name
        {
            get
            {
                if(FirstName != null && LastName != null)
                    return FirstName + " " + LastName;
                return string.Empty;
            }
        }
        [RequiredProp]
        public string? Phone { get; set; }
        public string? PhoneExt { get; set; }
        public long AddressID { get; set; }
        public long PhysicalAddressID { get; set; }
        public bool RequireMFA { get; set; } = false;
        public int RoleID { get; set; }

        [ModelLocal]
        public bool? MFA { get; set; }

        [ModelLocal]
        public string? Code { get; set; }

        [ModelLocal]
        public Address? Address { get; set; }

        [ModelLocal]
        public Address? PhysicalAddress { get; set; }

        [ModelLocal]
        public RefAccountInfo RefAccountInfo { get; set; } = new RefAccountInfo();

        [PublicProp]
        public bool IsVendor { get; set; } = false;
        [PublicProp]
        public bool IsAdmin { get; set; } = false;
        [PublicProp]
        public bool IsValidator { get; set; } = false;
        [PublicProp]
        public bool IsReferrer { get; set; } = false;
        [PublicProp]
        public bool IsAuctionUser { get; set; } = false;
        [PublicProp]
        public bool IsRefUser { get; set; } = false;
        [PublicProp]
        public bool IsRefAdmin { get; set; } = false;
        [PublicProp]
        public bool IsRefClient { get; set; } = false;
        [PublicProp]
        public bool IsBidder { get; set; } = false;
        [PublicProp]
        public bool IsAuctioneer { get; set; } = false;

        [PublicProp]
        [ModelLocal]
        public List<string> Roles { get; set; } = new List<string>();

        [VariableInfo("TEXT")]
        public string _Roles
        {
            get
            {
                return JsonConvert.SerializeObject(Roles);
            }
            set
            {
                var j = JsonConvert.DeserializeObject<List<string>>(value);
                if (j != null)
                    Roles = j;
                else
                    Roles = new List<string>();
            }
        }

        [ModelLocal]
        public bool Accept { get; set; }

        [ModelLocal]
        public int Step { get; set; } = 1;

        public bool EmailVerified { get; set; } = false;
        public bool PhoneVerified { get; set; } = false;

        [ModelLocal]
        public string? ReturnLoc { get; set; }

        [ModelLocal]
        public string? SID { get; set; }
        public string Lang { get; set; } = "es";

        public DateTime LastSeenDate { get; set; }

        [ModelLocal]
        public ReferralOnboardSurvey? ReferralSurvey { get; set; }
        [ModelLocal]
        public bool IsViewMode { get; set; }
        [ModelLocal]
        public string? Pin { get; set;}
        [ModelLocal]
        public string? VendorName { get; set; }

        public DateTime BirthDate
        {
            get
            {
                return DateTime.Parse(BirthDateM.ToString().PadLeft(2, '0') + "/" + BirthDateD.ToString().PadLeft(2, '0') + "/" + BirthDateY.ToString().PadLeft(4, '2'));
            }
            set
            {
                BirthDateY = value.Year;
                BirthDateM = value.Month;
                BirthDateD = value.Day;
            }
        }

        [ModelLocal]
        public int BirthDateD { get; set; } = 1;
        [ModelLocal]
        public int BirthDateM { get; set; } = 1;
        [ModelLocal]
        public int BirthDateY { get; set; } = 1;

        [ModelLocal]
        public Vendor? Vendor { get; set; }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "(lower(firstname||' '||lastname))");
            TryCreateIndex(db, "(lower(lastname||' '||firstname))");
            TryCreateIndex(db, "username", true);
            TryCreateIndex(db, "email", true);            
        }

        public static User? LoginByEmail(Database db, string email, string password)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrEmpty(password))
                return null;
            email = email.Trim().ToLower();
            using (var cmd = new NpgsqlCommand(@"SELECT u.* FROM _user u WHERE u.email=@email AND u.password=@password LIMIT 1", db.C))
            {
                cmd.Parameters.AddWithValue("@email", email);
                cmd.Parameters.AddWithValue("@password", CryptUtil.HashPassword(password));
                using (var r = cmd.ExecuteReader())
                {
                    if (r.Read())
                    {
                        var item = new User();
                        item.Populate(r);
                        item.Password = null;
                        return item;
                    }
                    return null;
                }
            }
        }

        public static User? GetUserByEmail(Database db, string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;
            email = email.Trim().ToLower();
            using (var cmd = new NpgsqlCommand(@"SELECT u.* FROM _user u WHERE u.email=@email LIMIT 1", db.C))
            {
                cmd.Parameters.AddWithValue("@email", email);
                using (var r = cmd.ExecuteReader())
                {
                    if (r.Read())
                    {
                        var item = new User();
                        item.Populate(r);
                        item.Password = null;
                        return item;
                    }
                    return null;
                }
            }
        }

        public static List<User> GetListByVendor(Database db, long vendorID)
        {
            var list = new List<User>();
            using(var cmd = new NpgsqlCommand(@"SELECT u.* FROM _user u INNER JOIN uservendor uv ON uv.userid=u.id WHERE uv.vendorid=@vendorid ORDER BY lower(firstname||' '||lastname) ASC", db.C))
            {
                cmd.Parameters.AddWithValue("@vendorid", vendorID);
                using(var r = cmd.ExecuteReader())
                {
                    while(r.Read())
                    {
                        var item = new User();
                        item.Populate(r);
                        item.Password = null;
                        list.Add(item);
                    }
                }
            }
            return list;
        }
    }
}
