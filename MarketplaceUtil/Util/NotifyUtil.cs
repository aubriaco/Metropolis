/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Marketplace.Util
{
    public static class NotifyUtil
    {
        public class Notification
        {
            public int ApplicationID;
            public string Email;
            public string Subject;
            public string Message;
            public string? Link;
            public string? LinkText;
            public string Mailer;
        }

        public static void Enqueue(string email, string subject, string message, string? link = null, string? linkText = null)
        {
            var notify = new Notification() { Email = email, Subject = subject, Message = message, Link = link, LinkText = linkText, ApplicationID = Config.I.ApplicationID, Mailer = Config.I.SMTP.Mailer };
            using (var redis = new RedisUtil())
            {
                redis.Push("notify", JsonConvert.SerializeObject(notify));
            }
        }

        public static void ProcessQueue()
        {
            int n = 0;
            string data;
            using (var redis = new RedisUtil())
            {
                while(!string.IsNullOrEmpty(data = redis.Pop("notify")))
                {
                    try
                    {
                        var notify = JsonConvert.DeserializeObject<Notification>(data);
                        if (notify != null)
                        {
                            MailUtil.Send(notify.Email, notify.Subject, notify.Message, notify.Link, notify.LinkText, null, null, notify.Mailer);
                            Console.WriteLine("Notification dispatch to " + notify.Email + ": " + notify.Subject);
                        }
                    }
                    catch(Exception ex)
                    {
                        Console.WriteLine("Error sending notification: " + ex.Message);
                    }

                    n++;
                    if (n >= 100)
                        break;
                }
            }
        }
    }
}
