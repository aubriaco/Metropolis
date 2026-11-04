/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace;
using Marketplace.Util.Models;
using MarketplaceUtil.Util;

var builder = WebApplication.CreateBuilder(args);


VersionUtil.Init();
Config.Load();
Config.I.ApplicationID = 4;

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

app.MapFallbackToFile("index.html");

MService.Init();
AuditLog.SetApp("Tasker");

if (app.Environment.IsDevelopment())
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
                resp = await client.GetAsync("https://localhost:3004");
            } while (!resp.IsSuccessStatusCode);
        }
    });
    app.Run("https://0.0.0.0:3004");
}

app.Run("http://0.0.0.0:3004");
