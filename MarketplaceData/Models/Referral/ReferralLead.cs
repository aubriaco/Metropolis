/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData.Attributes;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Diagnostics.Metrics;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;
using Ubriaco.Data;

namespace MarketplaceData.Models.Referral
{
    [Table("referrallead")]
    public class ReferralLead : MasterModel
    {
        public long ProgramID { get; set; }
        public string? ProgramIdent { get; set; }

        public long ReferredByUserID { get; set; }
        public long LeadUserID { get; set; }
        [ColEditable]
        [PublicProp]
        public string? FirstName { get; set; }
        [ColEditable]
        [PublicProp]
        public string? LastName { get; set; }
        [ColEditable]
        [PublicProp]
        public string? FullName { get; set; }
        [ColEditable]
        [PublicProp]
        public string? Phone { get; set; }
        [ColEditable]
        [PublicProp]
        public string? Email { get; set; }

        public string Ident { get; set; } = Guid.NewGuid().ToString();

        public long AddressID { get; set; }

        [ColEditable]
        [ModelLocal]
        [PublicProp]
        public Address Address { get; set; } = new Address();

        // Created, Confirmed, In Progress, Completed, Declined
        [PublicProp]
        public string Status { get; set; } = "Created";

        public bool IsAwarded { get; set; } = false;
        public decimal AwardedAmount { get; set; }

        public override long Save(Database db)
        {
            AddressID = Address.Save(db);
            return base.Save(db);
        }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "ReferredByUserID");
            TryCreateIndex(db, "FirstName,LastName");
            TryCreateIndex(db, "FullName");
            TryCreateIndex(db, "Status");
        }

        public static string GetColorByStatus(string status)
        {
            if (status == "Confirmed")
                return "rgb(13, 202, 240)";
            else if (status == "In Progress")
                return "#0000ff";
            else if (status == "Completed")
                return "#00ff00";
            else if (status == "Declined")
                return "#ff0000";
            else
                return "#6c757d";
        }

        public static List<dynamic> GetStatusChartData(Database db, long userID)
        {
            var list = new List<dynamic>();
            using(var cmd = new NpgsqlCommand(@"SELECT COUNT(id) AS counter, l.status FROM referrallead l WHERE l.referredbyuserid=@userid GROUP BY l.status", db.C))
            {
                cmd.Parameters.AddWithValue("@userid", userID);
                using (var r = cmd.ExecuteReader())
                {
                    while(r.Read())
                    {
                        dynamic item = new ExpandoObject();
                        item.counter = Convert.ToInt64(r["counter"]);
                        item.status = r["status"].ToString();
                        item.name = item.status;
                        item.color = GetColorByStatus(item.status);
                        list.Add(item);
                    }
                }
            }

            var statuses = new List<string>() {
                "Created",
                "Confirmed",
                "In Progress",
                "Completed",
                "Declined"
            };

            foreach(var i in statuses)
            {
                if (list.Find(o => o.status == i) == null)
                {
                    dynamic item = new ExpandoObject();
                    item.counter = 0;
                    item.status = i;
                    item.name = item.status;
                    item.color = GetColorByStatus((string)item.status);
                    list.Add(item);
                }
            }

            return list;
        }
    }
}
