/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using CsvHelper;
using MarketplaceData;
using MarketplaceData.Models.Auction;
using MarketplaceData.Models.Referral;
using Newtonsoft.Json;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MarketplaceWorker.Workers
{
    public static class Diligence
    {
        public static void Perform()
        {
            using (var db = new Database())
            {


                var vehicles = new List<Vehicle>();
                using (var cmd = new NpgsqlCommand(@"SELECT v.* FROM vehicle v LEFT JOIN auctionwrap w ON w.vehicleid=v.id WHERE w.ID IS NULL", db.C))
                {
                    using (var r = cmd.ExecuteReader())
                    {
                        while (r.Read())
                        {
                            var item = new Vehicle();
                            item.Populate(r);
                            vehicles.Add(item);
                        }
                    }
                }

                foreach (var i in vehicles)
                {
                    try
                    {
                        var item = new AuctionWrap() { Name = i.Year + " " + (i.Make ?? "") + " " + (i.Model ?? ""), VehicleID = i.ID, CreatedByUserID = i.CreatedByUserID };
                        item.ID = item.Insert(db);
                        i.AuctionWrapID = item.ID;
                        i.Update(db, "AuctionWrapID");
                        Console.WriteLine("Created wrap from vehicle: " + i.ID);
                    }
                    catch(Exception ex)
                    {
                        Console.WriteLine("Error: " + ex.Message);
                    }
                }

                var appliances = new List<Appliance>();
                using (var cmd = new NpgsqlCommand(@"SELECT v.* FROM appliance v LEFT JOIN auctionwrap w ON w.applianceid=v.id WHERE w.ID IS NULL", db.C))
                {
                    using (var r = cmd.ExecuteReader())
                    {
                        while (r.Read())
                        {
                            var item = new Appliance();
                            item.Populate(r);
                            appliances.Add(item);
                        }
                    }
                }

                foreach (var i in appliances)
                {
                    try
                    {
                        var item = new AuctionWrap() { Name = i.Name, ApplianceID = i.ID, CreatedByUserID = i.CreatedByUserID };
                        item.ID = item.Insert(db);
                        i.AuctionWrapID = item.ID;
                        i.Update(db, "AuctionWrapID");
                        Console.WriteLine("Created wrap from appliance: " + i.ID);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error: " + ex.Message);
                    }
                }

                try
                {
                    using (var sr = File.OpenText("const/referral-products.csv"))
                    {
                        using (var csv = new CsvReader(sr, CultureInfo.InvariantCulture))
                        {
                            if (csv.Read())
                            {
                                csv.ReadHeader();
                                while (csv.Read())
                                {
                                    var item = new RefProduct();
                                    item.ProgramID = Convert.ToInt64(csv.GetField("ProgramID"));
                                    item.Manufacturer = csv.GetField("Manufacturer");
                                    item.PanelCount = Convert.ToInt32(csv.GetField("PanelCount"));
                                    item.BatteryCount = Convert.ToInt32(csv.GetField("BatteryCount"));
                                    item.KWRate = Convert.ToInt32(csv.GetField("KWRate"));
                                    item.EPCResidential = Convert.ToDecimal(csv.GetField("EPCResidential"));
                                    item.EPCBusiness = Convert.ToDecimal(csv.GetField("EPCBusiness"));
                                    item.CashPrice = Convert.ToDecimal(csv.GetField("CashPrice"));
                                    item.PrePaid = Convert.ToDecimal(csv.GetField("PrePaid"));
                                    item.LumaPayment = Convert.ToDecimal(csv.GetField("LumaPayment"));
                                    item.MonthlyProduction = Convert.ToInt32(csv.GetField("MonthlyProduction"));
                                    if (!item.Select(db, "Manufacturer,PanelCount,BatteryCount"))
                                    {
                                        item.ID = item.Insert(db);
                                        Console.WriteLine("Inserted RefProduct: " + item.ID);
                                    }
                                }
                            }
                        }
                    }
                }
                catch(Exception ex)
                {
                    Console.WriteLine("Failed to load referral-products.csv: " + ex.Message);
                }
            }
        }
    }
}
