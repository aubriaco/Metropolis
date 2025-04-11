/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Models.Responses;
using Marketplace.Util;
using MarketplaceData.Models;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Controllers
{
    public class BaseController : ControllerBase
    {
        private User? _CurrentUser;
        protected User? CurrentUser
        {
            get
            {
                if (_CurrentUser != null)
                    return _CurrentUser;
                _CurrentUser = AuthUtil.GetCurrentUser(HttpContext);
                if (_CurrentUser == null)
                    return null;
                return _CurrentUser;
            }
        }

        protected IActionResult BASE(int errorCode = 0, string? errorMessage = null)
        {
            return Ok(new BaseResponse(errorCode, errorMessage));
        }

        protected IActionResult ITEM(object item)
        {
            return Ok(new ItemResponse(item));
        }

        protected IActionResult LIST(object list, long totalCount = 0)
        {
            return Ok(new ListResponse(list, totalCount));
        }

        protected IActionResult LIST(object list, long totalCount, long pageCount)
        {
            return Ok(new ListResponse(list, totalCount, (int)pageCount));
        }
    }
}
