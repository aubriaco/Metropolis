/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Util;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.WaiterNet;
using MarketplaceUtil.Util;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MarketplaceWorker.Workers
{
    internal static class WaiterWorker
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
                while(!string.IsNullOrEmpty(data = redis.Pop("waiter-tasks")))
                {
                    var taskInfo = JsonConvert.DeserializeObject<WaiterTask>(data);
                    if (taskInfo == null)
                        continue;

                    if (taskInfo.TaskType == WaiterTaskType.Integration)
                    {
                        Console.WriteLine("WaiterWorker: Task: Integration.");
                        if (taskInfo.Integration != null)
                            _ = await ImportInventory(taskInfo);
                    }
                    else if(taskInfo.TaskType == WaiterTaskType.Order)
                    {
                        Console.WriteLine("WaiterWorker: Task: Order.");
                        if (taskInfo.Integration != null)
                            _ = await ImportOrder(taskInfo);
                    }
                }
            }
            return true;
        }

        public static async Task<bool> ImportInventory(WaiterTask taskInfo)
        {
            var vi = taskInfo.Integration;
            if (vi == null)
                return false;
            using (var db = new Database())
            {
                var integration = new CloverIntegration(vi);
                try
                {
                    var categories = await integration.GetCategories();

                    foreach (var category in categories)
                    {
                        try
                        {
                            category.VendorID = vi.VendorID;
                            if (!category.Select(db, "VendorID,ExternalID"))
                            {
                                var exists = new MenuCategory() { Name = category.Name, VendorID = vi.VendorID };
                                if (exists.Select(db, "VendorID,Ident"))
                                {
                                    exists.ExternalID = category.ExternalID;
                                    exists.Update(db, "ExternalID");
                                    Console.WriteLine("ImportInventory: Updated Category: ID: " + exists.ID + " ExternalID: " + exists.ExternalID);
                                }
                                else
                                {
                                    category.VendorID = vi.VendorID;
                                    category.ID = category.Insert(db);
                                    Console.WriteLine("ImportInventory: Inserted Category: ID: " + category.ID + " ExternalID: " + category.ExternalID);
                                }
                            }
                            else
                                Console.WriteLine("ImportInventory: Category Exists: ID: " + category.ID + " ExternalID: " + category.ExternalID);
                            var items = await integration.GetItemsByCategory(category);
                            foreach (var item in items)
                            {
                                item.VendorID = vi.VendorID;
                                item.CategoryID = category.ID;
                                if (item.SelectID(db, "VendorID,CategoryID,ExternalID"))
                                {
                                    Console.WriteLine("ImportInventory: Menu Item Exists: ID: " + item.ID + " ExternalID: " + item.ExternalID);
                                    continue;
                                }

                                var exists = new MenuItem() { Name = item.Name, CategoryID = category.ID, VendorID = vi.VendorID };
                                if (exists.Select(db, "VendorID,CategoryID,Ident"))
                                {
                                    exists.ExternalID = item.ExternalID;
                                    exists.Update(db, "ExternalID");
                                    Console.WriteLine("ImportInventory: Updated Menu Item: ID: " + item.ID + " ExternalID: " + item.ExternalID);
                                }
                                else
                                {
                                    item.VendorID = vi.VendorID;
                                    item.CategoryID = category.ID;
                                    item.ID = item.Insert(db);
                                    Console.WriteLine("ImportInventory: Inserted Menu Item: ID: " + item.ID + " ExternalID: " + item.ExternalID);
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("ImportInventory: Failed to pull items from category: " + category.Name + ": " + ex.Message);
                        }
                    }
                }
                catch(Exception ex)
                {
                    Console.WriteLine("ImportInventory: Failed to pull categories: " + ex.Message);
                }
                new UserNotification() { UserID = taskInfo.UserID, TaskID = taskInfo.TaskID, Message = "Clover inventory import completed." }.Insert(db);
            }
            return true;
        }

        public static async Task<bool> ImportOrder(WaiterTask taskInfo)
        {
            if (taskInfo.Integration == null || taskInfo.Order == null || taskInfo.Integration.VendorID != taskInfo.Order.VendorID)
                return false;

            try
            {
                var integration = new CloverIntegration(taskInfo.Integration);
                _ = await integration.CreateOrder(taskInfo.Order);
                using (var db = new Database())
                {
                    taskInfo.Order.Update(db, "ExternalID");
                }
                Console.WriteLine("ImportOrder: OK");
                return true;
            }
            catch(Exception ex)
            {
                Console.WriteLine("ImportOrder: Failed to import order: " + ex.Message);
            }
            return false;
        }
    }
}
