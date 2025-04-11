/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Models.Responses;
using MarketplaceData.Models;
using MarketplaceData;
using Marketplace.Util;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/storage")]
    public class StorageController : BaseController
    {
        [HttpGet("get")]
        [ResponseCache(Duration = 30000)]
        public async Task<IActionResult> Get([FromQuery] string? ident)
        {
            if (string.IsNullOrEmpty(ident) || ident.Contains('{'))
                return Ok(new BaseResponse(1, "Ident is invalid."));
            using (var ms = new MemoryStream())
            {
                var b = StorageUtil.Get(ident, ms);
                if (!b || ms.Length == 0)
                    return Ok(new BaseResponse(4, "Not found."));

                using (var db = await Database.CreateAsync())
                {
                    var si = new StorageItem();
                    si.Ident = ident;
                    if (!si.Select(db, "Ident"))
                        return Ok(new BaseResponse(5, "Not in database."));

                    si.UpdateLastSeen(db);

                    return File(ms.ToArray(), si.MimeType, si.Name);
                }
            }
        }

        [HttpGet("image")]
        [ResponseCache(Duration = 30000)]
        public async Task<IActionResult> GetImage([FromQuery] string? ident, [FromQuery] bool? thumb = false)
        {
            if (string.IsNullOrEmpty(ident) || ident.Contains('{'))
                return Ok(new BaseResponse(1, "Ident is invalid."));
            using (var ms = new MemoryStream())
            {
                var b = StorageUtil.Get(ident, ms);
                if (!b || ms.Length == 0)
                    return Ok(new BaseResponse(4, "Not found."));

                using (var db = await Database.CreateAsync())
                {
                    var si = new StorageItem();
                    if (thumb != null && (bool)thumb)
                    {
                        si.HasThumb = true;
                        si.ThumbIdent = ident;
                        if (!si.Select(db, "HasThumb,ThumbIdent"))
                            return Ok(new BaseResponse(5, "Not in database."));
                    }
                    else
                    {
                        si.Ident = ident;
                        if (!si.Select(db, "Ident"))
                            return Ok(new BaseResponse(5, "Not in database."));
                    }

                    si.UpdateLastSeen(db);

                    return File(ms.ToArray(), si.MimeType);
                }
            }
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

            var data = Convert.FromBase64String(req.Base64Content);

            using (var ms = new MemoryStream(data))
            {
                var si = StorageUtil.Put(ms, req.Ident, req.MimeType, req.Name, req.SquareThumb, CurrentUser.ID);
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
            var f = HttpContext.Request.Form.Files[0];
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
        public async Task<IActionResult> PostUpload([FromRoute] string type, [FromRoute] string ident)
        {
            if (ident.Contains('.'))
                ident = ident.Substring(0, ident.IndexOf('.'));

            using (var db = await Database.CreateAsync())
            {
                var si = StorageItem.GetFromIdent(db, ident);
                if (si == null)
                    return Ok(new BaseResponse(1, "Not found."));

                using (var ms = new MemoryStream())
                {
                    if (StorageUtil.Get(si.Ident, ms))
                        return File(ms.ToArray(), si.MimeType);
                    else
                        return Ok(new BaseResponse(2, "Not found."));
                }
            }

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
