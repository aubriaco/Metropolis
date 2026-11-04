/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Enumerables;
using MarketplaceData.Models;
using MarketplaceData.Util;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Data;

namespace MarketplaceData
{
    public class Database : BaseConnection
    {
        public static int PageLimit = 30;
        public Database(bool disableAutoOpen = false) : base(disableAutoOpen)
        {

        }

        public static new async Task<Database> CreateAsync()
        {
            var db = new Database(true);
            if(db.C == null)
                throw new Exception("Database connection is null");
            await db.C.OpenAsync();
            return db;
        }

        public void Dispose()
        {
            base.Dispose();
        }

        public Database(string cs)
        {
            if (cs != null)
            {
                C = new NpgsqlConnection(cs);
                C.Open();
            }
        }

        public void TryExec(string q)
        {
            try
            {
                using (var cmd = new NpgsqlCommand(q, C))
                {
                    cmd.ExecuteNonQuery();
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("TryExec: Error: " + e.Message);
            }
        }

        public void Clean(string tableName, string varName, long idValue)
        {
            using (var cmd = new NpgsqlCommand(@"DELETE FROM " + tableName.ToLower() + " WHERE " + varName.ToLower() + "=@VAL", C))
            {
                cmd.Parameters.AddWithValue("@VAL", idValue);
                cmd.ExecuteNonQuery();
            }
        }

        public string? GetGlobal(string name)
        {
            using (var cmd = new NpgsqlCommand(@"SELECT * FROM global WHERE name=@name LIMIT 1", C))
            {
                cmd.Parameters.AddWithValue("@name", name);
                using (var r = cmd.ExecuteReader())
                {
                    if (r.Read())
                    {
                        var item = new Global();
                        item.Populate(r);
                        return item.Value;
                    }
                    return null;
                }

            }
        }

        public void SetGlobal(string name, string value)
        {
            var item = new Global();
            item.Name = name;
            if (item.Select(this, "Name"))
            {
                item.Value = value;
                item.Update(this, "Value");
            }
            else
            {
                item.Value = value;
                item.Insert(this);
            }
        }


        public User? Login(User user)
        {
            if (user.Username == null || user.Email == null)
                return null;
            using (var cmd = new NpgsqlCommand(@"SELECT u.* FROM _user u WHERE u.email=@email AND u.password=@password LIMIT 1", C))
            {
                cmd.Parameters.AddWithValue("@email", user.Email.Trim().ToLower());
                cmd.Parameters.AddWithValue("@password", CryptUtil.HashPassword(user.Password));
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

        public Vendor? GetVendorByName(string name)
        {
            Vendor? item = null;
            using (var cmd = new NpgsqlCommand(@"SELECT * FROM vendor WHERE lower(name)=@name", C))
            {
                cmd.Parameters.AddWithValue("@name", name.ToLower().Trim());
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        item = new Vendor();
                        item.Populate(r);
                    }
                }
                return item;
            }
        }

        public List<User> GetUsersTiedToVendor(long vendorId)
        {
            var list = new List<User>();
            using (var cmd = new NpgsqlCommand(@"SELECT u.* FROM _user u INNER JOIN uservendor uv ON uv.userid=u.id WHERE uv.vendorid=@vendorid ORDER BY (lower(u.firstname || ' ' || u.lastname)) ASC", C))
            {
                cmd.Parameters.AddWithValue("@vendorId", vendorId);
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var item = new User();
                        item.Populate(r);
                        item.Password = null;
                        list.Add(item);
                    }
                }
                return list;
            }
        }

        public MList<Vendor> GetVendorsByUserID(long userId)
        {
            var list = new MList<Vendor>();
            using (var cmd = new NpgsqlCommand(@"SELECT v.*,
                    (SELECT COUNT(id) FROM _order WHERE ordertype=@ordertype AND vendorid=v.id AND statushigh='Pending') AS PendingCount,
                    (SELECT COUNT(id) FROM _order WHERE ordertype=@ordertype AND vendorid=v.id AND statushigh='Processed') AS ProcessedCount,
                    (SELECT COUNT(id) FROM _order WHERE ordertype=@ordertype AND vendorid=v.id AND statushigh='Confirmed') AS ConfirmedCount
                    FROM vendor v INNER JOIN uservendor uv ON uv.vendorid=v.id WHERE uv.userid=@userid ORDER BY v.name ASC", C))
            {
                cmd.Parameters.AddWithValue("@userid", userId);
                cmd.Parameters.AddWithValue("@ordertype", Order.OrderTypeVendor);
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var item = new Vendor();
                        item.Populate(r);
                        list.Add(item);
                    }
                }
                return list;
            }
        }

        public List<Product> GetProductsFromWishlist(long userId)
        {
            var list = new List<Product>();
            using (var cmd = new NpgsqlCommand(@"SELECT p.*, si.ident AS storageitem_ident, si.ext AS storageitem_ext
                                                        FROM product p
                                                        INNER JOIN wishproduct wp ON wp.productid=p.id
                                                        INNER JOIN vendor v ON v.id=p.vendorid
                                                        LEFT JOIN productimage pi ON pi.productid=p.id AND pi.orderindex=0
                                                        LEFT JOIN storageitem si ON si.id=pi.storageitemid
                                                        WHERE wp.userid=@userid AND p.isactive=true AND v.isactive=true ORDER BY wp.createddate DESC", C))
            {
                cmd.Parameters.AddWithValue("@userid", userId);
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var item = new Product();
                        item.Populate(r);
                        item.Images = new List<StorageItem>();
                        var si = new StorageItem();
                        si.Ident = (r["storageitem_ident"] ?? "").ToString();
                        si.Ext = (r["storageitem_ext"] ?? "").ToString();
                        item.Images.Add(si);
                        list.Add(item);
                    }
                }
                return list;
            }
        }

        public Product? GetProductWithImage(long id)
        {
            using (var cmd = new NpgsqlCommand(@"SELECT p.*, si.ident AS storageitem_ident, si.ext AS storageitem_ext
                                                        FROM product p
                                                        INNER JOIN vendor v ON v.id=p.vendorid
                                                        LEFT JOIN productimage pi ON pi.productid=p.id AND pi.orderindex=0
                                                        LEFT JOIN storageitem si ON si.id=pi.storageitemid
                                                        WHERE p.id=@id AND p.isactive=true AND v.isactive=true LIMIT 1", C))
            {
                cmd.Parameters.AddWithValue("@id", id);
                using (var r = cmd.ExecuteReader())
                {
                    if (r.Read())
                    {
                        var item = new Product();
                        item.Populate(r);
                        item.Images = new List<StorageItem>();
                        var si = new StorageItem();
                        si.Ident = (r["storageitem_ident"] ?? "").ToString();
                        si.Ext = (r["storageitem_ext"] ?? "").ToString();
                        item.Images.Add(si);
                        return item;
                    }
                }
                return null;
            }
        }

        public List<Product> GetProducts(long vendorId = 0, bool isService = false, bool showHidden = false)
        {
            var list = new List<Product>();
            string extra = "";
            if (vendorId != 0)
                extra += " AND p.vendorid=" + vendorId;
            if(!showHidden)
                extra += " AND p.isactive=true ";
            using (var cmd = new NpgsqlCommand(@"SELECT p.* FROM product p WHERE p.isservice=@isservice AND p.isdeleted=false " + extra + " ORDER BY p.name ASC", C))
            {
                cmd.Parameters.AddWithValue("@isservice", isService);
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var item = new Product();
                        item.Populate(r);
                        list.Add(item);
                    }
                }
                return list;
            }
        }

        public List<Review> GetReviewsByProduct(long productId = 0)
        {
            var list = new List<Review>();
            using (var cmd = new NpgsqlCommand(@"SELECT r.*, u.firstname, u.lastname FROM review r INNER JOIN _user u ON u.id=r.userid WHERE r.productid=@productid ORDER BY id DESC", C))
            {
                cmd.Parameters.AddWithValue("@productid", productId);
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var item = new Review();
                        item.Populate(r);
                        list.Add(item);
                    }
                }
                return list;
            }
        }

        public void UpdateProductRating(long productId)
        {
            using (var cmd = new NpgsqlCommand(@"UPDATE product SET reviewcount=(SELECT COUNT(id) FROM review WHERE productid=p.id), rating=(SELECT SUM(rating)/COUNT(id) FROM review WHERE productid=p.id) FROM product p WHERE p.id=@productid", C))
            {
                cmd.Parameters.AddWithValue("@productid", productId);
                cmd.ExecuteNonQuery();
            }
        }

        public object GetProductSearch(SearchQuery sq, bool countOnly = false)
        {
            var list = new List<ProductView>();
            string extra = "";
            string[]? p = null;
            int n = 0;
            if (!string.IsNullOrEmpty(sq.Terms))
            {
                var innerExtra = "";
                p = sq.Terms.Split(' ');
                n = 1;
                foreach (var i in p)
                {
                    if (innerExtra.Length > 0)
                        innerExtra += " OR ";
                    innerExtra += " pt.tagname LIKE @tagname" + n + " OR lower(p.name) LIKE @tagname" + n + "m";
                    n++;
                }
                extra += " AND (" + innerExtra + ") ";
            }
            if (sq.CategoryIDList != null && sq.CategoryIDList.Count > 0)
            {
                var innerExtra = "";
                foreach (var i in sq.CategoryIDList)
                {
                    if (innerExtra.Length > 0)
                        innerExtra += " OR ";
                    innerExtra += " p.categoryid=" + i;
                }
                extra += " AND (" + innerExtra + ") ";
            }
            if (sq.Filter != null)
            {
                if (sq.Filter.PriceStart != decimal.MinusOne)
                {
                    extra += " AND p.price>=" + sq.Filter.PriceStart;
                }
                if (sq.Filter.PriceEnd != decimal.MinusOne)
                {
                    extra += " AND p.price<=" + sq.Filter.PriceEnd;
                }
            }

            if (!countOnly)
            {
                if (sq.Filter == null)
                    sq.Filter = new SearchQuery._Filter() { Page = 1 };
                extra += " LIMIT 15 OFFSET " + ((sq.Filter.Page - 1) * 15);
            }

            using (var cmd = new NpgsqlCommand(@"SELECT " + (countOnly ? " COUNT(p.id) AS counter " : @"p.*,
                                                c.name AS categoryname,
                                                c.ident AS categoryident,                                                
                                                si.ident AS storageitem_ident,
                                                si.ext AS storageitem_ext") + @"
                                                FROM product p
                                                        LEFT JOIN category c ON c.id=p.categoryid
                                                        INNER JOIN vendor v ON v.id=p.vendorid "
                                                        + (!string.IsNullOrEmpty(sq.Terms) ? " LEFT JOIN producttag pt ON pt.productid=p.id " : "")
                                                        + @" LEFT JOIN productimage pi ON pi.productid=p.id AND pi.orderindex=0
                                                        LEFT JOIN storageitem si ON si.id=pi.storageitemid
                                                        WHERE p.isactive=true AND p.isdeleted=false AND v.isactive=true " + extra, C))
            {

                if (p != null)
                {
                    n = 1;
                    foreach (var i in p)
                    {
                        var v = i.Replace("%", "").ToLower();
                        cmd.Parameters.AddWithValue("@tagname" + n, v);
                        cmd.Parameters.AddWithValue("@tagname" + n + "m", v + "%");
                        n++;
                    }
                }
                long counter = 0;
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        if (countOnly)
                        {
                            counter = Convert.ToInt64(r["counter"]);
                            break;
                        }

                        var item = new ProductView();
                        item.Populate(r);
                        item.Images = new List<StorageItem>();
                        var si = new StorageItem();
                        si.Ident = (r["storageitem_ident"] ?? "").ToString();
                        si.Ext = (r["storageitem_ext"] ?? "").ToString();
                        item.Images.Add(si);
                        list.Add(item);
                    }
                }
                if (countOnly)
                    return counter;
                return list;
            }
        }

        public List<StorageItem> GetProductImages(long productId)
        {
            var list = new List<StorageItem>();

            using (var cmd = new NpgsqlCommand(@"SELECT si.* FROM storageitem si INNER JOIN productimage pi ON pi.storageitemid=si.id WHERE pi.productid=@productid ORDER BY pi.orderindex ASC", C))
            {
                cmd.Parameters.AddWithValue("@productid", productId);
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var item = new StorageItem();
                        item.Populate(r);
                        list.Add(item);
                    }
                }
                return list;
            }
        }

        public List<ProductTag> GetProductTags(long productId)
        {
            var list = new List<ProductTag>();

            using (var cmd = new NpgsqlCommand(@"SELECT pt.* FROM producttag pt WHERE pt.productid=@productid ORDER BY pt.tagname ASC", C))
            {
                cmd.Parameters.AddWithValue("@productid", productId);
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var item = new ProductTag();
                        item.Populate(r);
                        list.Add(item);
                    }
                }
                return list;
            }
        }

        public List<string> GetProductTagStrings(long productId)
        {
            var list = new List<string>();
            var pts = GetProductTags(productId);
            foreach (var pt in pts)
            {
                list.Add(pt.TagName);
            }
            return list;
        }

        // Orders

        public List<Order> GetOrdersByVendor(long vendorId = 0)
        {
            var list = new List<Order>();
            using (var cmd = new NpgsqlCommand(@"SELECT o.* FROM _order o WHERE o.ordertype=@ordertype AND o.vendorid=@vendorid ORDER BY o.createddate DESC", C))
            {
                cmd.Parameters.AddWithValue("@ordertype", Order.OrderTypeVendor);
                cmd.Parameters.AddWithValue("@vendorid", vendorId);
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var item = new Order();
                        item.Populate(r);
                        list.Add(item);
                    }
                }
                return list;
            }
        }

        // Misc

        public int[] GetPaging(int page)
        {
            int limit = PageLimit;
            int[] r = new int[2];
            r[0] = (page - 1) * limit;
            r[1] = limit;
            return r;
        }

        public void PutPaging(NpgsqlCommand cmd, int page)
        {
            int[] p = GetPaging(page);
            cmd.Parameters.AddWithValue("@offset", p[0]);
            cmd.Parameters.AddWithValue("@limit", p[1]);
        }

    }
}
