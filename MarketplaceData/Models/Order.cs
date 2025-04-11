/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.VisualBasic;
using Npgsql;
using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models
{
    [Table("_order")]
    public class Order : MasterModel
    {
        public class VendorShippingType
        {
            public long VendorID { get; set; }
            public string? ShippingType { get; set; }
            public decimal Amount { get; set; }
        }
        public const int OrderTypeUser = 1;
        public const int OrderTypeVendor = 2;
        
        public string? Ident { get; set; }

        public string? DeliveryUUID { get; set; }

        public long ParentOrderID { get; set; }
        
        public int OrderType { get; set; }
        public long UserID { get; set; }
        public long VendorID { get; set; }
        public string? ShippingType { get; set; }
        [ModelLocal]
        public List<VendorShippingType> VendorShippingTypes { get; set; } = new List<VendorShippingType>();
        [VariableInfo("TEXT")]
        public string? VendorShippingTypesJsonData { get; set; }
        public string? TrackingNumber { get; set; }
        public string? TrackingUrl { get; set; }
        public decimal ShippingAmount { get; set; }
        public bool IsCourierShipping { get; set; } = false;
        public decimal Paid { get; set; }
        public int ProductCount { get; set; }

        public string Status { get; set; } = "New";
        public string StatusHigh { get; set; } = "Pending";

        [VariableInfo("TEXT")]
        public string? DeliveryStatusJsonData { get; set; }

        public bool IsVendorConfirmed { get; set; } = false;
        public DateTime VendorConfirmedDate { get; set; }
        public bool IsVendorCanceled { get; set; } = false;
        public DateTime VendorCanceledDate { get; set; }
        public bool IsPackaged { get; set; } = false;
        public DateTime PackagedDate { get; set; }
        public bool IsPicked { get; set; } = false;
        public DateTime PickedDate { get; set; }
        public bool IsShipped { get; set; } = false;
        public DateTime ShippedDate { get; set; }
        public bool IsDelivered { get; set; } = false;
        public DateTime DeliveredDate { get; set; }
        public DateTime ClientDate { get; set; }

        public long ShippingID { get; set; }
        public long BillingID { get; set; }

        [ModelLocal]
        public Shipping ShippingAddress { get; set; } = new Shipping();
        [ModelLocal]
        public Billing BillingAddress { get; set; } = new Billing();
        [ModelLocal]
        public List<CartProduct> Items { get; set; } = new List<CartProduct>();
        [ModelLocal]
        public List<OrderTracking>? TrackingList { get; set; }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "OrderType,VendorID,Ident", true);
            TryExecuteCommand(db, "UPDATE " + GetDefaultTable() + " SET status='New' WHERE status IS NULL");
            TryExecuteCommand(db, "UPDATE " + GetDefaultTable() + " SET statushigh='Pending' WHERE statushigh IS NULL");
        }

        public void PullChildren(Database db)
        {
            ShippingAddress.ID = ShippingID;
            ShippingAddress.Select(db, "ID");
            BillingAddress.ID = BillingID;
            BillingAddress.Select(db, "ID");
        }

        public void CreateIdent(Database db)
        {
            var dtt = new OrderIdentTracking() { DT = DateTime.UtcNow.ToString("yyyyMMdd") };
            if(!dtt.Select(db, "DT"))
                dtt.SeqID = 0;
            Ident = dtt.DT + (dtt.SeqID + 1).ToString().PadLeft(6, '0');
            dtt.SeqID++;
            if(dtt.ID == 0)
                dtt.Insert(db);
            else
                dtt.Update(db, "SeqID");
        }

        public void UpdateAll(Database db, string q)
        {
            if(string.IsNullOrEmpty(Ident))
                throw new Exception("Ident is null or empty.");
            var type = this.GetType();
            var p = q.Split(',');
            var update = "";
            foreach(var i in p)
            {
                if(update.Length > 0)
                    update += ", ";
                update += i.ToLower() + "=@" + i.ToLower();
            }
            using(var cmd = new NpgsqlCommand(@"UPDATE " + GetDefaultTable() + " SET " + update + " WHERE ident=@ident", db.C))
            {
                cmd.Parameters.AddWithValue("@ident", Ident);
                foreach(var i in p)
                {
                    var prop = type.GetProperty(i);
                    if(prop == null)
                        throw new Exception("Property '" + i + "' not found.");
                    cmd.Parameters.AddWithValue("@" + i.ToLower(), prop.GetValue(this));
                }
                cmd.ExecuteNonQuery();
            }
        }

        public VendorShippingType? GetVendorShippingType(long vendorID)
        {
            var st = VendorShippingTypes.Find(a => a.VendorID == vendorID);
            return st;
        }


        public class OrdersByDayChartData
        {
            public string dt { get; set; } = "";
            public long pendingCount { get; set; }
            public long processedCount { get; set; }
            public long confirmedCount { get; set; }
        }

        public static List<OrdersByDayChartData> GetOrdersByDay(Database db, long vendorID, DateTime startDate)
        {
            var list = new List<OrdersByDayChartData>();
            using(var cmd = new NpgsqlCommand("SELECT TO_CHAR(createddate, 'YYYY-MM-DD') AS dt, SUM(CASE WHEN ispackaged=false THEN 1 ELSE 0 END) AS pendingCount, SUM(CASE WHEN ispackaged=true THEN 1 ELSE 0 END) AS processedCount, SUM(CASE WHEN isdelivered=true THEN 1 ELSE 0 END) AS confirmedCount FROM _order WHERE vendorid=@vendorid AND createddate>=@startdate GROUP BY TO_CHAR(createddate, 'YYYY-MM-DD') ORDER BY TO_CHAR(createddate, 'YYYY-MM-DD') ASC", db.C))
            {
                cmd.Parameters.AddWithValue("@vendorid", vendorID);
                cmd.Parameters.AddWithValue("@startdate", startDate);
                using(var r = cmd.ExecuteReader())
                {
                    while(r.Read())
                    {
                        var item = new OrdersByDayChartData()
                        {
                            dt = DateTime.Parse(r["dt"].ToString()).ToString("MM/dd"),
                            pendingCount = Convert.ToInt64(r["pendingCount"]),
                            processedCount = Convert.ToInt64(r["processedCount"]),
                            confirmedCount = Convert.ToInt64(r["confirmedCount"])
                        };
                        list.Add(item);
                    }
                }
            }
            for(var dt = startDate; dt <= DateTime.UtcNow; dt = dt.AddDays(1))
            {
                var key = dt.ToString("yyyy-MM-dd");
                if(list.FindIndex(a => a.dt == key) < 0)
                {
                    var item = new OrdersByDayChartData()
                    {
                        dt = DateTime.Parse(key).ToString("MM/dd"),
                    };
                    list.Add(item);
                }
            }
            list.Sort((a,b) => a.dt.CompareTo(b.dt));
            return list;
        }

        public static List<Order> GetInTransitDelivery(Database db)
        {
            var list = new List<Order>();
            using(var cmd = new NpgsqlCommand(@"SELECT * FROM _order WHERE ordertype=@ordertype AND ispackaged=true AND isdelivered=false", db.C))
            {
                cmd.Parameters.AddWithValue("@ordertype", Order.OrderTypeVendor);
                using(var r = cmd.ExecuteReader())
                {
                    while(r.Read())
                    {
                        var item = new Order();
                        item.Populate(r);
                        list.Add(item);
                    }
                }
            }
            return list;
        }

    }
}
