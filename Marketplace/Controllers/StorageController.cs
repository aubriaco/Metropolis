/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Models.Responses;
using MarketplaceData.Models;
using MarketplaceData;
using Marketplace.Util;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/storage")]
    public class StorageController : BaseController
    {
        [HttpGet("get")]
        public Task<IActionResult> Get([FromQuery] string? ident)
            => ReadFile(ident, false, false);

        [HttpGet("image")]
        public Task<IActionResult> GetImage([FromQuery] string? ident, [FromQuery] bool thumb = false)
            => ReadFile(ident, thumb, true);

        private async Task<IActionResult> ReadFile(string? ident, bool thumb, bool inline)
        {
            if (string.IsNullOrWhiteSpace(ident) || ident.Contains('{'))
                return BASE(1, "Ident is invalid.");

            using var db = await Database.CreateAsync();
            var item = new StorageItem();
            if (thumb)
            {
                item.HasThumb = true;
                item.ThumbIdent = ident;
            }
            else
                item.Ident = ident;

            if (!item.Select(db, thumb ? "HasThumb,ThumbIdent" : "Ident") || item.IsDeleted)
                return NotFound();

            // Resolve ownership through the referral record, including legacy uploads with UserID = 0.
            using var privateFile = new NpgsqlCommand(
                """
                SELECT CASE WHEN min(userid) = max(userid) THEN min(userid) ELSE 0 END
                FROM refaccountinfo WHERE utilitybillfileid = @id HAVING count(*) > 0
                """, db.C);
            privateFile.Parameters.AddWithValue("id", item.ID);
            if (await privateFile.ExecuteScalarAsync() is long ownerId)
            {
                var user = CurrentUser;
                if (user == null || (user.ID != ownerId && !user.IsAdmin))
                    return NotFound();

                inline = false;
            }

            using var content = new MemoryStream();
            if (!StorageUtil.Get(ident, content) || content.Length == 0)
                return NotFound();

            item.UpdateLastSeen(db);
            Response.Headers["Cache-Control"] = "no-store";
            Response.Headers["X-Content-Type-Options"] = "nosniff";
            Response.Headers["Content-Security-Policy"] = "sandbox; default-src 'none'";

            var mime = thumb ? "image/jpeg" : item.MimeType.ToLowerInvariant();
            if (inline && mime is ("image/jpeg" or "image/png" or "image/gif" or "image/webp" or "image/bmp"))
                return File(content.ToArray(), mime);

            return File(content.ToArray(), "application/octet-stream", item.OriginalFileName ?? item.Name);
        }

        [HttpPost("upload-encoded")]
        public async Task<IActionResult> PostUploadEncoded([FromBody] StorageItem req)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Unauthorized."));

            if (string.IsNullOrEmpty(req.Base64Content))
                return BASE(2, "No file content.");

            if (!LockUtil.Lock("api-storage-upload-encoded", CurrentUser.ID.ToString(), 40, DateTime.UtcNow.AddMinutes(1)))
                return BASE(2, "Flood Protection: Locked state: You have reached the request limit. Please wait try again later.");

            if (req.Base64Content.Length > 13_333_336)
                return BASE(2, "File is too big.");

            byte[] data;
            try
            {
                data = Convert.FromBase64String(req.Base64Content);
            }
            catch (FormatException)
            {
                return BASE(2, "File content is not valid base64.");
            }

            if (data.Length == 0 || data.Length > 10_000_000)
                return BASE(2, "Invalid file size.");

            using (var ms = new MemoryStream(data))
            {
                var si = StorageUtil.Put(ms, Guid.NewGuid().ToString(), req.MimeType, req.OriginalFileName, req.SquareThumb, CurrentUser.ID);
                if (si == null)
                    return Ok(new BaseResponse(6, "Failed to upload. Server error."));
                else
                    return Ok(new ItemResponse(si));
            }
        }

        [HttpPost("upload/{type}")]
        public async Task<IActionResult> PostUpload([FromRoute] string type)
        {
            if (CurrentUser == null)
                return Ok(new BaseResponse(1, "Unauthorized."));

            type = type.Replace('_', '/');

            using (var redis = await RedisUtil.CreateAsync())
            {
                int counter = 0;
                var v = redis.Get("upload-counter-" + CurrentUser.ID);
                if(!string.IsNullOrEmpty(v))
                    counter = int.Parse(v);
                counter++;
                if(counter > 10)
                    return Ok(new BaseResponse(5, "Flood detection triggered."));
                redis.Put("upload-counter-" + CurrentUser.ID, counter.ToString(), DateTime.UtcNow.AddSeconds(5));
            }

            string ident = Guid.NewGuid().ToString();
            if (!Request.HasFormContentType)
                return BASE(2, "No file supplied.");
            var form = await Request.ReadFormAsync();
            if (form.Files.Count == 0)
                return BASE(2, "No file supplied.");

            var f = form.Files[0];
            if (f.Length > 10000000)
                return Ok(new BaseResponse(2, "File is too big."));

            string[] types;
            if (type.Contains(','))
                types = type.Split(',');
            else
                types = new string[] { type };

            bool ok = false;
            foreach (var t in types)
            {
                if (f.ContentType.StartsWith(t))
                {
                    ok = true;
                    break;
                }
                    
            }
            if(!ok)
                return Ok(new BaseResponse(3, "Invalid type. Expected: " + type + " Received: " + f.ContentType));

            using (var st = f.OpenReadStream())
            {
                var si = StorageUtil.Put(st, ident, f.ContentType, f.FileName, false, CurrentUser.ID);
                if (si == null)
                    return Ok(new BaseResponse(6, "Failed to upload. Server error."));
                else
                    return Ok(new ItemResponse(si));
            }

        }

        [HttpGet("get/{type}/{ident}")]
        public Task<IActionResult> GetLegacyFile([FromRoute] string ident)
        {
            var extension = ident.IndexOf('.');
            return ReadFile(extension < 0 ? ident : ident[..extension], false, true);
        }

        [HttpPost("delete")]
        public async Task<IActionResult> PostDelete([FromBody] StorageItem req)
        {
            if (CurrentUser == null)
                return BASE(1, "Unauthorized.");

            using (var db = await Database.CreateAsync())
            {
                req.UserID = CurrentUser.ID;
                if (!req.Select(db, "Ident,UserID"))
                    return BASE(2, "File not found.");

                if (req.InUse)
                    return BASE(3, "File is in use by another object.");

                StorageUtil.Delete(req.Ident);

                req.DeleteFromId(db);

                
                return BASE();
            }
        }
    }
}
