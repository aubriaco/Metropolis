/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Newtonsoft.Json;
using Ubriaco.Attributes;

namespace MarketplaceData.Models.WaiterNet
{
    [Table("menucategory")]
    public class MenuCategory : MasterModel
    {
        public long CreatedByUserID { get; set; }
        public long VendorID { get; set; }
        [ColEditable]
        public string? Name { get; set; }
        public string Ident
        {
            get
            {
                return (Name ?? "").Trim().ToUpper();
            }
        }
        [ColEditable]
        public long ImageID { get; set; }
        [ColEditable]
        public string? ImageURL { get; set; }
        
        [ModelLocal]
        public List<StorageItem> Images { get; set; } = new List<StorageItem>();

        public string? ExternalID { get; set; }
        public int SortOrder { get; set; }
        
        [VariableInfo("TEXT")]
        [ColEditable]
        public string? ImagesJson
        {
            get
            {
                return JsonConvert.SerializeObject(Images);
            }
            set
            {
                if (value != null)
                {
                    var obj = JsonConvert.DeserializeObject<List<StorageItem>>(value);
                    if (obj != null)
                        Images = obj;
                }
            }
        }
    }
}