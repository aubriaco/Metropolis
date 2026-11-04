/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

using MarketplaceData;
using Marketplace;
using Marketplace.Util;
using System.Net;
using Ubriaco.Data;
using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddMvc();


VersionUtil.Init();
Config.Load();
Config.I.ApplicationID = 0;

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
    app.UseExceptionHandler("/Error");
}
app.UseDefaultFiles();

app.UseStaticFiles(new StaticFileOptions()
{
    OnPrepareResponse = context =>
    {
        context.Context.Response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
        context.Context.Response.Headers.Add("Expires", "-1");
    }
});


app.UseRouting();
app.UseEndpoints(endpoints => endpoints.MapControllers());


MService.Init();

//ContentUtil.SquishHTMLFiles("./", "wwwroot", false);
//ContentUtil.SquishHTMLFiles("views-src", "wwwroot/views");
//ContentUtil.SquishJSFiles("js-src", "wwwroot/js");

if (!Directory.Exists("tmp"))
    Directory.CreateDirectory("tmp");



#pragma warning disable
app.Use(async (context, next) =>
{
    await Loader.Render(context);
    return;
    await next(context);
});
#pragma warning restore

if (Config.I.Ident.ToLower() != "prod")
{
    using (var cmd = new Process())
    {
        _ = Task.Run(() =>
        {
            cmd.StartInfo.FileName = "cmd.exe";
            cmd.StartInfo.RedirectStandardInput = true;
            cmd.StartInfo.RedirectStandardOutput = false;
            cmd.StartInfo.CreateNoWindow = false;
            cmd.StartInfo.UseShellExecute = false;
            cmd.Start();

            cmd.StandardInput.WriteLine("cd react-src");
            cmd.StandardInput.WriteLine("npm start");
            cmd.StandardInput.Flush();
            cmd.WaitForExit();
            Console.WriteLine(cmd.StandardOutput.ReadToEnd());
        });

        var cleanupCallback = () =>
        {
            Console.WriteLine("Cleanup...");
            cmd.StandardInput.Write("\x13");
            cmd.StandardInput.Flush();
            cmd.StandardInput.Close();
            cmd.Kill();
        };

        Console.CancelKeyPress += new ConsoleCancelEventHandler((object? sender, ConsoleCancelEventArgs args) =>
        {
            cleanupCallback();
        });
        app.Run("https://0.0.0.0:8080");
    }
}
else
    app.Run("http://0.0.0.0:9990");
