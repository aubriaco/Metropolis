/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData;
using MarketplaceData.Models;
using Npgsql;
using Ubriaco.Attributes;

namespace MarketplaceData.Models
{
    [Table("userinvite")]
    public class UserInvite : MasterModel
    {
        public string? Email { get; set; }
        public string? Code { get; set; }
        public long VendorID { get; set; }
        public DateTime ExpiresDate { get; set; }

        public static UserInvite? GetValidUserInvite(Database db, string email)
        {
            email = email.ToLower().Trim();
            using (var cmd = new NpgsqlCommand(@"SELECT * FROM userinvite WHERE email=@email AND expiresdate>CURRENT_DATE LIMIT 1", db.C))
            {
                cmd.Parameters.AddWithValue("@email", email);
                using (var r = cmd.ExecuteReader())
                {
                    if (r.Read())
                    {
                        var item = new UserInvite();
                        item.Populate(r);
                        return item;
                    }
                }
            }
            return null;
        }

        public static List<UserInvite> GetListByVendor(Database db, long vendorID)
        {
            var list = new List<UserInvite>();
            using (var cmd = new NpgsqlCommand(@"SELECT * FROM userinvite WHERE vendorid=@vendorid ORDER BY email ASC", db.C))
            {
                cmd.Parameters.AddWithValue("@vendorid", vendorID);
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var item = new UserInvite();
                        item.Populate(r);
                        list.Add(item);
                    }
                }
            }
            return list;
        }
    }
}