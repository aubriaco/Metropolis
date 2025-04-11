/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace;
using Marketplace.Models;
using Marketplace.Util.Models;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.Auction;
using MarketplaceUtil.Util;

var builder = WebApplication.CreateBuilder(args);


VersionUtil.Init();
Config.Load();
Config.I.ApplicationID = 1;
// Add services to the container.
builder.Services.AddMvc();

var app = builder.Build();

var origins = new List<string>();
origins.Add(Config.I.AppUrl ?? Config.I.BaseUrl);
Console.WriteLine("Origin: " + (Config.I.AppUrl ?? Config.I.BaseUrl));
if (Config.I.AdditionalAppUrls != null)
{
    foreach (var i in Config.I.AdditionalAppUrls)
    {
        Console.WriteLine("Additional origin: " + i);
        origins.Add(i);
    }
}


app.UseCors(builder =>
      builder.WithOrigins(origins.ToArray())
             .AllowAnyHeader()
             .AllowAnyMethod()
             .AllowCredentials());

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}



app.UseStaticFiles();
app.UseRouting();

app.UseEndpoints(endpoints => endpoints.MapControllers());

string? indexSource;

if (app.Environment.IsDevelopment())
    indexSource = File.ReadAllText("ClientApp/public/index.html");
else
    indexSource = File.ReadAllText("wwwroot/index.html");


var headerValues = new HeaderValues() { 
    Title = Config.I.AppName, 
    Description = Config.I.AppDescription, 
    ImageURL = Config.I.AuctionAppUrl + "/img/og-image2.png?v=2"
};
var indexContent = headerValues.ReplaceIn(indexSource);


app.MapFallback(async ctx =>
{
    ctx.Response.ContentType = "text/html";
    var path = ctx.Request.Path.Value;
    if (path != null)
    {
        var hvalues = new HeaderValues();
        hvalues.Title = headerValues.Title;
        hvalues.Description = headerValues.Description;
        hvalues.ImageURL = headerValues.ImageURL;
        if (path.StartsWith("/auction/vehicle/"))
        {
            using (var db = new Database())
            {
                var idStr = path.Substring(17);
                var id = Convert.ToInt64(idStr);
                var item = new Vehicle() { ID = id };
                if (item.Select(db, "ID"))
                {
                    hvalues.Title = item.Year + " " + item.Make + " " + item.Model + " - " + Config.I.AppName;
                    var asi = new VehicleStorageItem() { ID = item.DisplayPhotoStorageItemID };
                    if (asi.Select(db, "ID"))
                    {
                        var si = new StorageItem() { ID = asi.StorageItemID };
                        if (si.Select(db, "ID"))
                            hvalues.ImageURL = Config.I.AuctionAppUrl + si.ThumbUrl;
                    }
                    var content = hvalues.ReplaceIn(indexSource);
                    await ctx.Response.WriteAsync(content);
                    return;
                }
            }
        }
        else if(path.StartsWith("/auction/article/"))
        {
            using (var db = new Database())
            {
                var idStr = path.Substring(17);
                var id = Convert.ToInt64(idStr);
                var item = new Appliance() { ID = id };
                if (item.Select(db, "ID"))
                {
                    hvalues.Title = item.Name + " - " + Config.I.AppName;
                    hvalues.Description = item.Description;
                    var asi = new ApplianceStorageItem() { ID = item.DisplayPhotoStorageItemID };
                    if (asi.Select(db, "ID"))
                    {
                        var si = new StorageItem() { ID = asi.StorageItemID };
                        if(si.Select(db, "ID"))
                            hvalues.ImageURL = Config.I.AuctionAppUrl + si.ThumbUrl;
                    }
                    var content = hvalues.ReplaceIn(indexSource);
                    await ctx.Response.WriteAsync(content);
                    return;
                }
            }
        }
    }
    await ctx.Response.WriteAsync(indexContent);
});


MService.Init();
if(Config.I.Maps != null && Config.I.Maps.APIKey != null)
    MapUtil.Init(Config.I.Maps.APIKey);
AuditLog.SetApp("Auction");

if(app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    _ = Task.Run(async () =>
    {
        using (var client = new HttpClient())
        {
            HttpResponseMessage resp;
            do
            {
                Thread.Sleep(1000);
                Console.WriteLine("Requesting to initialize...");
                resp = await client.GetAsync("https://localhost:3001");
            } while (!resp.IsSuccessStatusCode);
        }
    });
    app.Run("https://0.0.0.0:3001");
}

app.Run("http://0.0.0.0:3001");
