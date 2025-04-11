/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace;
using Marketplace.Util;
using MarketplaceData;
using MarketplaceData.Models;
using Newtonsoft.Json;

namespace MarketplaceWorker.Workers
{
    internal static class ImageWorker
    {
        private static bool Running = true;
        private static bool Stopped = false;
        private static Thread? T;

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
            while (Running)
            {
                _ = await PerformTasks();
                Thread.Sleep(5000);
            }
            Stopped = true;
        }

        public static async Task<bool> PerformTasks()
        {
            using (var redis = new RedisUtil())
            {
                string? data;
                while (!string.IsNullOrEmpty(data = redis.Pop(Config.ImageInputQueue)))
                {
                    StorageItem? item = JsonConvert.DeserializeObject<StorageItem>(data);
                    if (item == null)
                        continue;
                    if (string.IsNullOrWhiteSpace(item.InputUrl))
                        continue;


                    try
                    {
                        using (var db = new Database())
                        {
                            Console.WriteLine("Processing Image: " + item.InputUrl);
                            var upload = await StorageUtil.PutFromURL(item.InputUrl, Guid.NewGuid().ToString(), true, 0);
                            if (upload == null)
                                continue;

                            var pi = new ProductImage()
                            {
                                ProductID = item.ProductID,
                                StorageItemID = upload.ID,
                                OrderIndex = item.OrderIndex
                            };
                            pi.Insert(db);
                            Console.WriteLine("Insert Product Image: " + pi.ID);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error: " + ex.Message);
                    }
                }
            }
            return true;
        }


    }
}