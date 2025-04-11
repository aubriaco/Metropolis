/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Models;
using Marketplace.Util;
using Newtonsoft.Json;
using MarketplaceData.Models.Cart;

namespace Marketplace.Util
{
    public static class CartUtil
    {
        public static string? GetSID(HttpContext context, User? user = null)
        {
            string? sid;
            if (!string.IsNullOrEmpty(context.Request.Cookies["CM-Cart"]))
                sid = context.Request.Cookies["CM-Cart"];
            else
            {
                sid = "c-" + Guid.NewGuid().ToString();
                context.Response.Cookies.Append("CM-Cart", sid, new CookieOptions() { Expires = DateTime.UtcNow.AddDays(1) });
            }
            return sid;
        }

        public static CartData GetData(HttpContext context, User? user = null)
        {
            string? sid = GetSID(context, user);
            if (sid == null)
                throw new Exception("CM-Cart is null.");
            using (var redis = new RedisUtil())
            {
                string? data = redis.Get(sid);
                if (data == null)
                    return new CartData();
                try
                {
                    var o = JsonConvert.DeserializeObject<CartData>(data);
                    if (o == null)
                        return new CartData();
                    return o;
                }
                catch
                {
                    redis.Delete(sid);
                    return new CartData();
                }
            }
        }

        public static void SetStep(HttpContext context, int step, User? user = null, Order? order = null, List<CartProduct>? cartList = null)
        {
            string? sid = GetSID(context, user);
            if (sid == null)
                throw new Exception("CM-Cart is null.");
            using (var redis = new RedisUtil())
            {
                string? data = redis.Get(sid);
                if (data == null)
                    return;
                var o = JsonConvert.DeserializeObject<CartData>(data);
                if (o == null)
                    return;

                o.Step = step;
                if (order != null)
                    o.Order = order;
                if(cartList != null)
                    o.List = cartList;
                redis.Put(sid, JsonConvert.SerializeObject(o), DateTime.UtcNow.AddDays(1));
            }
        }

        public static List<CartProduct> GetList(HttpContext context, User? user = null)
        {
            string? sid = GetSID(context, user);
            if (sid == null)
                throw new Exception("CM-Cart is null.");
            using (var redis = new RedisUtil())
            {
                string? data = redis.Get(sid);
                if (data == null)
                    return new List<CartProduct>();
                try
                {
                    var o = JsonConvert.DeserializeObject<CartData>(data);

                    if (o == null)
                        return new List<CartProduct>();

                    foreach (var i in o.List)
                    {
                        i.UserID = 0;
                    }

                    return o.List;
                }
                catch
                {
                    redis.Delete(sid);
                    return new List<CartProduct>();
                }
            }
        }

        public static void Add(HttpContext context, CartProduct product, User? user = null)
        {
            string? sid = GetSID(context, user);
            if (sid == null)
                throw new Exception("CM-Cart is null.");
            using (var redis = new RedisUtil())
            {
                string? data = redis.Get(sid);
                if (data != null)
                {
                    var o = JsonConvert.DeserializeObject<CartData>(data);
                    if (o != null)
                    {
                        bool found = false;
                        foreach(var i in o.List)
                        {
                            if(i.ProductID == product.ProductID)
                            {
                                i.Quantity++;
                                found = true;
                                break;
                            }
                        }
                        if(!found)
                            o.List.Add(product);
                        redis.Put(sid, JsonConvert.SerializeObject(o), DateTime.UtcNow.AddDays(1));
                        return;
                    }
                }

                var no = new CartData()
                {
                    List = new List<CartProduct>
                    {
                        product
                    }
                };
                redis.Put(sid, JsonConvert.SerializeObject(no), DateTime.UtcNow.AddDays(1));

            }
        }

        public static void Remove(HttpContext context, CartProduct product, User? user = null)
        {
            string? sid = GetSID(context, user);
            if (sid == null)
                throw new Exception("CM-Cart is null.");
            using (var redis = new RedisUtil())
            {
                string? data = redis.Get(sid);
                if (data != null)
                {
                    var o = JsonConvert.DeserializeObject<CartData>(data);
                    if (o != null && o.List != null)
                    {
                        CartProduct? toRemove = null;
                        foreach(var i in o.List)
                        {
                            if(i.ProductID == product.ProductID)
                            {
                                toRemove = i;
                                break;
                            }
                        }
                        if(toRemove != null)
                            o.List.Remove(toRemove);
                        redis.Put(sid, JsonConvert.SerializeObject(o), DateTime.UtcNow.AddDays(1));
                        return;
                    }
                }

            }
        }

        public static void Update(HttpContext context, CartProduct product, User? user = null)
        {
            string? sid = GetSID(context, user);
            if (sid == null)
                throw new Exception("CM-Cart is null.");
            using (var redis = new RedisUtil())
            {
                string? data = redis.Get(sid);
                if (data != null)
                {
                    var o = JsonConvert.DeserializeObject<CartData>(data);
                    if (o != null && o.List != null)
                    {
                        foreach (var i in o.List)
                        {
                            if (i.ProductID == product.ProductID)
                            {
                                o.List[o.List.IndexOf(i)] = product;
                                break;
                            }
                        }
                        redis.Put(sid, JsonConvert.SerializeObject(o), DateTime.UtcNow.AddDays(1));
                        return;
                    }
                }

            }
        }

        public static void Clear(HttpContext context, User? user = null)
        {
            string? sid = GetSID(context, user);
            if (sid == null)
                throw new Exception("CM-Cart is null.");
            using (var redis = new RedisUtil())
            {
                redis.Delete(sid);
            }
        }
    }
}
