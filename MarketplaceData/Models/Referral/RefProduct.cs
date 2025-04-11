/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;

namespace MarketplaceData.Models.Referral
{
    [Table("refproduct")]
    public class RefProduct : MasterModel
    {
        public long ProgramID { get; set; }
        public string? Manufacturer { get; set; }
        public int PanelCount { get; set; }
        public int BatteryCount { get; set; }
        public int KWRate { get; set; }
        public decimal EPCResidential { get; set; }
        public decimal EPCBusiness { get; set; }
        public decimal CashPrice { get; set; }
        public decimal PrePaid { get; set; }
        public decimal LumaPayment { get; set; }
        public int MonthlyProduction { get; set; }

        public static RefProduct? GetForMonthlyProduction(Database db, int monthlyProduction)
        {
            using(var cmd = new NpgsqlCommand(@"SELECT * FROM refproduct WHERE monthlyproduction>=@monthlyproduction ORDER BY monthlyproduction ASC LIMIT 1", db.C))
            {
                cmd.Parameters.AddWithValue("@monthlyproduction", monthlyProduction);
                using(var r = cmd.ExecuteReader())
                {
                    if(r.Read())
                    {
                        var item = new RefProduct();
                        item.Populate(r);
                        return item;
                    }
                }
            }
            using (var cmd = new NpgsqlCommand(@"SELECT * FROM refproduct ORDER BY monthlyproduction DESC LIMIT 1", db.C))
            {
                using (var r = cmd.ExecuteReader())
                {
                    if (r.Read())
                    {
                        var item = new RefProduct();
                        item.Populate(r);
                        return item;
                    }
                }
            }


            return null;
        }
    }
}
