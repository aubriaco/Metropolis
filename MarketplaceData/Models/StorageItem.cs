/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ubriaco.Attributes;
using Ubriaco.Models;

namespace MarketplaceData.Models
{
    [Table("storageitem")]
    public class StorageItem : BaseModel
    {
        public string Ident { get; set; } = Guid.NewGuid().ToString();

        public bool HasThumb { get; set; } = false;

        public string ThumbIdent { get; set; } = Guid.NewGuid().ToString();

        public string? OriginalFileName { get; set; }

        public string MimeType { get; set; } = "application/unknown";

        public string? Ext { get; set; }

        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime LastSeenDate { get; set; } = DateTime.UtcNow;

        [ModelLocal]
        public string? Base64Content { get; set; }
        [ModelLocal]
        public bool SquareThumb { get; set; } = false;
        [ModelLocal]
        public string? InputUrl { get; set; }
        [ModelLocal]
        public int OrderIndex { get; set; }
        [ModelLocal]
        public long ProductID { get; set; }

        public string Name
        {
            get
            {
                return Ident;
            }
        }

        [ModelLocal]
        public string Url
        {
            get
            {
                return "/api/storage/image?ident=" + Ident;
            }
        }

        [ModelLocal]
        public string? ThumbUrl
        {
            get
            {
                if (HasThumb)
                    return "/api/storage/image?ident=" + ThumbIdent + "&thumb=true";
                return Url;
            }
        }

        public long UserID { get; set; }

        public bool InUse { get; set; } = false;

        public void UpdateLastSeen(Database db)
        {
            LastSeenDate = DateTime.UtcNow;
            Update(db, "LastSeenDate");
        }

        public static StorageItem? GetFromIdent(Database db, string ident)
        {
            var item = new StorageItem();
            item.Ident = ident;
            if (item.Select(db, "Ident"))
                return item;
            return null;
        }
    }
}
