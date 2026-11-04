/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Util;
using Marketplace.Util.Models;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.Auction;
using MarketplaceData.Models.Cart;
using MarketplaceData.Util;
using MarketplaceUtil.Util;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Npgsql;
using System.Security.Cryptography;
using System.Text;
using static Marketplace.Util.CartUtil;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : BaseController
    {
        [HttpGet("stripe/session")]
        public async Task<IActionResult> GetStripePK()
        {
            return BASE(1, "Unused.");
            /*
            if (CurrentUser == null)
                return BASE(1, "No user.");
            if (Config.I == null || Config.I.Stripe == null)
                return BASE(2, "Config is null.");
            if (string.IsNullOrEmpty(Config.I.Stripe.pk))
                return BASE(2, "PK is null.");

            var putil = PaymentUtil.GetUtil(Config.I.PaymentIntegration);

            var ses = await putil.GetSession();

            using (var redis = await RedisUtil.CreateAsync())
            {
                var item = new PaymentSession() { pk = Config.I.Stripe.pk, sid = Guid.NewGuid().ToString(), userID = CurrentUser.ID };
                redis.Put(item.sid, JsonConvert.SerializeObject(item), DateTime.UtcNow.AddHours(1));
                return ITEM(item);
            }
            */
        }

        [HttpGet("card/list")]
        public async Task<IActionResult> GetCardList()
        {
            if (CurrentUser == null)
                return BASE(1, "No user.");

            using (var db = await Database.CreateAsync())
            {
                var list = new PaymentMethod() { UserID = CurrentUser.ID }.List<PaymentMethod>(db, "UserID");
                var pubList = new List<PaymentMethod>();
                foreach(var i in list)
                {
                    pubList.Add(i.GetPublic<PaymentMethod>());
                }
                return LIST(pubList);
            }
        }

        [HttpPost("card/save")]
        public async Task<IActionResult> PostCardSave([FromBody] PaymentMethod req)
        {
            if (CurrentUser == null)
                return BASE(1, "No user.");

            var putil = PaymentUtil.GetUtil(Config.I.PaymentIntegration);

            using (var db = await Database.CreateAsync())
            {
                var uc = new UserCustomer() { UserID =  CurrentUser.ID, ExternalSource = "STRIPE" };
                if (!uc.Select(db, "UserID,ExternalSource"))
                {
                    uc.CustomerID = await putil.CreateCustomer(CurrentUser);
                    uc.ID = uc.Insert(db);
                }

                req.UserID = CurrentUser.ID;

                try
                {

                    var r = await putil.SavePaymentMethod(req, uc);

                    var payment = new Payment() { ChargeAmount = 1 };
                    var r2 = await putil.CreateCharge(req, payment, uc, true);

                    if (r == null || r2 == null)
                        throw new Exception("Failed to verify card.");

                    req.IsDefault = !new PaymentMethod() { UserID = CurrentUser.ID }.SelectID(db, "UserID");


                    req.ID = req.Insert(db);
                }
                catch(Exception ex)
                {
                    if (ex.Message == "Your card has insufficient funds.")
                        return BASE(2, "Your card is invalid or does not have available balance for validation.");
                    return BASE(2, ex.Message);
                }
                await AuditLog.WriteAsync(db, "Added a payment method", CurrentUser.ID);
                return BASE();
            }

        }

        [HttpPost("order")]
        public async Task<IActionResult> PostOrder([FromBody] Payment req)
        {
            if (CurrentUser == null)
                return BASE(1, "No user.");


            if (req.PaymentMethodID <= 0)
                return BASE(2, "No payment method selected.");

            req = new Payment { PaymentMethodID = req.PaymentMethodID, ItemType = "Order" };

            var putil = PaymentUtil.GetUtil(Config.I.PaymentIntegration);

            using (var db = await Database.CreateAsync())
            {
                //if (!UserAgreement.IsAgreed(db, CurrentUser.ID, "TOSBuyers"))
                //    return BASE(10, "Must agree to terms and conditions.");

                req.UserID = CurrentUser.ID;

                var data = CartUtil.GetData(HttpContext, CurrentUser);
                var order = data.Order;
                if (order == null)
                    return BASE(7, "Cart order is missing.");

                if (!Guid.TryParse(order.Ident, out var checkoutId))
                    return BASE(7, "Restart checkout to initialize the order.");

                var checkoutKey = $"marketplace-order:{CurrentUser.ID}:{checkoutId:N}";
                // Hold a cross-process lock independently of the order write transaction.
                using var lockDb = await Database.CreateAsync();
                await using var lockTransaction = await lockDb.C.BeginTransactionAsync();
                using var lockCommand = new NpgsqlCommand(
                    "SELECT pg_try_advisory_xact_lock(hashtextextended(@key, 0))", lockDb.C, lockTransaction);
                lockCommand.Parameters.AddWithValue("key", checkoutKey);
                if (await lockCommand.ExecuteScalarAsync() is not true)
                    return BASE(22, "Checkout is already in progress. Retry shortly.");

                var saved = new Payment { UserID = CurrentUser.ID, TransactionID = checkoutKey, ItemType = "Order", Rejected = false };
                var retry = saved.Select(db, "UserID,TransactionID,ItemType,Rejected");
                if (retry && saved.Captured && saved.ItemID > 0)
                {
                    var existingOrder = Order.GetFromID<Order>(db, saved.ItemID);
                    return existingOrder == null ? BASE(23, "Paid order requires reconciliation.") : ITEM(existingOrder);
                }

                if (data.List.Count == 0)
                    return BASE(20, "Cart is empty.");
                if (!retry && data.Step != 4)
                    return BASE(21, "Confirm shipping before paying.");
                if (data.List.Any(item => item.ProductID <= 0 || item.Quantity <= 0))
                    return BASE(20, "Cart contains an invalid product or quantity.");

                if (order.ShippingAddress == null || order.BillingAddress == null)
                    return BASE(21, "Shipping and billing addresses are required.");

                var vendorIDList = new Dictionary<long, decimal>();
                var vendorProductCountList = new Dictionary<long, int>();
                decimal chargeTotal = 0;
                var productCount = data.List.Sum(line => (long)line.Quantity);
                if (productCount > int.MaxValue)
                    return BASE(20, "Cart quantity exceeds the supported limit.");

                foreach(var i in data.List)
                {
                    var product = Product.GetFromID<Product>(db, i.ProductID);
                    if(product == null)
                        return BASE(12, "Product '" + i.ProductID + "' not found.");
                    if (!product.IsActive || product.Price < 0)
                        return BASE(12, "Product '" + i.ProductID + "' is unavailable.");

                    var shipping = order.GetVendorShippingType(product.VendorID);
                    if (shipping == null || string.IsNullOrEmpty(shipping.ShippingType) || shipping.Amount < 0)
                        return BASE(21, "Valid shipping is required for each vendor.");
                    i.Product = product;
                    i.SalesTax = 0;
                    i.SalesTaxPercent = 0;
                    TaxUtil.CalculateTaxes(db, i, order.ShippingAddress);
                    i.Calculate(product);
                    chargeTotal += i.Total;
                    if(!vendorIDList.ContainsKey(product.VendorID))
                        vendorIDList.Add(product.VendorID, i.Total);
                    else
                        vendorIDList[product.VendorID] += i.Total;
                    if(!vendorProductCountList.ContainsKey(product.VendorID))
                        vendorProductCountList.Add(product.VendorID, i.Quantity);
                    else
                        vendorProductCountList[product.VendorID] += i.Quantity;

                }


                order.ShippingAmount = vendorIDList.Keys.Sum(vendorId => order.GetVendorShippingType(vendorId)!.Amount);
                if (order.ShippingAmount < 0)
                    return BASE(21, "Shipping amount is invalid.");

                chargeTotal = decimal.Round(chargeTotal + order.ShippingAmount, 2, MidpointRounding.AwayFromZero);
                if (chargeTotal <= 0 || chargeTotal > int.MaxValue / 100m)
                    return BASE(21, "Payment amount is invalid.");

                var fingerprint = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(
                    JsonConvert.SerializeObject(new
                    {
                        order.ShippingAddress,
                        order.BillingAddress,
                        order.ClientDate,
                        Shipping = order.VendorShippingTypes.OrderBy(type => type.VendorID),
                        Lines = data.List.OrderBy(line => line.ProductID).Select(line => new
                        {
                            line.ProductID, line.Quantity, line.Price, line.Total, line.TotalShipping,
                            VendorID = line.Product!.VendorID
                        })
                    }))));

                req.ChargeAmount = chargeTotal;
                req.ItemID = 0;
                req.TransactionID = checkoutKey;
                req.CheckoutFingerprint = fingerprint;

                if (retry)
                {
                    if (saved.PaymentMethodID != req.PaymentMethodID || saved.ChargeAmount != chargeTotal ||
                        saved.CheckoutFingerprint != fingerprint)
                        return BASE(23, "Checkout details changed during payment. This attempt requires reconciliation.");
                    req = saved;
                }

                if (!req.Captured)
                {
                    var pm = PaymentMethod.GetFromID<PaymentMethod>(db, req.PaymentMethodID);
                    if (pm == null || pm.UserID != CurrentUser.ID)
                        return BASE(3, "Payment method not found.");

                    var uc = new UserCustomer() { UserID = CurrentUser.ID, ExternalSource = "STRIPE" };
                    if (!uc.Select(db, "UserID,ExternalSource"))
                        return BASE(10, "Customer for this user not found.");

                    if (!retry)
                        req.ID = req.Insert(db);

                    try
                    {
                        if (string.IsNullOrEmpty(req.ChargeID))
                        {
                            // Stripe retains idempotency keys for at least 24 hours.
                            if (DateTime.UtcNow - req.CreatedDate > TimeSpan.FromHours(20))
                                return BASE(23, "This payment attempt requires reconciliation.");

                            var charge = await putil.CreateCharge(pm, req, uc);
                            if (string.IsNullOrEmpty(charge))
                                return BASE(4, "Unable to authorize payment.");

                            req.Confirmed = true;
                            req.Update(db, "Confirmed,ChargeID");
                        }

                        var capture = await putil.CaptureCharge(req);
                        if (string.IsNullOrEmpty(capture))
                            return BASE(4, "Unable to capture payment. Retry this checkout.");

                        req.Update(db, "Confirmed,Captured,CapturedDate");
                    }
                    catch (CheckoutCardDeclinedException)
                    {
                        req.Rejected = true;
                        req.Update(db, "Rejected,ChargeID");
                        return BASE(5, "The card was declined. Select a payment method and retry.");
                    }
                    catch (Exception ex)
                    {
                        Console.Error.WriteLine($"Checkout payment {req.ID} requires a retry ({ex.GetType().Name}).");
                        return BASE(5, "Payment status is pending. Retry this checkout.");
                    }
                }

                // Capture status survives order write failures. A retry can finish the order
                // without issuing another charge, and partial order records roll back together.
                await using var orderTransaction = await db.C.BeginTransactionAsync();
                using (var sequenceLock = new NpgsqlCommand(
                    "SELECT pg_advisory_xact_lock(hashtextextended('marketplace-order-sequence', 0))", db.C, orderTransaction))
                    await sequenceLock.ExecuteNonQueryAsync();

                var vendorOrders = new List<Order>();
                order.UserID = CurrentUser.ID;
                order.VendorID = 0;
                order.Paid = req.ChargeAmount;
                order.ShippingID = order.ShippingAddress.Insert(db);
                order.BillingID = order.BillingAddress.Insert(db);
                order.OrderType = Order.OrderTypeUser;
                order.ProductCount = (int)productCount;
                order.VendorShippingTypesJsonData = JsonConvert.SerializeObject(order.VendorShippingTypes);
                order.CreatedDate = DateTime.UtcNow;
                order.CreateIdent(db);
                order.ID = order.Insert(db);

                req.ItemID = order.ID;
                req.Update(db, "ItemID");


                foreach(var i in data.List)
                {
                    i.OrderID = order.ID;
                    i.ParentOrderID = order.ID;
                    i.UserID = CurrentUser.ID;
                    i.Status = "Paid";
                    i.Insert(db);
                }

                foreach(var kpv in vendorIDList)
                {
                    var st = order.GetVendorShippingType(kpv.Key);
                    if(st == null || st.ShippingType == null)
                    {
                        Console.WriteLine("PaymentController: PostOrder: ERROR: Vendor shipping type for vendor ID " + kpv.Key + " is null.");
                        continue;
                    }

                    var vendorOrder = new Order();
                    vendorOrder.ParentOrderID = order.ID;
                    vendorOrder.VendorID = kpv.Key;
                    vendorOrder.UserID = CurrentUser.ID;
                    vendorOrder.ShippingID = order.ShippingID;
                    vendorOrder.BillingID = order.BillingID;
                    vendorOrder.ShippingAmount = st.Amount;
                    vendorOrder.Paid = kpv.Value + vendorOrder.ShippingAmount;
                    vendorOrder.OrderType = Order.OrderTypeVendor;
                    vendorOrder.ProductCount = vendorProductCountList[kpv.Key];
                    vendorOrder.Ident = order.Ident;
                    vendorOrder.ShippingType = st.ShippingType;
                    vendorOrder.DeliveryUUID = order.DeliveryUUID;
                    vendorOrder.IsCourierShipping = DeliveryUtil.GetUtil(st.ShippingType).IsCourier();
                    vendorOrder.CreatedDate = DateTime.UtcNow;
                    vendorOrder.ID = vendorOrder.Insert(db);

                    var orderTracking = new OrderTracking();
                    orderTracking.OrderID = order.ID;
                    orderTracking.VendorOrderID = vendorOrder.ID;
                    orderTracking.VendorID = vendorOrder.VendorID;
                    orderTracking.ShippingType = vendorOrder.ShippingType;
                    orderTracking.Insert(db);
                    

                    foreach(var i in data.List)
                    {
                        if(i.Product == null || i.Product.VendorID != kpv.Key)
                            continue;
                        i.OrderID = vendorOrder.ID;
                        i.UserID = CurrentUser.ID;
                        i.ParentOrderID = order.ID;
                        i.Status = "Paid";
                        i.Insert(db);
                    }

                    vendorOrders.Add(vendorOrder);
                }

                await orderTransaction.CommitAsync();

                CartUtil.Clear(HttpContext, CurrentUser);
                await AuditLog.WriteAsync(db, "Paid order " + order.ID + " of: " + order.Paid, CurrentUser.ID);

                foreach (var vendorOrder in vendorOrders)
                {
                    var vendor = Vendor.GetFromID<Vendor>(db, vendorOrder.VendorID);
                    if (vendor != null)
                        MailUtil.SendOrderCreatedVendor(db, vendorOrder, vendor);
                }

                MailUtil.SendOrderCreated(order, CurrentUser, LangUtil.Get(Request));
                
                return ITEM(order);
            }
        }


        [HttpPost("bid")]
        public async Task<IActionResult> PostBid([FromBody] Payment req)
        {
            if (CurrentUser == null)
                return BASE(1, "No user.");

            
            if (req.PaymentMethodID == 0)
                return BASE(2, "No payment method selected.");

            if (req.BidAmount <= 0)
                return BASE(2, "Bid amount is invalid.");

            if(req.ItemType == "Vehicle" && req.BidAmount < 100)
                return BASE(2, "Bid amount can not be less than 100.");

            if (req.ItemType == "Appliance" && req.BidAmount < 5)
                return BASE(2, "Bid amount can not be less than 5.");

            var putil = PaymentUtil.GetUtil(Config.I.PaymentIntegration);

            using (var db = await Database.CreateAsync())
            {
                if (!UserAgreement.IsAgreed(db, CurrentUser.ID, "TOSBuyers"))
                    return BASE(10, "Must agree to terms and conditions.");

                req.EmptyNonEditable();
                req.UserID = CurrentUser.ID;

                AuctionItem auctionItem;

                if (req.ItemType == "Vehicle")
                {
                    var vh = Vehicle.GetFromID<Vehicle>(db, req.ItemID);
                    if (vh == null)
                        return BASE(7, "Item not found.");

                    if (!vh.Started || vh.StartDate > DateTime.UtcNow)
                        return BASE(8, "This auction has not begun.");

                    if (vh.Ended || vh.EndDate < DateTime.UtcNow)
                        return BASE(9, "This auction has ended.");
                    auctionItem = vh;
                }
                else if (req.ItemType == "Appliance")
                {
                    var ap = Appliance.GetFromID<Appliance>(db, req.ItemID);
                    if (ap == null)
                        return BASE(7, "Item not found.");

                    if (!ap.Started || ap.StartDate > DateTime.UtcNow)
                        return BASE(8, "This auction has not begun.");

                    if (ap.Ended || ap.EndDate < DateTime.UtcNow)
                        return BASE(9, "This auction has ended.");
                    auctionItem = ap;
                }
                else
                    return BASE(2, "Invalid item type.");

                var pm = PaymentMethod.GetFromID<PaymentMethod>(db, req.PaymentMethodID);
                if(pm == null || pm.UserID != CurrentUser.ID)
                    return BASE(3, "Payment method not found.");


                if (req.ItemType == "Vehicle")
                {

#pragma warning disable CS8602 // Dereference of a possibly null reference.
                    req.ChargeAmount = req.BidAmount * (Config.I.Fees.Vehicle.BuyersPercent / 100.0m);
#pragma warning restore CS8602 // Dereference of a possibly null reference.\

                    if (req.ChargeAmount > Config.I.Fees.Vehicle.BuyersMax)
                        req.ChargeAmount = Config.I.Fees.Vehicle.BuyersMax;
                    else if (req.ChargeAmount < Config.I.Fees.Vehicle.BuyersMin)
                        req.ChargeAmount = Config.I.Fees.Vehicle.BuyersMin;
                }
                else
                {
#pragma warning disable CS8602 // Dereference of a possibly null reference.
                    req.ChargeAmount = req.BidAmount * (Config.I.Fees.Appliance.BuyersPercent / 100.0m);
#pragma warning restore CS8602 // Dereference of a possibly null reference.\

                    if (req.ChargeAmount > Config.I.Fees.Appliance.BuyersMax)
                        req.ChargeAmount = Config.I.Fees.Appliance.BuyersMax;
                    else if (req.ChargeAmount < Config.I.Fees.Appliance.BuyersMin)
                        req.ChargeAmount = Config.I.Fees.Appliance.BuyersMin;
                }

                var uc = new UserCustomer() { UserID = CurrentUser.ID, ExternalSource = "STRIPE" };
                if (!uc.Select(db, "UserID,ExternalSource"))
                    return BASE(10, "Customer for this user not found.");

                if (req.BidAmount <= auctionItem.CurrentBid)
                    return BASE(11, "Bid amount must be higher than current bid.");

                var test = new Payment() { ItemID = req.ItemID, ItemType = req.ItemType, Rejected = false };
                if (test.Select(db, "ItemID,ItemType,Rejected", null, "bidamount DESC"))
                {
                    if(test.BidAmount >= req.BidAmount)
                        return BASE(11, "There is a bid in process that is higher than your bid, please try again in a few seconds.");
                }

                var cr = await PaymentUtil.CancelPendingBids(db, req.ItemType, auctionItem);
                if(cr != null)
                    return BASE(4, cr);

                req.ID = req.Insert(db);

                try
                {
                    var r = await putil.CreateCharge(pm, req, uc);

                    if (r == null)
                        return BASE(4, "Error creating charge.");

                    
                }
                catch(Exception ex)
                {
                    req.Rejected = true;
                    req.Update(db, "Rejected");
                    return BASE(5, ex.Message);
                }

                req.Confirmed = true;
                req.Update(db, "Confirmed,ChargeID");

                auctionItem.AddBid(db, req.BidAmount, CurrentUser.ID, req.ID);

                await AuditLog.WriteAsync(db, "Added a bid for " + req.ItemType + " " + auctionItem.ID + " of: " + req.BidAmount, CurrentUser.ID);

                var payments = Payment.GetListByItemID(db, req.ItemID, 1, CurrentUser.ID);
                var used = new List<string>
                {
                    CurrentUser.Email
                };
                foreach (var i in payments)
                {
                    if (used.Contains(i.Email))
                        continue;
                    NotifyUtil.Enqueue(i.Email, " ¡Su oferta ha sido superado/a! - You have been outbid", @$"Estimado/a {i.Username},
<br /><br />
Esperamos que este correo electrónico te encuentre bien. Queremos proporcionarte una actualización sobre la subasta en la que has estado participando en nuestra plataforma. Lamentablemente, nos entristece informarte que otra persona ha superado tu oferta.
<br /><br />
Aunque actualmente no eres el postor con la oferta más alta, te animamos a seguir de cerca la subasta, ya que esta continúa hasta su hora de cierre. Aún tienes la oportunidad de realizar una puja más alta y posiblemente recuperar la posición de liderazgo.
<br /><br />
Entendemos que perder la oportunidad de obtener un artículo deseado puede ser decepcionante, pero tenemos muchas más subastas emocionantes en camino, y te invitamos a explorar y participar en ellas también. Nuestra plataforma ofrece una amplia gama de artículos únicos y cautivadores que podrían captar tu interés.
<br /><br />
Gracias por tu participación y apoyo continuo. Si tienes alguna pregunta o necesitas asistencia adicional, no dudes en ponerte en contacto con nuestro equipo de atención al cliente, quienes estarán encantados de ayudarte.
<br /><br />
Atentamente,
{Config.I.AuctionAppName}
<br /><br />
<i>Dear {i.Username},
<br /><br />
We hope this email finds you well. We wanted to provide you with an update regarding the auction you have been participating in on our platform. Unfortunately, we regret to inform you that your bid has been surpassed by another bidder.
<br /><br />
While you are currently not the highest bidder, we encourage you to keep an eye on the auction as it continues until its closing time. There's still a chance for you to place a higher bid and potentially reclaim the lead.
<br /><br />
We understand that missing out on an item you desire can be disappointing, but we have many more exciting auctions coming up, and we invite you to explore and participate in those as well. Our platform offers a wide range of unique and captivating items that may catch your interest.
<br /><br />
Thank you for your participation and continued support. Should you have any questions or need further assistance, please feel free to reach out to our customer support team, who will be more than happy to assist you.
<br /><br />
Best regards,<br />
{Config.I.AuctionAppName}</i>", Config.I.AuctionAppUrl + "/auction/" + req.ItemID, "Ver subasta / See auction");
                    used.Add(i.Email);
                }

                return ITEM(req);
            }
        }

    }
}
