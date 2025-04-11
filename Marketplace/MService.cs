/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Util;
using System.Net;
using Ubriaco.Data;

namespace Marketplace
{
    public static class MService
    {
        public static void Init()
        {
            System.Net.ServicePointManager.SecurityProtocol =
SecurityProtocolType.Tls12 |
SecurityProtocolType.Tls11 |
SecurityProtocolType.Tls;

            if (Config.I == null)
                throw new Exception("INIT FAIL: Not configured.");
            if (Config.I.ConnectionString == null)
                throw new Exception("INIT FAIL: Not configured: ConnectionString");
            if (Config.I.Redis == null || Config.I.Redis.Host == null)
                throw new Exception("INIT FAIL: Not configured: Redis || Redis.Host");
            if (Config.I.SMTP == null || Config.I.SMTP.Host == null || Config.I.SMTP.Username == null || Config.I.SMTP.Password == null || Config.I.SMTP.Mailer == null)
                throw new Exception("INIT FAIL: Not configured: SMTP || SMTP.Host || SMTP.Username || SMTP.Password || SMTP.Mailer");
            if (Config.I.Storage == null || Config.I.Storage.BucketName == null)
                throw new Exception("INIT FAIL: Not configured: Storage || Storage.BucketName");

            BaseConnection.SetConnectionString(Config.I.ConnectionString);
            RedisUtil.Init(Config.I.Redis.Host, Config.I.Redis.Port);
            StorageUtil.Init("google-cloud.json", Config.I.Storage.BucketName);
            MailUtil.Init(Config.I.SMTP.Host, Config.I.SMTP.Username, Config.I.SMTP.Password, Config.I.SMTP.Mailer);
            MailUtil.LoadBlacklist("const/email-blacklist.txt");
            Updater.Perform();

            if (Config.I.Comm != null)
            {
                if (Config.I.Comm.Twilio != null && Config.I.Comm.Twilio.ApiKey != null && Config.I.Comm.Twilio.ApiSecret != null && Config.I.Comm.Twilio.DefaultPhone != null)
                    TwilioUtil.Init(Config.I.Comm.Twilio.ApiKey, Config.I.Comm.Twilio.ApiSecret, Config.I.Comm.Twilio.DefaultPhone);
            }
        }
    }
}
