/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 // Shop
using Marketplace;
using Marketplace.Models;
using Marketplace.Util;

var builder = WebApplication.CreateBuilder(args);


VersionUtil.Init();
Config.Load();
Config.I.ApplicationID = 6;

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
    ImageURL = Config.I.AppUrl + "/img/og-image.png"
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
        
        //await ctx.Response.WriteAsync(content);
        //return;
    }
    await ctx.Response.WriteAsync(indexContent);
});

MService.Init();
TwilioUtil.Init(Config.I.Comm.Twilio.ApiKey, Config.I.Comm.Twilio.ApiSecret, Config.I.Comm.Twilio.Phones[0]);


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
                resp = await client.GetAsync("https://localhost:3006");
            } while (!resp.IsSuccessStatusCode);
        }
    });
    app.Run("https://0.0.0.0:3006");
}

app.Run("http://0.0.0.0:3006");
