/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceUtil.Util;

namespace MarketplaceWorker.Workers
{
    internal static class DeliveryWorker
    {
        private static bool Running = true;
        private static bool Stopped = false;
        private static Thread? T;

        private static List<Order> MonitoredOrders { get; set; } = new List<Order>();

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
            int n = 0;
            while (Running)
            {
                if(n == 0)
                    GetOrdersToMonitor();
                _ = await PerformTasks();
                Thread.Sleep(5000);
                n++;
                if(n == 15)
                    n = 0;
            }
            Stopped = true;
        }

        public static void GetOrdersToMonitor()
        {
            using(var db = new Database())
            {
                MonitoredOrders = Order.GetInTransitDelivery(db);
                Console.WriteLine("Monitoring " + MonitoredOrders.Count + " orders.");
            }
        }

        public static async Task<bool> PerformTasks()
        {
            using(var db = new Database())
            {
                foreach(var order in MonitoredOrders)
                {
                    if(order.IsDelivered || string.IsNullOrEmpty(order.ShippingType))
                        continue;
                    try
                    {
                        Console.WriteLine("Track: " + order.Ident);
                        var dutil = DeliveryUtil.GetUtil(order.ShippingType);
                        await dutil.Track(order);
                        if(order.IsDelivered)
                            order.Update(db, "DeliveryStatusJsonData,Status,StatusHigh,IsDelivered,DeliveredDate");
                        else
                            order.Update(db, "DeliveryStatusJsonData,Status,StatusHigh");
                    }
                    catch(Exception ex)
                    {
                        Console.WriteLine("DeliveryWorker: PerformTasks: Exception: " + ex.Message);
                    }
                }
            }
            return true;
        }
    }
}