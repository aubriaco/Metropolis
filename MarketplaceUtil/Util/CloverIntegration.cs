/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Models;
using MarketplaceData.Models.WaiterNet;
using Newtonsoft.Json;
using StackExchange.Redis;
using System.Security.Cryptography;
using System.Text;
using ZXing;
using static MarketplaceUtil.Util.CloverIntegration;

namespace MarketplaceUtil.Util
{
    public class CloverIntegration
    {
        protected static bool IsLoaded = false;
        protected static APIConfig Config { get; set; } = new APIConfig();
        protected static string BaseEP = "https://sandbox.dev.clover.com";
        protected static string ECBaseEP = "https://scl-sandbox.dev.clover.com";
        protected static string TokenBaseEP = "https://token-sandbox.dev.clover.com";

        public static void Load()
        {
            if(System.IO.File.Exists("clover.json"))
            {
                var data = System.IO.File.ReadAllText("clover.json");
                var o = JsonConvert.DeserializeObject<APIConfig>(data);
                if (o == null)
                    throw new Exception("CloverIntegration: Load: Clover configuration not found.");
                Config = o;
                IsLoaded = true;
            }
        }

        protected VendorIntegration VI;

        public CloverIntegration(VendorIntegration vi)
        {
            VI = vi;
        }

        public async Task<string> GetOAuthToken(string code)
        {
            if(!IsLoaded)
                throw new Exception("CloverIntegration: Not loaded.");
            using (var client = new HttpClient())
            {
                var resp = await client.GetAsync(BaseEP + "/oauth/token?client_id=" + Config.appID + "&client_secret=" + Config.appSecret + "&code=" + code);
                var body = await resp.Content.ReadAsStringAsync();
                if(resp.IsSuccessStatusCode)
                {
                    dynamic? o = JsonConvert.DeserializeObject(body);
                    if (o == null)
                        throw new Exception("GetOAuthToken: ERROR: Could not parse.");
                    if(o.access_token == null)
                        throw new Exception("GetOAuthToken: ERROR: Access token is null.");
                    return (string)o.access_token;
                }
                else
                    throw new Exception("GetOAuthToken: ERROR: " + body);
            }
        }

        public async Task<List<MenuCategory>> GetCategories()
        {
            if(!IsLoaded)
                throw new Exception("CloverIntegration: Not loaded.");
            using(var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", VI.APIToken);
                var resp = await client.GetAsync(BaseEP + "/v3/merchants/" + VI.MerchantID + "/categories");
                var body = await resp.Content.ReadAsStringAsync();
                if (resp.IsSuccessStatusCode)
                {
                    dynamic? o = JsonConvert.DeserializeObject(body);
                    if(o == null)
                        throw new Exception("GetInventory: ERROR: Could not parse.");
                    var list = new List<MenuCategory>();

                    foreach(var i in o.elements)
                    {
                        var item = new MenuCategory();
                        item.ExternalID = i.id;
                        item.Name = i.name;
                        item.SortOrder = i.sortOrder;
                        list.Add(item);
                    }

                    return list;
                }
                else
                    throw new Exception("GetInventory: ERROR: " + body);
            }
        }

        public async Task<List<MenuItem>> GetItemsByCategory(MenuCategory category)
        {
            if(!IsLoaded)
                throw new Exception("CloverIntegration: Not loaded.");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", VI.APIToken);
                var resp = await client.GetAsync(BaseEP + "/v3/merchants/" + VI.MerchantID + "/categories/" + category.ExternalID + "/items");
                var body = await resp.Content.ReadAsStringAsync();
                if (resp.IsSuccessStatusCode)
                {
                    dynamic? o = JsonConvert.DeserializeObject(body);
                    if (o == null)
                        throw new Exception("GetInventory: ERROR: Could not parse.");
                    var list = new List<MenuItem>();

                    foreach (var i in o.elements)
                    {
                        var item = new MenuItem();
                        item.ExternalID = i.id;
                        item.Name = i.name;
                        item.Price = ((decimal)i.price) / 100;
                        item.Disabled = !(bool)i.available;
                        item.Hidden = (bool)i.hidden;
                        list.Add(item);
                    }

                    return list;
                }
                else
                    throw new Exception("GetInventory: ERROR: " + body);
            }
        }

        public async Task<List<MenuOrderType>> GetOrderTypes()
        {
            if(!IsLoaded)
                throw new Exception("CloverIntegration: Not loaded.");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", VI.APIToken);
                var resp = await client.GetAsync(BaseEP + "/v3/merchants/" + VI.MerchantID + "/order_types");
                var body = await resp.Content.ReadAsStringAsync();
                if (resp.IsSuccessStatusCode)
                {
                    dynamic? o = JsonConvert.DeserializeObject(body);
                    if (o == null)
                        throw new Exception("GetOrderTypes: ERROR: Could not parse.");
                    var list = new List<MenuOrderType>();

                    foreach (var i in o.elements)
                    {
                        var item = new MenuOrderType();
                        item.ExternalID = i.id;
                        item.Name = i.name;
                        item.IsDefault = i.isDefault;
                        list.Add(item);
                    }

                    return list;
                }
                else
                    throw new Exception("GetOrderTypes: ERROR: " + body);
            }
        }

        public async Task<bool> CreateOrder(MenuOrder order)
        {
            if(!IsLoaded)
                throw new Exception("CloverIntegration: Not loaded.");
            var orderTypes = await GetOrderTypes();
            var defaultOrderType = orderTypes.First(i => i.IsDefault == true);

            if (defaultOrderType == null || string.IsNullOrEmpty(defaultOrderType.ExternalID))
                throw new Exception("CreateOrder: No default order type.");

            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", VI.APIToken);

                var lineItems = new List<AtomicOrderLineItem>();

                foreach(var i in order.Items)
                {
                    if (i.Item == null || string.IsNullOrEmpty(i.Item.ExternalID))
                        continue;
                    for(var n = 0; n < i.Quantity; n++)
                        lineItems.Add(new AtomicOrderLineItem(new AtomicOrderItem(i.Item.ExternalID)));
                }

                var reqObj = new AtomicOrderRequest(new AtomicOrderCart(new AtomicOrderType(defaultOrderType.ExternalID), lineItems, "#" + order.SeqID + " " + (order.Table != null ? order.Table.Name + " " : "") + (order.DisplayName ?? "")));

                var content = new StringContent(JsonConvert.SerializeObject(reqObj));

                var resp = await client.PostAsync(BaseEP + "/v3/merchants/" + VI.MerchantID + "/atomic_order/orders", content);
                var body = await resp.Content.ReadAsStringAsync();
                if (resp.IsSuccessStatusCode)
                {
                    dynamic? o = JsonConvert.DeserializeObject(body);
                    if (o == null)
                        throw new Exception("CreateOrder: ERROR: Could not parse.");
                    order.ExternalID = o.id;

                    if (!string.IsNullOrEmpty(order.ExternalID))
                        return true;
                    else
                        throw new Exception("CreateOrder: ERROR: No ID: " + body);
                }
                else
                    throw new Exception("CreateOrder: ERROR: " + body);
            }
        }

        public async Task<EncryptKeys> GetEncryptKeys()
        {
            if(!IsLoaded)
                throw new Exception("CloverIntegration: Not loaded.");
            using(var client = new HttpClient())
            {
                var resp = await client.GetAsync("https://checkout.clover.com/assets/keys.json");
                var body = await resp.Content.ReadAsStringAsync();
                if(resp.IsSuccessStatusCode)
                {
                    var o = JsonConvert.DeserializeObject<EncryptKeys>(body);
                    if (o == null)
                        throw new Exception("GetEncryptKeys: ERROR: Could not parse.");
                    return o;
                }
                else
                    throw new Exception("GetEncryptKeys: ERROR: " + body);
            }
        }

        public async Task<ECAPIKeys> GetECAPIKey()
        {
            if(!IsLoaded)
                throw new Exception("CloverIntegration: Not loaded.");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", VI.APIToken);
                var resp = await client.GetAsync(ECBaseEP + "/pakms/apikey");
                var body = await resp.Content.ReadAsStringAsync();
                if (resp.IsSuccessStatusCode)
                {
                    dynamic? o = JsonConvert.DeserializeObject<ECAPIKeys>(body);
                    if (o == null)
                        throw new Exception("GetECAPIKey: ERROR: Could not parse.");
                    return (ECAPIKeys)o;
                }
                else
                    throw new Exception("GetECAPIKey: ERROR: " + body);
            }

        }

        public async Task<CardToken> GetCardToken(PaymentMethod method, string? fullName = null, string? postalCode = null)
        {
            if(!IsLoaded)
                throw new Exception("CloverIntegration: Not loaded.");
            var apikey = await GetECAPIKey();
            var keyInfo = await GetEncryptKeys();
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("apikey", apikey.apiAccessKey);
                var reqObj = new CardTokenRequest(new CardToken(keyInfo.EncryptPAN(method.CardNumber), method.ExpMonth.ToString(), method.ExpYear.ToString(), method.CVC.ToString(), method.CardNumber.Substring(0, 6), method.CardNumber.Substring(method.CardNumber.Length - 4), method.Brand ?? "VISA", fullName, postalCode)); 
                var content = new StringContent(JsonConvert.SerializeObject(reqObj));
                var resp = await client.PostAsync(TokenBaseEP + "/v1/tokens", content);
                var body = await resp.Content.ReadAsStringAsync();
                if (resp.IsSuccessStatusCode)
                {
                    dynamic? o = JsonConvert.DeserializeObject(body);
                    if (o == null)
                        throw new Exception("GetCardToken: ERROR: Could not parse.");
                    method.ExternalID = o.id;
                    return new CardToken((string)o.id, reqObj.card);
                }
                else
                    throw new Exception("GetCardToken: ERROR: " + body);
            }

        }

        public async Task<bool> AddCustomerCard(UserCustomer customer, PaymentMethod method, string email, string? fullName = null, string? postalCode = null)
        {
            if(!IsLoaded)
                throw new Exception("CloverIntegration: Not loaded.");
            var cardToken = await GetCardToken(method, fullName, postalCode);
            if (cardToken.id == null)
                throw new Exception("AddCard: Card token source is null.");
            if (customer.ID == 0)
            {
                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", VI.APIToken);
                    var reqObj = new Customer(email, cardToken.id, fullName);
                    var content = new StringContent(JsonConvert.SerializeObject(reqObj));
                    var resp = await client.PostAsync(ECBaseEP + "/v1/customers", content);
                    var body = await resp.Content.ReadAsStringAsync();
                    if (resp.IsSuccessStatusCode)
                    {
                        dynamic? o = JsonConvert.DeserializeObject(body);
                        if (o == null)
                            throw new Exception("AddCard: Add Customer ERROR: Could not parse.");
                        customer.CustomerID = o.id;
                        customer.ExternalSource = "CLOVER";
                        return true;
                    }
                    else
                        throw new Exception("AddCard: Add Customer ERROR: " + body);
                }
            }
            else
            {
                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", VI.APIToken);
                    var reqObj = new Customer(email, cardToken.id, fullName);
                    var content = new StringContent(JsonConvert.SerializeObject(reqObj));
                    var resp = await client.PostAsync(ECBaseEP + "/v1/customers/" + customer.CustomerID, content);
                    var body = await resp.Content.ReadAsStringAsync();
                    if (resp.IsSuccessStatusCode)
                    {
                        dynamic? o = JsonConvert.DeserializeObject(body);
                        if (o == null)
                            throw new Exception("AddCard: Update Customer: ERROR: Could not parse.");
                        return true;
                    }
                    else
                        throw new Exception("AddCard: Update Customer ERROR: " + body);
                }
            }

        }

        public async Task<bool> CreateOnlineOrder(MenuOrder order, string email)
        {
            if(!IsLoaded)
                throw new Exception("CloverIntegration: Not loaded.");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", VI.APIToken);
                var items = new List<ECOrderItem>();
                foreach(var i in order.Items)
                {
                    if (i.Item == null || string.IsNullOrEmpty(i.Item.ExternalID))
                        continue;
                    items.Add(new ECOrderItem(i.Item.ExternalID, i.Quantity));
                }
                var reqObj = new ECOrder(email, items);
                Console.WriteLine(JsonConvert.SerializeObject(reqObj));
                var content = new StringContent(JsonConvert.SerializeObject(reqObj));
                var resp = await client.PostAsync(ECBaseEP + "/v1/orders", content);
                var body = await resp.Content.ReadAsStringAsync();
                if (resp.IsSuccessStatusCode)
                {
                    dynamic? o = JsonConvert.DeserializeObject(body);                    
                    if (o == null)
                        throw new Exception("CreateOnlineOrder: ERROR: Could not parse.");
                    return true;
                }
                else
                    throw new Exception("CreateOnlineOrder: ERROR: " + body);
            }
        }

        public async Task<Payment> PayOrder(MenuOrder order, CardToken token)
        {
            if(!IsLoaded)
                throw new Exception("CloverIntegration: Not loaded.");
            if (string.IsNullOrEmpty(token.id))
                throw new Exception("Card token is null.");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", VI.APIToken);
                client.DefaultRequestHeaders.Add("x-forwarded-for", order.IPAddress);
                var reqObj = new ECPayOrder(token.id);
                Console.WriteLine(JsonConvert.SerializeObject(reqObj));
                var content = new StringContent(JsonConvert.SerializeObject(reqObj));
                Console.WriteLine(ECBaseEP + "/v1/orders/" + order.ExternalID + "/pay");
                var resp = await client.PostAsync(ECBaseEP + "/v1/orders/" + order.ExternalID + "/pay", content);
                var body = await resp.Content.ReadAsStringAsync();
                if (resp.IsSuccessStatusCode)
                {
                    dynamic? o = JsonConvert.DeserializeObject(body);
                    Console.WriteLine("RESP: " + body);

                    if (o == null)
                        throw new Exception("PayOrder: ERROR: Could not parse.");

                    if ((string)o.status == "paid")
                    {
                        return new Payment() { ChargeAmount = ((decimal)o.amount)/100, ChargeID = o.charge, ItemID = order.ID, ItemType = "MenuOrder" };
                    }
                    else
                        throw new Exception("Payment failed. Please check card information.");
                }
                else
                    throw new Exception("PayOrder: ERROR: " + body);
            }
        }

        // Helper Classes

        public class APIConfig
        {
            public string appID { get; set; } = "";
            public string appSecret { get; set; } = "";
        }

        public class ECPayOrder
        {
            public string ecomind = "ecom";
            public string source;

            public ECPayOrder(string source)
            {
                this.source = source;
            }
        }

        public class ECOrder
        {
            public string currency;
            public string email;
            public List<ECOrderItem> items;

            public ECOrder(string email, List<ECOrderItem> items, string currency = "USD")
            {
                this.email = email;
                this.items = items;
                this.currency = currency;
            }
        }

        public class ECOrderItem
        {
            public string inventory_id;
            public long amount;

            public ECOrderItem(string inventory_id, long amount = 1)
            {
                this.inventory_id = inventory_id;
                this.amount = amount;
            }
        }

        public class ECAPIKeys
        {
            public string apiAccessKey, merchantUuid, developerAppUuid;
            public bool active;
            public ECAPIKeys() { }
            public ECAPIKeys(string apiAccessKey, string merchantUuid, string developerAppUuid, bool active)
            {
                this.apiAccessKey = apiAccessKey;
                this.merchantUuid = merchantUuid;
                this.developerAppUuid = developerAppUuid;
                this.active = active;
            }
        }

        public class Customer
        {
            public string ecomind = "ecom";
            public string email, source;
            public string? name;

            public Customer(string email, string source, string? name = null)
            {
                this.email = email;
                this.source = source;
                this.name = name;
            }
        }

        public class EncryptKeys
        {
            public string TA_PUBLIC_KEY_DEV = "", TA_PUBLIC_KEY_PROD = "", ACH_PUBLIC_KEY_DEV = "", ACH_PUBLIC_KEY_PROD = "";

            public string EncryptPAN(string pan)
            {
                const string prefix = "00000000";
                var input = Encoding.ASCII.GetBytes(prefix + pan);
                using (var rsa = RSA.Create(GetPublicKey(true)))
                {
                    var cipherText = rsa.Encrypt(input, RSAEncryptionPadding.OaepSHA1);
                    return Convert.ToBase64String(cipherText);
                }
            }

            public RSAParameters GetPublicKey(bool dev = false)
            {
                if (string.IsNullOrEmpty(dev ? TA_PUBLIC_KEY_DEV : TA_PUBLIC_KEY_PROD))
                    throw new Exception("GetPublicKey: Public key is null.");
                string b64data = (dev ? TA_PUBLIC_KEY_DEV : TA_PUBLIC_KEY_PROD);
                var data = Convert.FromBase64String(b64data);
                using (var ms = new MemoryStream(data))
                {
                    using (var binr = new BinaryReader(ms))
                    {
                        try
                        {
                            var modulus = binr.ReadBytes(256);
                            var exponent = binr.ReadBytes(256);
                            
                            RSAParameters rsaKeyInfo = new RSAParameters
                            {
                                Modulus = modulus,
                                Exponent = exponent
                            };
                            return rsaKeyInfo;
                        }
                        catch (Exception ex)
                        {
                            throw new Exception("Exception: " + ex.Message);
                        }
                    }
                }
                throw new Exception("GetPublicKey: Failed to get Key Info.");
            }
        }

        public class CardToken
        {
            public string encrypted_pan, exp_month, exp_year, cvv, first6, last4, brand;
            public string? name, address_zip;
            public string? id;

            public CardToken(string id, CardToken other)
            {
                this.id = id;
                this.encrypted_pan = "";
                this.exp_month = other.exp_month;
                this.exp_year = other.exp_year;
                this.cvv = other.cvv;
                this.first6 = other.first6;
                this.last4 = other.last4;
                this.brand = other.brand;
                this.name = other.name;
                this.address_zip = other.address_zip;
            }

            public CardToken(string encrypted_pan, string exp_month, string exp_year, string cvv, string first6, string last4, string brand, string? name = null, string? address_zip = null)
            {
                this.encrypted_pan = encrypted_pan;
                this.exp_month = exp_month;
                this.exp_year = exp_year;
                this.cvv = cvv;
                this.first6 = first6;
                this.last4 = last4;
                this.brand = brand;
                this.name = name;
                this.address_zip = address_zip;
            }
        }

        public class CardTokenRequest
        {
            public CardToken card;

            public CardTokenRequest(CardToken card)
            {
                this.card = card;
            }
        }

        public class AtomicOrderType
        {
            public string id { get; set; }

            public AtomicOrderType(string id)
            {
                this.id = id;
            }
        }

        public class AtomicOrderItem
        {
            public string id { get; set; }

            public AtomicOrderItem(string id)
            {
                this.id = id;
            }
        }

        public class AtomicOrderLineItem
        {
            public AtomicOrderItem item;

            public AtomicOrderLineItem(AtomicOrderItem item)
            {
                this.item = item;
            }
        }

        public class AtomicOrderCart
        {
            public string? note;
            public AtomicOrderType orderType;
            public List<AtomicOrderLineItem> lineItems;

            public AtomicOrderCart(AtomicOrderType orderType, List<AtomicOrderLineItem> lineItems, string? note = null)
            {
                this.orderType = orderType;
                this.lineItems = lineItems;
                this.note = note;
            }
        }

        public class AtomicOrderRequest
        {
            public AtomicOrderCart orderCart;

            public AtomicOrderRequest(AtomicOrderCart orderCart)
            {
                this.orderCart = orderCart;
            }
        }
    }
}
