/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace;
using MarketplaceData.Models;

namespace MarketplaceUtil.Util
{
    public class DeliveryUtil
    {
        public class _INTEGRATION
        {
            public string id { get; set; } = "";
            public string Ident { get; set; } = "";
            public string Name { get; set; } = "";
        }

        public class _DELIVERY_STATUS
        {
            public string status { get; set; } = "";
            public double lat { get; set; }
            public double lng { get; set; }
        }

        public static DeliveryUtil GetUtil(string integration)
        {
            if (integration == "doordash")
                return new DoorDashDeliveryIntegration();
            else if (integration == "usps-firstclass")
                return new USPSDeliveryIntegration("FIRST CLASS");
            else if (integration == "usps-express")
                return new USPSDeliveryIntegration("PRIORITY MAIL EXPRESS");
            else if (integration == "usps-priority")
                return new USPSDeliveryIntegration("PRIORITY");
            else if (integration == "usps-economy")
                return new USPSDeliveryIntegration("GROUND ADVANTAGE");
            throw new Exception("No integration found.");
        }
        public static List<_INTEGRATION> GetList()
        {
            var list = new List<_INTEGRATION>();
            foreach (var i in Config.I.ShippingIntegrations)
            {
                var integ = new _INTEGRATION() { id = i, Ident = i };
                if(i == "doordash")
                    integ.Name = "Courier Delivery (Same Day/Next Day)";
                else if(i == "usps-express")
                    integ.Name = "USPS Priority Express (Next Day-2 Days)";
                else if(i == "usps-priority")
                    integ.Name = "USPS Priority (1-3 Days)";
                else if(i == "usps-firstclass")
                    integ.Name = "USPS First Class (1-5 Days)";
                else if(i == "usps-economy")
                    integ.Name = "USPS Economy";
                list.Add(integ);
            }
            return list;
        }
        public virtual string GetName()
        {
            throw new NotImplementedException();
        }
        public virtual bool IsCourier()
        {
            return false;
        }
        public virtual async Task<decimal> GetEstimate(Order order, Vendor vendor,  Product product, int quantity)
        {
            throw new NotImplementedException();
        }
        public virtual async Task<string> CreateDelivery(Order order, Vendor vendor)
        {
            throw new NotImplementedException();
        }
        public virtual async Task<_DELIVERY_STATUS> Track(Order order)
        {
            throw new NotImplementedException();
        }
    }
}