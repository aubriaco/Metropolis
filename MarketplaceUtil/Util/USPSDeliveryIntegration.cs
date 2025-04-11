/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System.Text.RegularExpressions;
using System.Xml.Linq;
using MarketplaceData.Models;
using Newtonsoft.Json;

namespace MarketplaceUtil.Util
{
    public class USPSDeliveryIntegration : DeliveryUtil
    {
        private class _CONFIG
        {
            public string userid { get; set; } = "";
            public string password { get; set; } = "";
        }
        private _CONFIG APIConfig = new _CONFIG();
        private string Service = "PRIORITY";
        public USPSDeliveryIntegration(string service = "PRIORITY")
        {
            Service = service;
            var content = File.ReadAllText("usps-config.json");
            var config = JsonConvert.DeserializeObject<_CONFIG>(content);
            if (config == null)
                throw new Exception("USPSDeliveryIntegration: Failed to load configuration.");
            APIConfig = config;
        }
        public override string GetName()
        {
            return "USPS %s";
        }
        public override async Task<decimal> GetEstimate(Order order, Vendor vendor, Product product, int quantity)
        {
            if (vendor.Address == null)
                throw new Exception("GetEstimate: Vendor address is null.");
            using (var client = new HttpClient())
            {
                var content = new FormUrlEncodedContent(new List<KeyValuePair<string, string>>(){
                    new KeyValuePair<string, string>("XML", @"<RateV4Request USERID=""" + APIConfig.userid + @""" PASSWORD=""" + APIConfig.password + @""">
    <Revision>2</Revision>
    <Package ID=""0"">
        <Service>" + Service + @"</Service>
        <ZipOrigination>" + vendor.Address.PostalCode + @"</ZipOrigination>
        <ZipDestination>" + order.ShippingAddress.PostalCode + @"</ZipDestination>
        <Pounds>" + product.Weight  + @"</Pounds>
        <Ounces>0</Ounces>
        <Container></Container>
        <Width></Width>
        <Length></Length>
        <Height></Height>
        <Girth></Girth>
    </Package>
</RateV4Request>")
                });
                using (var resp = await client.PostAsync("https://secure.shippingapis.com/ShippingAPI.dll?API=RateV4", content))
                {
                    var body = await resp.Content.ReadAsStringAsync();
                    Console.WriteLine("RESP: " + body);
                    var regex = new Regex(@"<\?(.*?)\?>");
                    body = regex.Replace(body, "");

                    var xml = XElement.Parse(body);
                    try
                    {
                        var rate = Convert.ToDecimal(xml.Element("Package").Element("Postage").Element("Rate").Value);
                        return rate;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("GetEstimate: Failed to parse XML. " + ex.Message);
                    }
                }
            }
            throw new Exception("GetEstimate: Failed.");
        }

        public override async Task<_DELIVERY_STATUS> Track(Order order)
        {
            if(order.OrderType != Order.OrderTypeVendor)
                throw new Exception("Not a vendor order: " + order.ID);
            using (var client = new HttpClient())
            {
                var content = new FormUrlEncodedContent(new List<KeyValuePair<string, string>>(){
                    new KeyValuePair<string, string>("XML", @"<TrackRequest USERID=""" + APIConfig.userid + @""" PASSWORD=""" + APIConfig.password + @""">
<TrackID ID=""" + order.TrackingNumber + @"""></TrackID>
</TrackRequest>")
                });
                using (var resp = await client.PostAsync("https://secure.shippingapis.com/ShippingAPI.dll?API=TrackV2", content))
                {
                    var body = await resp.Content.ReadAsStringAsync();
                    Console.WriteLine("RESP: " + body);
                    var regex = new Regex(@"<\?(.*?)\?>");
                    body = regex.Replace(body, "");

                    var xml = XElement.Parse(body);
                    try
                    {
                        var status = new _DELIVERY_STATUS()
                        {
                            status = xml.Element("TrackInfo").Element("TrackSummary").Value
                        };
                        var eles = xml.Element("TrackInfo").Elements("TrackDetail");
                        foreach(var i in eles)
                        {
                            status.status += "\n" + i.Value;
                        }
                        return status;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Track: Failed to parse XML. " + ex.Message);
                    }
                }
            }
            throw new Exception("Track: Failed.");
        }
    }
}