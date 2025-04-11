/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Ubriaco.Attributes;

namespace MarketplaceData.Models
{
    [Table("maildata")]
    public class MailData : MasterModel
    {
        public string? MailFrom { get; set; }
        public string? MailTo { get; set; }
        public string? Subject { get; set; }
        [VariableInfo("TEXT")]
        public string? BodyHtml { get; set; }
        [VariableInfo("TEXT")]
        public string? BodyText { get; set; }
    }
}