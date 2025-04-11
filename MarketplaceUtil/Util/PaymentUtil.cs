/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace;
using Marketplace.Util.Models;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.Auction;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MarketplaceUtil.Util
{
    public class PaymentUtil
    {
        public virtual async Task<string> GetSession()
        {
            throw new NotImplementedException();
        }

        public virtual async Task<string> CreateCustomer(User user)
        {
            throw new NotImplementedException();
        }

        public virtual async Task<string> SavePaymentMethod(PaymentMethod pm, UserCustomer uc)
        {
            throw new NotImplementedException();
        }

        public virtual async Task<string> CreateCharge(PaymentMethod source, Payment payment, UserCustomer uc, bool onlyVerify = false, string? connectedAccountID = null)
        {
            throw new NotImplementedException();
        }

        public virtual async Task<string> CaptureCharge(Payment payment)
        {
            throw new NotImplementedException();
        }

        public virtual async Task<string> CancelCharge(Payment payment)
        {
            throw new NotImplementedException();
        }

        public virtual async Task<string> CreateAccount()
        {
            throw new NotImplementedException();
        }

        public virtual async Task<dynamic> GetAccount(string accountID)
        {
            throw new NotImplementedException();
        }

        public virtual async Task<string> CreateAccountLink(string accountID, string refreshURL, string returnURL)
        {
            throw new NotImplementedException();
        }

        public static PaymentUtil GetUtil(string integration)
        {
            if (integration == "stripe")
                return new StripePaymentUtil();
            throw new Exception("No integration found.");
        }

        // Util

        public static async Task<string?> CancelPendingBids(Database db, string itemType, AuctionItem item, long userID = 0)
        {
            var putil = GetUtil(Config.I.PaymentIntegration);
            try
            {
                List<Payment> old;
                if(userID == 0)
                    old = new Payment() { ItemID = item.ID, ItemType = itemType, Confirmed = true, Canceled = false, Rejected = false, Refunded = false, Captured = false }.List<Payment>(db, "ItemID,ItemType,Confirmed,Canceled,Rejected,Refunded,Captured");
                else
                    old = new Payment() { ItemID = item.ID, ItemType = itemType, UserID = userID, Confirmed = true, Canceled = false, Rejected = false, Refunded = false, Captured = false }.List<Payment>(db, "ItemID,ItemType,UserID,Confirmed,Canceled,Rejected,Refunded,Captured");
                foreach (var i in old)
                {
                    var r = await putil.CancelCharge(i);
                    if (r == null)
                        return "Error cancelling old bid charge.";
                    await i.UpdateAsync(db, "Canceled,CanceledDate");
                    await AuditLog.WriteAsync(db, "Canceled old bid payment for " + itemType + " " + i.ID, userID);
                }
                return null;
            }
            catch
            {
                return "Failed to cancel old bid charges.";
            }
        }
    }
}
