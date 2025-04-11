/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 namespace Marketplace.Models.Responses
{
    public class ItemResponse : BaseResponse
    {
        public object? item { get; set; }

        public ItemResponse(object? item)
        {
            this.item = item;
        }
    }
}
