/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Npgsql;
using Ubriaco.Attributes;
using Ubriaco.Data;
using Ubriaco.Models;

namespace MarketplaceData.Models
{
    [Table("uservendor")]
    public class UserVendor : BaseModel
    {
        public long UserID { get; set; }
        public long VendorID { get; set; }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "UserID");
        }

        public static List<User> GetUsers(Database db, long vendorID)
        {
            var list = new List<User>();
            using(var cmd = new NpgsqlCommand("SELECT u.* FROM _user u INNER JOIN uservendor uv ON uv.userid=u.id WHERE vendorid=@vendorid", db.C))
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
