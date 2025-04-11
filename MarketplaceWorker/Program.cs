/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 
using CsvHelper;
using MarketplaceData;
using MarketplaceData.Models;
using Marketplace;
using Marketplace.Util;
using System.Globalization;
using Ubriaco.Data;
using MarketplaceWorker.Workers;
using Npgsql;

Config.Load();
Config.I.ApplicationID = -1;
BaseConnection.SetConnectionString(Config.I.ConnectionString);
RedisUtil.Init(Config.I.Redis.Host, Config.I.Redis.Port);
//StorageUtil.Init("google-cloud.json", Config.I.Storage.BucketName);
MailUtil.Init(Config.I.SMTP.Host, Config.I.SMTP.Username, Config.I.SMTP.Password, Config.I.SMTP.Mailer);
Updater.Perform();

Diligence.Perform();

bool g_Running = true;

Console.CancelKeyPress += (object? sender, ConsoleCancelEventArgs e) => {
    g_Running = false;
};

using (var db = new Database())
{
    /*
    using(var cmd = new NpgsqlCommand(@"TRUNCATE TABLE category RESTART IDENTITY", db.C))
    {
        cmd.ExecuteNonQuery();
    }
    */

    using (var file = File.OpenText("data-src/categories.csv"))
    {
        using (var csv = new CsvReader(file, CultureInfo.InvariantCulture))
        {
            if (csv.Read())
            {
                csv.ReadHeader();

                while (csv.Read())
                {
                    var name = csv.GetField("Category");
                    if(string.IsNullOrWhiteSpace(name))
                        continue;
                    var cat = new Category() { Name = name, Path = csv.GetField("Path") };

                    if(string.IsNullOrWhiteSpace(cat.Path))
                        cat.Path = cat.Name;

                    if (!cat.Select(db, "Path"))
                    {
                        cat.ID = cat.Insert(db);
                        Console.WriteLine("Insert Category: " + cat.Name);
                    }

                    var sub = csv.GetField("Sub-Category");

                    if (!string.IsNullOrWhiteSpace(sub))
                    {
                        var sc = new Category() { ParentID = cat.ID, Name = sub };
                        if (!sc.Select(db, "ParentID,Name"))
                        {
                            sc.Insert(db);
                            Console.WriteLine("Insert Sub-Category: " + sc.Name);
                        }

                    }
                }
            }
        }
    }

    DeliveryWorker.Start();
    AuctionWorker.Start();
    WaiterWorker.Start();
    ImageWorker.Start();
    while (g_Running)
    {
        Thread.Sleep(5000);
    }

    DeliveryWorker.Stop();
    AuctionWorker.Stop();
    WaiterWorker.Stop();
    ImageWorker.Stop();
}