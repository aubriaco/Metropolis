/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Util;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;
using Ubriaco.Models;

namespace MarketplaceData.Models
{
    [Table("category")]
    public class Category : BaseModel
    {
        public long ParentID { get; set; } = 0;
        public string Name { get; set; }
        public string? Path { get; set; }
        public string? _Ident = null;
        public string Ident
        {
            get
            {
                if(_Ident != null)
                    return _Ident;
                if (Name != null)
                    return GeneralUtil.StripName(Name).Replace(' ', '-').ToLower();
                return "";
            }
            set
            {
                _Ident = value;
            }
        }

        public static List<Category> GetList(Database db, bool showEmpty = false)
        {
            var list = new List<Category>();
            using(var cmd = new NpgsqlCommand(@"SELECT c.* FROM category c " + (!showEmpty ? " WHERE (SELECT COUNT(p.ID) FROM product p INNER JOIN vendor v ON v.id=p.vendorid WHERE p.categoryid=c.id AND p.isactive=true AND p.isdeleted=false AND v.isactive=true)!=0 " : "") + @" ORDER BY c.name ASC", db.C))
            {
                using(var r = cmd.ExecuteReader())
                {
                    while(r.Read())
                    {
                        var item = new Category();
                        item.Populate(r);
                        list.Add(item);
                    }
                }
            }
            return list;
        }
    }
}
