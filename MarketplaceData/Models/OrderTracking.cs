/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Npgsql;
using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models
{
    [Table("ordertracking")]
    public class OrderTracking : MasterModel
    {
        public long OrderID { get; set; }
        public long VendorOrderID { get; set; }
        public long VendorID { get; set; }
        public string? ShippingType { get; set; }
        [ModelLocal]
        public string? Status { get; set; }

        [ModelLocal]
        public bool IsConfirmed { get; set; } = false;
        [ModelLocal]
        public bool IsPackaged { get; set; } = false;
        [ModelLocal]
        public bool IsShipped { get; set; } = false;
        [ModelLocal]
        public bool IsDelivered { get; set; } = false;
        [ModelLocal]
        public string? VendorName { get; set; }

        public static List<OrderTracking> GetListByOrder(Database db, long orderID)
        {
            var list = new List<OrderTracking>();
            using(var cmd = new NpgsqlCommand("SELECT ot.*, v.name AS vendorname, o.status, o.isvendorconfirmed AS isconfirmed, o.ispackaged, o.isdelivered FROM ordertracking ot INNER JOIN _order o LEFT JOIN vendor v ON v.id=o.vendorid ON o.id=ot.vendororderid WHERE ot.orderid=@orderid", db.C))
            {
                cmd.Parameters.AddWithValue("@orderid", orderID);
                using(var r = cmd.ExecuteReader())
                {
                    while(r.Read())
                    {
                        var item = new OrderTracking();
                        item.Populate(r);
                        list.Add(item);
                    }
                }
            }
            return list;
        }
    }
}