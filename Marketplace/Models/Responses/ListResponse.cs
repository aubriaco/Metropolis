/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 namespace Marketplace.Models.Responses
{
    public class ListResponse : BaseResponse
    {
        public object? list { get; set; }

        public long? totalCount { get; set; } = 0;
        public long? pageCount { get; set; } = 0;

        public ListResponse(object? list)
        {
            this.list = list;
        }

        public ListResponse(object? list, long totalCount)
        {
            this.list = list;
            this.totalCount = totalCount;
            this.pageCount = (long)Math.Ceiling((double)totalCount / 15);
        }

        public ListResponse(object? list, long totalCount, long pageCount)
        {
            this.list = list;
            this.totalCount = totalCount;
            this.pageCount = pageCount;
        }
    }
}
