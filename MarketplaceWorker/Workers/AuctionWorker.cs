/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace;
using Marketplace.Util;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.Auction;
using MarketplaceUtil.Util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MarketplaceWorker.Workers
{
    internal static class AuctionWorker
    {
        private static bool Running = true;
        private static bool Stopped = false;
        private static Thread? T;

        private static List<Vehicle> Vehicles = new List<Vehicle>();
        private static List<Appliance> Appliances = new List<Appliance>();

        public static void Start()
        {
            T = new Thread(Run);
            T.IsBackground = true;
            T.Start();
        }

        public static void Stop()
        {
            Running = false;
        }

        private static async void Run()
        {
            var n = 0;
            while (Running)
            {
                if (n == 0)
                    GetAuctionsToTrack();
                await ScanVehicles();
                await ScanAppliances();
                NotifyUtil.ProcessQueue();
                Thread.Sleep(5000);
                n++;
                if (n == 10)
                    n = 0;
            }
            Stopped = true;
        }

        private static void GetAuctionsToTrack()
        {
            Vehicles.Clear();
            using (var db = new Database())
            {
                Vehicles = new Vehicle() { Started = true, Ended = false }.List<Vehicle>(db, "Started,Ended");
                Appliances = new Appliance() { Started = true, Ended = false }.List<Appliance>(db, "Started,Ended");
            }
            Console.WriteLine("Tracking " + Vehicles.Count + " vehicles.");
            Console.WriteLine("Tracking " + Vehicles.Count + " appliances.");
        }

        private static async Task<int> ScanVehicles()
        {
            using (var db = new Database())
            {
                foreach (var item in Vehicles)
                {
                    if (item.Ended || item.Paused)
                        continue;
                    Console.WriteLine("Vehicle: Check: " + item.ID);
                    if (item.EndDate <= DateTime.UtcNow)
                    {
                        if (!item.ReservePriceEnabled || item.CurrentBid >= item.ReservePrice)
                        {
                            if (item.CurrentBidUserID != 0 && item.CurrentBid > 0 && item.CurrentBidPaymentID != 0)
                            {
                                var payment = new Payment() { ID = item.CurrentBidPaymentID };
                                if (payment.Select(db, "ID"))
                                {
                                    if (!string.IsNullOrEmpty(payment.ChargeID))
                                    {
                                        var util = PaymentUtil.GetUtil(Config.I.PaymentIntegration);

                                        try
                                        {
                                            var r = await util.CaptureCharge(payment);

                                            if (r != null)
                                            {
                                                payment.Update(db, "Captured,CapturedDate");

                                                item.PurchaseCode = Guid.NewGuid().ToString();
                                                item.Update(db, "PurchaseCode");

                                                var user = new User() { ID = item.CurrentBidUserID };
                                                if (user.Select(db, "ID"))
                                                    MailUtil.SendAuctionWinVehicle(item, user);
                                                var seller = new User() { ID = item.CreatedByUserID };
                                                if (seller.Select(db, "ID"))
                                                    MailUtil.SendAuctionWinVehicleSeller(item, user, seller);
                                            }
                                            else
                                                throw new Exception("Failed to caputre charge.");
                                        }
                                        catch(Exception ex)
                                        {
                                            item.Errored = true;
                                            item.LastError = ex.Message;
                                            item.Update(db, "Errored,LastError");
                                            Console.WriteLine("Error: " + ex.Message);
                                        }
                                    }
                                }
                            }
                        }
                        else
                        {
                            try
                            {
                                await PaymentUtil.CancelPendingBids(db, item.Type, item);
                                var user = new User() { ID = item.CurrentBidUserID };
                                if (user.Select(db, "ID"))
                                    MailUtil.SendReserveNotMet(item, user);
                                user = new User() { ID = item.CreatedByUserID };
                                if (user.Select(db, "ID"))
                                    MailUtil.SendReserveNotMetSeller(item, user);
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine("Error: " + ex.Message);
                            }
                        }
                        item.Ended = true;
                        item.Update(db, "Ended");
                        Console.WriteLine("Set " + item.ID + " to ended.");
                    }
                }
            }
            return 0;
        }

        private static async Task<int> ScanAppliances()
        {
            using (var db = new Database())
            {
                foreach (var item in Appliances)
                {
                    if (item.Ended || item.Paused)
                        continue;
                    Console.WriteLine("Appliance: Check: " + item.ID);
                    if (item.EndDate <= DateTime.UtcNow)
                    {
                        if (!item.ReservePriceEnabled || item.CurrentBid >= item.ReservePrice)
                        {
                            if (item.CurrentBidUserID != 0 && item.CurrentBid > 0 && item.CurrentBidPaymentID != 0)
                            {
                                var payment = new Payment() { ID = item.CurrentBidPaymentID };
                                if (payment.Select(db, "ID"))
                                {
                                    if (!string.IsNullOrEmpty(payment.ChargeID))
                                    {
                                        var util = PaymentUtil.GetUtil(Config.I.PaymentIntegration);

                                        var fullPayment = new Payment()
                                        {
                                            ItemType = item.Type,
                                            ItemID = item.ID,
                                            BidAmount = payment.BidAmount,
                                            ChargeAmount = payment.BidAmount,
                                            UserID = payment.UserID
                                        };

                                        try
                                        {
                                            var r = await util.CaptureCharge(payment);

                                            if (r != null)
                                            {
                                                payment.Update(db, "Captured,CapturedDate");

                                                item.PurchaseCode = Guid.NewGuid().ToString();
                                                item.Update(db, "PurchaseCode");

                                            }
                                            else
                                                throw new Exception("Failed to caputre charge.");

                                            /*
                                            var uc = new UserCustomer() { UserID = payment.UserID };
                                            if (!uc.Select(db, "UserID"))
                                                throw new Exception("Customer for this user not found.");


                                            var pm = new PaymentMethod() { ID = payment.PaymentMethodID };

                                            if (!pm.Select(db, "ID"))
                                                throw new Exception("Could not find payment method.");

                                            fullPayment.ID = fullPayment.Insert(db);

                                            var r = await util.CreateCharge(pm, fullPayment, uc);

                                            if (r == null)
                                                throw new Exception("Error creating charge.");
                                            fullPayment.Confirmed = true;
                                            fullPayment.Update(db, "Confirmed,ChargeID");

                                            var r2 = await util.CaptureCharge(fullPayment);
                                            if (r2 == null)
                                                throw new Exception("Error capturing charge.");

                                            fullPayment.Update(db, "Captured,CapturedDate");
                                            */
                                        }
                                        catch (Exception ex)
                                        {
                                            fullPayment.Rejected = true;
                                            fullPayment.LastError = ex.Message;
                                            fullPayment.Update(db, "Rejected,");
                                            item.Errored = true;
                                            item.LastError = ex.Message;
                                            item.Update(db, "Errored,LastError");
                                            Console.WriteLine("Error: " + ex.Message);
                                            continue;
                                        }

                                        try
                                        {
                                            var r = await PaymentUtil.CancelPendingBids(db, item.Type, item);
                                        }
                                        catch (Exception ex)
                                        {
                                            item.Errored = true;
                                            item.LastError = ex.Message;
                                            item.Update(db, "Errored,LastError");
                                            Console.WriteLine("Error: " + ex.Message);
                                        }

                                        item.PurchaseCode = Guid.NewGuid().ToString();
                                        item.Update(db, "PurchaseCode");

                                        var user = new User() { ID = item.CurrentBidUserID };
                                        var seller = new User() { ID = item.CreatedByUserID };
                                        if (user.Select(db, "ID") && seller.Select(db, "ID"))
                                        {
                                            var pendingBalance = item.CurrentBid - payment.ChargeAmount;
                                            MailUtil.SendAuctionWinAppliance(item, user, seller, pendingBalance, payment.ChargeAmount);
                                            MailUtil.SendAuctionWinApplianceSeller(item, user, seller, pendingBalance, payment.ChargeAmount);
                                        }
                                    }
                                }
                            }
                            else
                            {
                                // todo: replace with no bid email
                                var user = new User() { ID = item.CurrentBidUserID };

                                if (user.Select(db, "ID"))
                                    MailUtil.SendReserveNotMet(item, user);
                                user = new User() { ID = item.CreatedByUserID };
                                if (user.Select(db, "ID"))
                                    MailUtil.SendReserveNotMetSeller(item, user);
                            }
                        }
                        else
                        {
                            try
                            {
                                await PaymentUtil.CancelPendingBids(db, item.Type, item);
                                var user = new User() { ID = item.CurrentBidUserID };

                                if (user.Select(db, "ID"))
                                    MailUtil.SendReserveNotMet(item, user);
                                user = new User() { ID = item.CreatedByUserID };
                                if (user.Select(db, "ID"))
                                    MailUtil.SendReserveNotMetSeller(item, user);
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine("Error: " + ex.Message);
                            }
                        }
                        item.Ended = true;
                        item.Update(db, "Ended");
                        Console.WriteLine("Set " + item.ID + " to ended.");
                    }
                }
            }
            return 0;
        }

    }
}
