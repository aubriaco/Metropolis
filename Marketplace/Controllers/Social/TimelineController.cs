/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Util;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.Social;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Text.RegularExpressions;

namespace Marketplace.Controllers.Social
{
    [ApiController]
    [Route("api/timeline")]
    public class TimelineController : BaseController
    {
        [HttpPost("post")]
        public async Task<IActionResult> Post([FromBody] TimelinePost req)
        {
            if(CurrentUser == null)
                return BASE(1, "Not logged in.");

            if (string.IsNullOrEmpty(req.Message))
                return BASE(2, "Message is blank.");

            req.Message = req.Message.Trim();

            var urlRegex = new Regex("www\\.([^\\.]+)\\.[A-Za-z][A-Za-z][A-Za-z]");

            if (req.Message.Contains("http:") || req.Message.Contains("https") || urlRegex.IsMatch(req.Message))
                return BASE(2, "Invalid terminology in message. Links and URLs are not allowed.");

            if(!LockUtil.Lock("api-timeline-post", CurrentUser.ID.ToString(), 18, DateTime.UtcNow.AddMinutes(5)))
                return BASE(2, "Flood Protection: Locked state: You have reached the request limit. Please wait try again later.");

            using (var db = await Database.CreateAsync())
            {
                if (req.Photos != null)
                {
                    foreach (var i in req.Photos)
                    {
                        i.Base64Content = null;
                        i.Select(db, "ID");
                    }
                }

                TimelinePost? replyToPost = null;

                if(req.ReplyToTimelinePostID != 0)
                {
                    replyToPost = new TimelinePost() { ID = req.ReplyToTimelinePostID };
                    if (!replyToPost.Select(db, "ID"))
                        return BASE(2, "Post you are replying to is not found.");
                }
                
                req.EmptyNonEditable();
                req.UserID = CurrentUser.ID;
                req.Username = CurrentUser.Username;
                req.PhotosJson = JsonConvert.SerializeObject(req.Photos);

                var up = new UserProfile() { UserID = CurrentUser.ID };
                if(up.Select(db, "UserID"))
                {
                    req.UserDisplayPhoto.ID = up.DisplayPhotoID;
                    req.UserDisplayPhoto.Select(db, "ID");
                }

                req.ID = req.Insert(db);

                if (req.Photos != null)
                {
                    foreach (var i in req.Photos)
                    {
                        var tp = new TimelinePhoto();
                        tp.UserID = CurrentUser.ID;
                        tp.StorageItemID = i.ID;
                        tp.TimelineID = req.ID;
                        tp.Insert(db);
                    }
                }

                if (replyToPost != null)
                {
                    var recent = TimelinePost.GetList(db, CurrentUser.ID, 0, req.ReplyToTimelinePostID, 5);
                    replyToPost.RecentRepliesJson = JsonConvert.SerializeObject(recent);
                    replyToPost.Update(db, "RecentRepliesJson");

                    try
                    {
                        var replyToUser = new User() { ID = replyToPost.UserID };
                        if (replyToUser.Select(db, "ID"))
                            MailUtil.Send(replyToUser.Email, CurrentUser.Username + " replied to your post.", $@"<p>{CurrentUser.Username} has replied to your post with:</p>
                        <p><i>{req.Message}</i></p>", Config.I.BaseUrl + "/", "View Timeline");
                    }
                    catch
                    {
                        Console.WriteLine("TimelineController.Post: Failed to send email.");
                    }
                }

                return ITEM(req);
            }
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetList([FromQuery] long? replyTo)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                return LIST(TimelinePost.GetList(db, CurrentUser.ID, 0, replyTo ?? 0));
            }
        }

        [HttpGet("list/{username}")]
        public async Task<IActionResult> GetListUsername([FromRoute] string username)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            if (string.IsNullOrEmpty(username))
                return BASE(2, "Username is blank.");

            using (var db = await Database.CreateAsync())
            {
                var user = new User();
                user.Username = username.Trim().ToLower();
                if (!user.Select(db, "Username"))
                    return BASE(3, "User not found.");


                return LIST(TimelinePost.GetList(db, CurrentUser.ID, user.ID));
            }
        }
    }
}
