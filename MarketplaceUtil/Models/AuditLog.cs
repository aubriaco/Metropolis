/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData;
using MarketplaceData.Models;
using Npgsql;
using System.Reflection.Metadata;
using Ubriaco.Attributes;
using Ubriaco.Data;

namespace Marketplace.Util.Models
{
    [Table("auditlog")]
    public class AuditLog : MasterModel
    {
        protected static string ApplicationName = "General";

        public static void SetApp(string appName)
        {
            ApplicationName = appName;
        }

        public long UserID { get; set; } = 0;
        public string Message { get; set; }
        public string? Location { get; set; }
        public string AppName { get; set; } = ApplicationName;
        public string AuditType { get; set; } = "General";
        public long ApplicationID { get; set; } = 0;

        [ModelLocal]
        public string? Username { get; set; }
        [ModelLocal]
        public string? Email { get; set; }

        public static async Task<long> WriteAsync(Database db, string message, long userID = 0, string? location = null, string? auditType = null)
        {
            if (auditType == null)
                auditType = "General";

            return await new AuditLog() { Message = message, UserID = userID, Location = location, AuditType = auditType }.InsertAsync(db);
        }
        

        public static List<AuditLog> GetList(Database db)
        {
            var list = new List<AuditLog>();
            using(var cmd = new NpgsqlCommand(@"SELECT a.*, u.username, u.email FROM auditlog a LEFT JOIN _user u ON u.id=a.userid ORDER BY a.createddate DESC LIMIT 100", db.C))
            {
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        var item = new AuditLog();
                        item.Populate(r);
                        list.Add(item);
                    }
                }
            }
            return list;
        }

        public override void CreateIndexes(BaseConnection db)
        {
            base.CreateIndexes(db);
            TryCreateIndex(db, "userid");
        }
    }
}
