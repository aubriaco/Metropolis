/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 
using Ubriaco.Attributes;
using Ubriaco.Data;
using Ubriaco.Models;

namespace MarketplaceData.Models
{
    [Table("sessionextra")]
    public class SessionExtra : BaseModel
    {
        public long UserID { get; set; }

        public long ActiveVendorID { get; set; }

        [ModelLocal]
        public Vendor? ActiveVendor { get; set; }

        public void PullChildren(Database db)
        {
            if(ActiveVendorID != 0)
                ActiveVendor = Vendor.GetFromID<Vendor>(db, ActiveVendorID);
        }

        public static SessionExtra? Get(Database db, User user)
        {
            var se = new SessionExtra(){ UserID = user.ID };
            if(se.Select(db, "UserID"))
                return se;
            else
                return null;
        }

        public static async Task<long> SaveUpdateAsync(Database db, User user, Dictionary<string, object> props)
        {
            var se = new SessionExtra(){ UserID = user.ID };
            if(await se.SelectAsync(db, "UserID"))
            {
                var type = typeof(SessionExtra);
                foreach(var prop in props)
                {
                    var p = type.GetProperty(prop.Key);
                    if(p != null)
                        p.SetValue(se, prop.Value);
                }
                await se.UpdateAsync(db);
            }
            else
                se.ID = await se.InsertAsync(db);
            return se.ID;
        }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "UserID", true);
        }
    }
}