/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 namespace Marketplace.Models.Responses
{
    public class BaseResponse
    {
        public int errorCode { get; set; } = 0;
        public string? errorMessage { get; set; }

        public BaseResponse() { }

        public BaseResponse(int errorCode, string? errorMessage)
        {
            this.errorCode = errorCode;
            this.errorMessage = errorMessage;
        }
    }
}
