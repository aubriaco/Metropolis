/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace NexusAdmin.Controllers
{
    [ApiController]
    [Route("api/nexus")]
    public class NexusController : BaseController
    {
        [HttpGet("access")]
        public IActionResult GetAccess()
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");
            if (!CurrentUser.IsAdmin)
                return BASE(1, "Not an admin.");
            return BASE();
        }
    }
}
