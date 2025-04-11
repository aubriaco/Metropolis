/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Attributes;
using Npgsql;
using Ubriaco.Attributes;

namespace MarketplaceData.Models.Social
{
    [Table("car")]
    public class Car : MasterModel
    {
        [PublicProp]
        public long UserID { get; set; }
        [PublicProp]
        [ColEditable]
        public string Make { get; set; }
        [PublicProp]
        [ColEditable]
        public string Model { get; set; }
        [PublicProp]
        [ColEditable]
        public int Year { get; set; } = 0;
        [PublicProp]
        [ColEditable]
        public bool Modified { get; set; }
        [VariableInfo("TEXT")]
        [ColEditable]
        [PublicProp]
        public string? Mods { get; set; }
        [PublicProp]
        [ColEditable]
        public int CarTypeID { get; set; }
        [ColEditable]
        [PublicProp]
        [ModelLocal]
        public List<StorageItem> Photos { get; set; } =  new List<StorageItem>();

        public long DisplayPhotoID { get; set; }

        [ModelLocal]
        [PublicProp]
        public StorageItem DisplayPhoto { get; set; } = new StorageItem();

        public bool Removed { get; set; } = false;
        public DateTime RemovedDate { get; set; }

        [ModelLocal]
        [PublicProp]
        public string? Username { get; set; }

        public void PullChildren(Database db)
        {
            var cp = new CarPhoto() { ID = DisplayPhotoID };
            if(cp.Select(db, "ID"))
            {
                DisplayPhoto.ID = cp.StorageItemID;
                DisplayPhoto.Select(db, "ID");
            }

            var user = new User() { ID = UserID };
            if (user.Select(db, "ID"))
                Username = user.Username;

            Photos.Clear();
            using (var cmd = new NpgsqlCommand(@"SELECT si.* FROM storageitem si INNER JOIN carphoto vsi ON vsi.storageitemid=si.id WHERE vsi.carid=@id", db.C))
            {
                cmd.Parameters.AddWithValue("@id", ID);
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var si = new StorageItem();
                        si.Populate(r);
                        Photos.Add(si);
                    }
                }
            }
        }

        public static List<Car> GetList(Database db, long userID)
        {
            var list = new List<Car>();
            using (var cmd = new NpgsqlCommand(@"SELECT c.*, si.ident AS si_ident FROM car c LEFT JOIN carphoto cp ON cp.id=c.displayphotoid LEFT JOIN storageitem si ON si.id=cp.storageitemid WHERE c.userid=@userid AND c.removed=false ORDER BY c.year, c.make, c.model ASC", db.C))
            {
                cmd.Parameters.AddWithValue("@userid", userID);
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var item = new Car();
                        item.Populate(r);
                        if (r["si_ident"] != null)
                            item.DisplayPhoto.Ident = r["si_ident"].ToString();
                        list.Add(item);
                    }
                }
            }
            return list;
        }
    }
}
