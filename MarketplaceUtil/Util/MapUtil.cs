/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Util;
using MarketplaceData.Models;
using Newtonsoft.Json;
using SkiaSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MarketplaceUtil.Util
{
    public class MapUtil
    {
        private static string? APIKey { get; set; }

        public static void Init(string apiKey)
        {
            APIKey = apiKey;
        }

        public static async Task<Address?> GetAddress(double latitude, double longitude)
        {            
            if (APIKey == null)
                throw new Exception("MapUtil: Not initialized.");
            try
            {
                using (var client = new HttpClient())
                {
                    var resp = await client.GetAsync("https://maps.googleapis.com/maps/api/geocode/json?key=" + APIKey + "&latlng=" + latitude + "," + longitude);
                    var body = await resp.Content.ReadAsStringAsync();

                    if (resp.IsSuccessStatusCode)
                    {
                        dynamic? json = JsonConvert.DeserializeObject(body);
                        if (json != null)
                        {
                            var address = new Address();
                            address.Line1 = "";
                            if (json.results.Count > 0)
                            {
                                var first = json.results[0];
                                foreach (var i in first.address_components)
                                {
                                    var types = (List<string>)i.types;
                                    if (types.Contains("postal_code"))
                                        address.PostalCode = (string)i.long_name;
                                    if (types.Contains("country"))
                                        address.Country = (string)i.long_name;
                                    if (types.Contains("administrative_area_level_1"))
                                        address.State = (string)i.long_name;
                                    //if (types.Contains("administrative_area_level_2"))
                                    //address.City = (string)i.long_name;
                                    if (types.Contains("sublocality"))
                                        address.City += (string)i.long_name;
                                    if (types.Contains("street_number"))
                                        address.Line1 += (string)i.long_name;
                                    if (types.Contains("route"))
                                        address.Line1 += (string)i.long_name;
                                    if (types.Contains("neighborhood"))
                                        address.Line1 += (string)i.long_name;
                                }
                                return address;
                            }
                        }
                    }
                    else
                        Console.WriteLine("MapUtil: GetAddress: Error: " + body);
                }
            }
            catch(Exception ex)
            {
                Console.WriteLine("MapUtil: GetAddress: Exception: " + ex.Message);
            }
            return null;
        }

        public static async Task<byte[]?> GetImage(string location)
        {
            if (APIKey == null)
                throw new Exception("MapUtil: Not initialized.");
            
            using(var client = new HttpClient())
            {
                var resp = await client.GetAsync("https://maps.googleapis.com/maps/api/staticmap?key=" + APIKey + "&size=600x400&maptype=roadmap&format=png&zoom=12&center=" + location);
                if (resp.IsSuccessStatusCode)
                {
                    using (var ms = new MemoryStream())
                    {
                        await resp.Content.CopyToAsync(ms);
                        return ms.ToArray();
                    }
                }
                else
                    return null;
            }
        }

        public static async Task<StorageItem?> GetCircledImage(string postalCode)
        {
            try
            {
                var data = await MapUtil.GetImage("PR+" + postalCode);
                if (data != null)
                {
                    using (var img = SKImage.FromEncodedData(data))
                    {
                        if (img != null)
                        {
                            using (var bmp = SKBitmap.FromImage(img))
                            {
                                if (bmp != null)
                                {
                                    using (var surface = SKSurface.Create(new SKImageInfo()
                                    {
                                        Width = bmp.Width,
                                        Height = bmp.Height,
                                        ColorType = SKColorType.Rgba8888,
                                        AlphaType = SKAlphaType.Premul
                                    }))
                                    {
                                        SKPaint paint = new SKPaint
                                        {
                                            Style = SKPaintStyle.Stroke,
                                            Color = SKColor.Parse("0000ff"),
                                            StrokeWidth = 1
                                        };

                                        surface.Canvas.DrawImage(img, new SKPoint(0, 0));
                                        surface.Canvas.DrawCircle(new SKPoint(bmp.Width / 2f, bmp.Height / 2f), bmp.Height * 0.4f, paint);
                                        surface.Canvas.Save();

                                        using (var dst = surface.Snapshot())
                                        {

                                            using (var dstdata = dst.Encode(SKEncodedImageFormat.Jpeg, 80))
                                            {
                                                using (var ms = new MemoryStream(dstdata.ToArray()))
                                                {
                                                    var si = StorageUtil.Put(ms, Guid.NewGuid().ToString(), "image/jpeg", "map.jpg");
                                                    return si;
                                                }
                                            }
                                        }

                                    }
                                }
                                else
                                    Console.WriteLine("MapImg: Failed to load bitmap.");
                            }
                        }
                        else
                            Console.WriteLine("MapImg: Failed to load image.");
                    }
                }
                else
                    Console.WriteLine("MapImg: Data is null.");
            }
            catch (Exception ex)
            {
                Console.WriteLine("MapImg: Error: " + ex.Message);
            }
            return null;
        }

    }
}
