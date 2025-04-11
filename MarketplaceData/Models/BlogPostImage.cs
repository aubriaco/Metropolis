/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Npgsql;
using Ubriaco.Attributes;
using Ubriaco.Models;

namespace MarketplaceData.Models
{
    [Table("blogpostimage")]
    public class BlogPostImage : BaseModel
    {
        public long BlogPostID { get; set; }
        public long StorageItemID { get; set; }
        public int OrderIndex { get; set; } = 0;

        public static List<StorageItem> GetStorageItems(Database db, long blogPostID)
        {
            var list = new List<StorageItem>();
            using(var cmd = new NpgsqlCommand(@"SELECT si.* FROM blogpostimage bpi INNER JOIN storageitem si ON si.id=bpi.storageitemid WHERE bpi.blogpostid=@blogpostid ORDER BY orderindex ASC", db.C))
            {
                cmd.Parameters.AddWithValue("@blogpostid", blogPostID);
                using(var r = cmd.ExecuteReader())
                {
                    while(r.Read())
                    {
                        var item = new StorageItem();
                        item.Populate(r);
                        list.Add(item);
                    }
                }
            }
            return list;
        }
    }
}