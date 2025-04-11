/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 namespace Marketplace.Models
{
    public class HeaderValues
    {
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string ImageURL { get; set; } = "";

        public string ReplaceIn(string source)
        {
            return source.Replace("$(TITLE)", Title).Replace("$(DESCRIPTION)", Description).Replace("$(IMAGE)", ImageURL);
        }
    }
}
