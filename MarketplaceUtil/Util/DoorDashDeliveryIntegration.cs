/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MarketplaceData.Models;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;

namespace MarketplaceUtil.Util
{
    public class DoorDashDeliveryIntegration : DeliveryUtil
    {
        private string Token = "";
        private class _CONFIG
        {
            public string developer_id { get; set; } = "";
            public string key_id { get; set; } = "";
            public string signing_secret { get; set; } = "";
        }

        private _CONFIG APIConfig = new _CONFIG();

        private class DELIVERY_REQUEST
        {
            public string? external_delivery_id { get; set; }
            public string? pickup_address { get; set; }
            public string? pickup_business_name { get; set; }
            public string? pickup_phone_number { get; set; }
            public string? pickup_instructions { get; set; }
            public string? dropoff_address { get; set; }
            public string? dropoff_business_name { get; set; }
            public string? dropoff_phone_number { get; set; }
            public string? dropoff_instructions { get; set; }
            public string? order_value { get; set; }
            public string? delivery_status { get; set; }
            public string? pickup_time_estimated { get; set; }
            public string? dropoff_time_estimated { get; set; }
            public string? currency { get; set; }
            public string? order_fulfillment_method { get; set; } = "standard";
            public bool dropoff_requires_signature { get; set; } = true;
            public int fee { get; set; }
            public DROPOFF_OPTIONS dropoff_options { get; set; } = new DROPOFF_OPTIONS();
            public string? pickup_time { get; set; }
        }

        private class DROPOFF_OPTIONS
        {
            public string signature { get; set; } = "required";
            public string proof_of_delivery { get; set; } = "photo_required";
        }

        private class RESPONSE_FIELDS
        {
            public string field { get; set; } = "";
            public string error { get; set; } = "";
        }

        private class BASE_RESPONSE
        {
            public int fee { get; set; }
            public string code { get; set; } = "";
            public string message { get; set; } = "";
            public List<RESPONSE_FIELDS> field_errors { get; set; } = new List<RESPONSE_FIELDS>();
        }

        public DoorDashDeliveryIntegration()
        {
            var content = File.ReadAllText("doordash-config.json");
            var config = JsonConvert.DeserializeObject<_CONFIG>(content);
            if (config == null)
                throw new Exception("DoorDashDeliveryIntegration: Failed to load configuration.");
            APIConfig = config;
            CreateJWTToken();
        }
        public string GetValidPickupDateTimeString(DateTime dt)
        {
            if (dt.TimeOfDay.TotalHours > 21)
            {
                dt = dt.AddDays(1);
                dt = DateTime.Parse(dt.ToString("yyyy-MM-dd") + "T10:00:00Z");
            }
            else if(dt.TimeOfDay.TotalHours < 10)
            {
                dt = DateTime.Parse(dt.ToString("yyyy-MM-dd") + "T10:00:00Z");
            }
            return dt.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss") + "Z";
        }
        public string CreateJWTToken()
        {
            var header = new JwtHeader(new SigningCredentials(new SymmetricSecurityKey(Base64UrlEncoder.DecodeBytes(APIConfig.signing_secret)), SecurityAlgorithms.HmacSha256));
            header["dd-ver"] = "DD-JWT-V1";
            var payload = new JwtPayload(issuer: APIConfig.developer_id, audience: "doordash", claims: new List<Claim>() { new Claim("kid", APIConfig.key_id) }, notBefore: null, expires: System.DateTime.UtcNow.AddSeconds(300), issuedAt: System.DateTime.UtcNow);
            var securityToken = new JwtSecurityToken(header, payload);
            Token = new JwtSecurityTokenHandler().WriteToken(securityToken);
            return Token;
        }
        public override string GetName()
        {
            return "Door Dash";
        }
        public override bool IsCourier()
        {
            return true;
        }
        public override async Task<decimal> GetEstimate(Order order, Vendor vendor, Product product, int quantity)
        {
            if (vendor.Address == null)
                throw new Exception("GetEstimate: Vendor address is null.");
            using (var client = new HttpClient())
            {
                var req = new DELIVERY_REQUEST()
                {
                    external_delivery_id = order.DeliveryUUID + "-" + vendor.ID,
                    pickup_address = vendor.Address.ToDeliveryString(),
                    pickup_business_name = vendor.Name,
                    pickup_phone_number = vendor.Phone,
                    dropoff_address = order.ShippingAddress.ToDeliveryString(),
                    dropoff_phone_number = order.ShippingAddress.Phone,
                    pickup_time = GetValidPickupDateTimeString(order.ClientDate)
                };
                Console.WriteLine("REQ: " + JsonConvert.SerializeObject(req));
                var content = new StringContent(JsonConvert.SerializeObject(req));
                content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", Token);
                var resp = await client.PostAsync("https://openapi.doordash.com/drive/v2/quotes", content);
                var body = await resp.Content.ReadAsStringAsync();
                Console.WriteLine("RESP: " + body);
                dynamic? o = JsonConvert.DeserializeObject(body);
                if (o == null)
                    throw new Exception("GetEstimate: Invalid response.");
                if (resp.IsSuccessStatusCode)
                {
                    return Convert.ToDecimal(o.fee) / 100M;
                }
                else
                {
                    if (o.code == "validation_error")
                    {
                        foreach (var i in o.field_errors)
                        {
                            if (i.field == "dropoff_address")
                                return -1;
                        }
                        throw new Exception("GetEstimate: " + o.message);
                    }
                }
                throw new Exception("GetEstimate: Failed.");
            }
        }

        public async Task<string> _CreateDelivery(Order order, Vendor vendor)
        {
            if (vendor.Address == null)
                throw new Exception("CreateDelivery: Vendor address is null.");
            using (var client = new HttpClient())
            {
                var req = new DELIVERY_REQUEST()
                {
                    fee = (int)(order.ShippingAmount * 0.15M * 100)
                };
                Console.WriteLine("REQ: " + JsonConvert.SerializeObject(req));
                var content = new StringContent(JsonConvert.SerializeObject(req));
                content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", Token);
                var resp = await client.PostAsync("https://openapi.doordash.com/drive/v2/quotes/" + order.DeliveryUUID + "-" + vendor.ID + "/accept", content);
                var body = await resp.Content.ReadAsStringAsync();
                Console.WriteLine("RESP: " + body);
                dynamic? o = JsonConvert.DeserializeObject(body);
                if (resp.IsSuccessStatusCode)
                {
                    if (o != null)
                    {
                        if (o.delivery_status != null)
                        {
                            if (o.delivery_status == "created")
                            {
                                order.TrackingUrl = (string)o.tracking_url;
                                return (string)o.external_delivery_id;
                            }
                        }
                    }
                }
                else
                {
                    if(o != null)
                    {
                        if(o.message != null)
                            throw new Exception((string)o.message);
                    }
                }
                throw new Exception("_CreateDelivery: Failed.");
            }
        }

        public override async Task<string> CreateDelivery(Order order, Vendor vendor)
        {
            try
            {
                return await _CreateDelivery(order, vendor);
            }
            catch(Exception ex)
            {
                if(ex.Message == "Quote Expired" || ex.Message == "Invalid delivery UUID")
                {
                    order.DeliveryUUID = Guid.NewGuid().ToString();
                    await GetEstimate(order, vendor, null, 0);
                    return await _CreateDelivery(order, vendor);
                }
            }
            throw new Exception("CreateDelivery: Failed.");
        }

        public override async Task<_DELIVERY_STATUS> Track(Order order)
        {
            if(order.OrderType != Order.OrderTypeVendor)
                throw new Exception("Not a vendor order: " + order.ID);
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", Token);
                var resp = await client.GetAsync("https://openapi.doordash.com/drive/v2/deliveries/" + order.DeliveryUUID + "-" + order.VendorID);
                var body = await resp.Content.ReadAsStringAsync();
                Console.WriteLine("Track: RESP: " + body);
                dynamic? o = JsonConvert.DeserializeObject(body);
                if (resp.IsSuccessStatusCode)
                {
                    if(o != null)
                    {
                        var status = new _DELIVERY_STATUS();
                        if(o.delivery_status != null)
                            status.status = (string)o.delivery_status;
                        if(o.dasher_location != null)
                        {
                            status.lat = (double)o.dasher_location.lat;
                            status.lng = (double)o.dasher_location.lng;
                        }
                        if(!string.IsNullOrEmpty(status.status))
                        {
                            order.Status = "Delivery " +  System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(status.status.Replace("_"," "));
                            if(status.status == "picked_up")
                                order.StatusHigh = "In Transit";
                            else if(status.status == "arrived_at_dropoff")
                                order.StatusHigh = "Arrived at Dropoff";
                            else if(status.status == "delivered")
                            {
                                order.StatusHigh = "Delivered";
                                order.IsDelivered = true;
                                order.DeliveredDate = DateTime.UtcNow;
                            }
                        }
                        order.DeliveryStatusJsonData = JsonConvert.SerializeObject(status);
                        return status;
                    }
                }
                throw new Exception("Track: Failed.");
            }
        }
    }
}
