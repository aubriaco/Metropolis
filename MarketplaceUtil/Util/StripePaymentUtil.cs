/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace;
using MarketplaceData.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MarketplaceUtil.Util
{
    public sealed class CheckoutCardDeclinedException : Exception
    {
    }

    public class StripePaymentUtil : PaymentUtil
    {
        public override async Task<string> GetSession()
        {
            if (Config.I == null || Config.I.Stripe == null || Config.I.Stripe.sk == null)
                throw new Exception("Not configured.");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", Config.I.Stripe.sk);
                var resp = await client.GetAsync("https://api.stripe.com/v1/payment_intents");
                if (resp.IsSuccessStatusCode)
                {
                    var body = await resp.Content.ReadAsStringAsync();
                    Console.WriteLine(body);
                }
                return null;
            }
        }

        public override async Task<string> CreateCustomer(User user)
        {
            if (Config.I == null || Config.I.Stripe == null || Config.I.Stripe.sk == null)
                throw new Exception("Not configured.");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", Config.I.Stripe.sk);
                var content = new FormUrlEncodedContent(new Dictionary<string, string>()
                {
                    ["description"] = user.Email
                });
                var resp = await client.PostAsync("https://api.stripe.com/v1/customers", content);
                if (resp.IsSuccessStatusCode)
                {
                    var body = await resp.Content.ReadAsStringAsync();
                    dynamic json = JsonConvert.DeserializeObject(body);
                    return (string)json.id;
                }
                throw new Exception("Could not create customer.");
            }
        }

        public override async Task<string> SavePaymentMethod(PaymentMethod pm, UserCustomer uc)
        {
            if (Config.I == null || Config.I.Stripe == null || Config.I.Stripe.sk == null)
                throw new Exception("Not configured.");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", Config.I.Stripe.sk);
                var content = new FormUrlEncodedContent(new Dictionary<string, string>()
                {
                    ["type"] = "card",
                    ["card[number]"] = pm.CardNumber,
                    ["card[exp_month]"] = pm.ExpMonth.ToString(),
                    ["card[exp_year]"] = pm.ExpYear.ToString(),
                    ["card[cvc]"] = pm.CVC.ToString()
                });
                var resp = await client.PostAsync("https://api.stripe.com/v1/payment_methods", content);
                var body = await resp.Content.ReadAsStringAsync();
                dynamic? json = JsonConvert.DeserializeObject(body);
                if (json != null)
                {
                    if (resp.IsSuccessStatusCode)
                    {
                        Console.WriteLine("SavePaymentMethod: " + body);
                        pm.ExternalID = (string)json.id;
                        pm.Brand = ((string)json.card.brand).ToUpper();
                        pm.LastFour = pm.CardNumber.Substring(pm.CardNumber.Length - 4);
                        var attach = await AttachPaymentMethod(pm, uc);
                        return (string)json.id;
                    }
                    else
                    {
                        Console.WriteLine("SavePaymentMethod: ERROR: " + body);
                        throw new Exception((string)json.error.message);
                    }
                }
                throw new Exception("Could not save payment method.");
            }
        }

        private async Task<string> AttachPaymentMethod(PaymentMethod pm, UserCustomer uc)
        {
            if (Config.I == null || Config.I.Stripe == null || Config.I.Stripe.sk == null)
                throw new Exception("Not configured.");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", Config.I.Stripe.sk);
                var content = new FormUrlEncodedContent(new Dictionary<string, string>()
                {
                    ["customer"] = uc.CustomerID
                });
                var resp = await client.PostAsync("https://api.stripe.com/v1/payment_methods/" + pm.ExternalID + "/attach", content);
                var body = await resp.Content.ReadAsStringAsync();
                dynamic? json = JsonConvert.DeserializeObject(body);
                if (json != null)
                {
                    if (resp.IsSuccessStatusCode)
                    {
                        return (string)json.id;
                    }
                    else
                    {
                        throw new Exception((string)json.error.message);
                    }
                }
                throw new Exception("Could not attach payment method.");
            }
        }

        private static bool IsMarketplaceCheckout(Payment payment) =>
            payment.ItemType == "Order" && payment.TransactionID?.StartsWith("marketplace-order:", StringComparison.Ordinal) == true;

        private static void AddCheckoutKey(HttpClient client, Payment payment, string operation)
        {
            if (IsMarketplaceCheckout(payment))
                client.DefaultRequestHeaders.Add("Idempotency-Key", payment.TransactionID + ":" + payment.ID + ":" + operation);
        }

        public override async Task<string> CreateCharge(PaymentMethod source, Payment payment, UserCustomer uc, bool onlyVerify = false, string? connectedAccountID = null)
        {
            if (Config.I == null || Config.I.Stripe == null || Config.I.Stripe.sk == null)
                throw new Exception("Not configured.");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", Config.I.Stripe.sk);
                if (!string.IsNullOrEmpty(connectedAccountID))
                    client.DefaultRequestHeaders.Add("Stripe-Account", connectedAccountID);
                var content = new FormUrlEncodedContent(new Dictionary<string, string>()
                {
                    ["amount"] = ((int)(payment.ChargeAmount * 100.0m)).ToString(),
                    ["currency"] = "usd",
                    ["confirm"] = "false",
                    ["customer"] = uc.CustomerID,
                    ["capture_method"] = "manual"
                });
                AddCheckoutKey(client, payment, "create");
                var resp = await client.PostAsync("https://api.stripe.com/v1/payment_intents", content);
                var body = await resp.Content.ReadAsStringAsync();
                dynamic? json = JsonConvert.DeserializeObject(body);
                if (json != null)
                {
                    if (resp.IsSuccessStatusCode)
                    {
                        if (onlyVerify)
                        {
                            payment.ChargeID = (string)json.id;
                            await ConfirmCharge(source, payment, uc);
                            await CancelCharge(payment);
                            return (string)json.id;
                        }
                        else
                        {
                            payment.ChargeID = (string)json.id;
                            await ConfirmCharge(source, payment, uc);
                            return (string)json.id;
                        }
                    }
                    else
                    {
                        throw new Exception((string)json.error.message);
                    }
                }
                throw new Exception("Could create charge.");
            }
        }

        private async Task<string> ConfirmCharge(PaymentMethod pm, Payment payment, UserCustomer uc)
        {

            if (Config.I == null || Config.I.Stripe == null || Config.I.Stripe.sk == null)
                throw new Exception("Not configured.");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", Config.I.Stripe.sk);
                var content = new FormUrlEncodedContent(new Dictionary<string, string>()
                {
                    ["payment_method"] = pm.ExternalID
                });
                AddCheckoutKey(client, payment, "confirm");
                var resp = await client.PostAsync("https://api.stripe.com/v1/payment_intents/" + payment.ChargeID + "/confirm", content);
                if (IsMarketplaceCheckout(payment) && resp.StatusCode == System.Net.HttpStatusCode.PaymentRequired)
                    throw new CheckoutCardDeclinedException();

                var body = await resp.Content.ReadAsStringAsync();
                dynamic? json = JsonConvert.DeserializeObject(body);
                if (json != null)
                {
                    if (resp.IsSuccessStatusCode)
                    {
                        payment.Confirmed = true;
                        return (string)json.id;
                    }
                    else
                    {
                        throw new Exception((string)json.error.message);
                    }
                }
                throw new Exception("Could not confirm charge.");
            }
        }

        private static void VerifyCheckoutCapture(JObject intent, Payment payment)
        {
            if ((string?)intent["status"] != "succeeded" ||
                (string?)intent["currency"] != "usd" ||
                (long?)intent["amount_received"] != (long)(payment.ChargeAmount * 100m))
                throw new InvalidOperationException("Stripe capture does not match the checkout amount.");
        }

        public override async Task<string> CaptureCharge(Payment payment)
        {
            if (Config.I == null || Config.I.Stripe == null || Config.I.Stripe.sk == null)
                throw new Exception("Not configured.");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", Config.I.Stripe.sk);
                var content = new FormUrlEncodedContent(new Dictionary<string, string>()
                {
                });
                if (IsMarketplaceCheckout(payment))
                {
                    using var lookup = await client.GetAsync("https://api.stripe.com/v1/payment_intents/" + payment.ChargeID);
                    lookup.EnsureSuccessStatusCode();
                    var intent = JObject.Parse(await lookup.Content.ReadAsStringAsync());
                    if ((string?)intent["status"] == "succeeded")
                    {
                        VerifyCheckoutCapture(intent, payment);
                        payment.Captured = true;
                        payment.CapturedDate = DateTime.UtcNow;
                        return payment.ChargeID!;
                    }
                }
                AddCheckoutKey(client, payment, "capture");
                var resp = await client.PostAsync("https://api.stripe.com/v1/payment_intents/" + payment.ChargeID + "/capture", content);
                var body = await resp.Content.ReadAsStringAsync();
                dynamic? json = JsonConvert.DeserializeObject(body);
                if (json != null)
                {
                    if (resp.IsSuccessStatusCode)
                    {
                        if (IsMarketplaceCheckout(payment))
                            VerifyCheckoutCapture(JObject.Parse(body), payment);

                        payment.Captured = true;
                        payment.CapturedDate = DateTime.UtcNow;
                        return (string)json.id;
                    }
                    else
                    {
                        throw new Exception((string)json.error.message);
                    }
                }
                throw new Exception("Could not capture charge.");
            }
        }

        public override async Task<string> CancelCharge(Payment payment)
        {
            if (Config.I == null || Config.I.Stripe == null || Config.I.Stripe.sk == null)
                throw new Exception("Not configured.");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", Config.I.Stripe.sk);
                var content = new FormUrlEncodedContent(new Dictionary<string, string>()
                {
                });
                var resp = await client.PostAsync("https://api.stripe.com/v1/payment_intents/" + payment.ChargeID + "/cancel", content);
                var body = await resp.Content.ReadAsStringAsync();
                dynamic? json = JsonConvert.DeserializeObject(body);
                if (json != null)
                {
                    if (resp.IsSuccessStatusCode)
                    {
                        payment.Canceled = true;
                        payment.CanceledDate = DateTime.UtcNow;
                        return (string)json.id;
                    }
                    else
                    {
                        throw new Exception((string)json.error.message);
                    }
                }
                throw new Exception("Could not cancel charge.");
            }
        }

        public override async Task<string> CreateAccount()
        {
            if (Config.I == null || Config.I.Stripe == null || Config.I.Stripe.sk == null)
                throw new Exception("Not configured.");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", Config.I.Stripe.sk);
                var content = new FormUrlEncodedContent(new Dictionary<string, string>()
                {
                    { "type", "express" }
                });
                var resp = await client.PostAsync("https://api.stripe.com/v1/accounts", content);
                var body = await resp.Content.ReadAsStringAsync();
                dynamic? json = JsonConvert.DeserializeObject(body);
                if (json != null)
                {
                    if (resp.IsSuccessStatusCode)
                    {
                        Console.WriteLine("CreateAccount: " + json.id);
                        return (string)json.id;
                    }
                    else
                    {
                        Console.WriteLine("CreateAccount: ERROR: " + body);
                        throw new Exception((string)json.error.message);
                    }
                }
                throw new Exception("Could not create account.");
            }
        }

        public override async Task<dynamic> GetAccount(string accountID)
        {
            if (Config.I == null || Config.I.Stripe == null || Config.I.Stripe.sk == null)
                throw new Exception("Not configured.");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", Config.I.Stripe.sk);
                var content = new FormUrlEncodedContent(new Dictionary<string, string>()
                {
                });
                var resp = await client.PostAsync("https://api.stripe.com/v1/accounts/" + accountID, content);
                var body = await resp.Content.ReadAsStringAsync();
                dynamic? json = JsonConvert.DeserializeObject(body);
                if (json != null)
                {
                    if (resp.IsSuccessStatusCode)
                    {
                        Console.WriteLine("GetAccount: " + json);
                        return json;
                    }
                    else
                    {
                        Console.WriteLine("GetAccount: ERROR: " + body);
                        throw new Exception((string)json.error.message);
                    }
                }
                throw new Exception("Could not get account.");
            }
        }

        public override async Task<string> CreateAccountLink(string accountID, string refreshURL, string returnURL)
        {
            if (Config.I == null || Config.I.Stripe == null || Config.I.Stripe.sk == null)
                throw new Exception("Not configured.");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", Config.I.Stripe.sk);
                var content = new FormUrlEncodedContent(new Dictionary<string, string>()
                {
                    { "account", accountID },
                    { "refresh_url", refreshURL },
                    { "return_url", returnURL },
                    { "type", "account_onboarding" }
                });
                var resp = await client.PostAsync("https://api.stripe.com/v1/account_links", content);
                var body = await resp.Content.ReadAsStringAsync();
                dynamic? json = JsonConvert.DeserializeObject(body);
                if (json != null)
                {
                    if (resp.IsSuccessStatusCode)
                    {
                        Console.WriteLine("CreateAccountLink: " + json.url);
                        return (string)json.url;
                    }
                    else
                    {
                        Console.WriteLine("CreateAccountLink: ERROR: " + body);
                        throw new Exception((string)json.error.message);
                    }
                }
                throw new Exception("Could not create account link.");
            }
        }

    }
}
