/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Newtonsoft.Json;

namespace Marketplace
{
    public class Config
    {
        public const string ImageInputQueue = "image-input-queue";
        public static Config I = new Config();

        // Token name to the external merchant IDs this integration may manage.
        public Dictionary<string, string[]> IntegrationMerchants { get; set; } = new();

        public class _REDIS
        {
            public string? Host { get; set; }
            public int Port { get; set; }
        }

        public class _SMTP
        {
            public string? Host { get; set; }
            public string? Username { get; set; }
            public string? Password { get; set; }
            public string? Mailer { get; set; }
            public string? FooterHTML { get; set; }
        }

        public class _STORAGE
        {
            public string? BucketName { get; set; }
            public string[] ImageImportHosts { get; set; } = Array.Empty<string>();
        }

        public class _COMM_ITEM
        {
            public string? ApiKey { get; set; }
            public string? ApiSecret { get; set; }
            public List<string> Phones { get; set; } = new List<string>();

            public string? DefaultPhone
            {
                get
                {
                    if(Phones.Count > 0)
                        return Phones[0];
                    return null;
                }
            }
        }

        public class _COMM
        {
            public _COMM_ITEM? Twilio { get; set; }
        }

        public class _STRIPE
        {
            public string? pk { get; set; }
            public string? sk { get; set; }
        }

        public class _MAPS
        {
            public string? APIKey { get; set; }
        }

        public class _FEES
        {
            public decimal BuyersPercent { get; set; } = 4m;
            public decimal BuyersMin { get; set; } = 25m;
            public decimal BuyersMax { get; set; } = 1000m;
        }

        public class _FEE_LIST
        {
            public _FEES Vehicle { get; set; } = new _FEES()
            {
                BuyersPercent = 4m,
                BuyersMin = 25m,
                BuyersMax = 1000m
            };
            public _FEES Appliance { get; set; } = new _FEES()
            {
                BuyersPercent = 10m,
                BuyersMin = 1m,
                BuyersMax = 5000m
            };
        }

        // Config
        public string Title { get; set; } = "Metropolis Market";
        public string TitleShort { get; set; } = "Metropolis";
        public List<string> NotifyEmails { get; set; } = new List<string>()
        {
            "aubriaco@metropolis.market",
            "alessandro.ubriaco@gmail.com"
        };
        public List<string> NotifyPhones { get; set; } = new List<string>()
        {
            "+16176517938"
        };
        public string Ident { get; set; } = "prod";
        public string? Stage { get; set; }
        public string? ConnectionString { get; set; }
        public string? DBUsername { get; set; }
        public string? DBPassword { get; set; }
        public _REDIS? Redis { get; set; }
        public _SMTP? SMTP { get; set; }
        public _STORAGE? Storage { get; set; }
        public _COMM? Comm { get; set; }
        public _FEE_LIST Fees { get; set; } = new _FEE_LIST();
        public _STRIPE? Stripe { get; set; }
        public _MAPS? Maps { get; set; }
        public string PaymentIntegration { get; set; } = "stripe";
        public List<string> ShippingIntegrations { get;set; } = new List<string>();
        public string? Crypt { get; set; }
        public string? BaseUrl { get; set; }
        public string? AppUrl { get; set; }
        public string? VendorIdent { get; set; }
        public string? AuctionAppUrl { get; set; }
        public List<string> AdditionalAppUrls = new List<string>();
        public string? Secret { get; set; }
        public string? wkhtmltopdf { get; set; }
        public string? gs { get; set; } = "gs";
        public string? tessdata { get; set; } = "tessdata_fast";
        public string? gencert { get; set; }
        public string? Host { get; set; }
        public bool Master { get; set; } = false;
        public bool Debug { get; set; } = false;
        public bool Squish { get; set; } = false;


        public string AppName { get; set; } = "Metropolis Market";
        public string AppDescription { get; set; } = "";
        public string AuctionAppName { get; set; } = "Bidea Online";

        public int ApplicationID { get; set; } = 0;
        //0 = Market, 1 = Auction, 2 = Social, 3 = Nexus, 4 = Tasker, 5 = Referral, 6 = Shop, 7 = WaiterNet, -1 = Worker

        public string GetJoinNotifyEmails()
        {
            return string.Join(",", NotifyEmails);
        }

        public static void Load(string fn = "config.json")
        {
            var i = JsonConvert.DeserializeObject<Config>(File.ReadAllText(fn));
            if (i == null)
                throw new Exception("Failed to load config.");
            I = i;

            if(I.SMTP != null)
            {
                if (I.SMTP.FooterHTML == null)
                    I.SMTP.FooterHTML = "<br /><br /><hr /><small>Email sent from application: " + I.Title + "</small><small><a href=\"" + I.BaseUrl + "\">" + I.BaseUrl + "</a></small><br />";
            }    
        }
    }
}