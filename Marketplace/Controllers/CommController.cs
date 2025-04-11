/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Models.Responses;
using Marketplace.Util;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/comm")]
    public class CommController : BaseController
    {
        [HttpPost("voice/incoming/{integration}")]
        public async Task<IActionResult> GetVoiceIncoming([FromRoute] string integration, [FromQuery] string secret, [FromForm] string? From, [FromForm] string? To)
        {
            if (Config.I == null)
                return BadRequest(new BaseResponse(1, "Not configured."));
            if (Config.I.Secret != secret)
                return Unauthorized(new BaseResponse(1, "Unauthorized."));
            if (!TwilioUtil.Enabled)
                return BadRequest(new BaseResponse(5, "Twilio is not enabled."));
            if( string.IsNullOrEmpty(To))
                return BadRequest(new BaseResponse(3, "No to."));
            if (string.IsNullOrEmpty(From))
                return BadRequest(new BaseResponse(3, "No sender."));

            string? dial = null;

            foreach (var phone in Config.I.NotifyPhones)
            {
                dial = phone;
                break;
            }

            string resp;

            if (string.IsNullOrEmpty(dial))
            {
                resp = @"<?xml version=""1.0"" encoding=""UTF-8""?>
<Response>
    <Say language=""es-ES"">Gracias por llamar a la línea de soporte de ""Metropolis Market"". Ahora mismo todas las líneas de nuestros operadores están en uso. Por favor enviar un email a ""support@metropolis.market"" o tratar mas tarde.</Say>
    <Say language=""en-US"">Thank you for calling Metropolis Market support line. We are currently not available to take your call. Please send us an email at ""support@metropolis.market"" or try again later.</Say>
    <Pause length=""1""/>
</Response>";
            }
            else
            {
                resp = @"<?xml version=""1.0"" encoding=""UTF-8""?>
<Response>
    <Say language=""es-ES"">Gracias por llamar a la línea de soporte de ""Metropolis Market"". Esta llamada puede ser monitoreada o grabada por propósitos de calidad.</Say>
    <Say language=""en-US"">Thank you for calling ""Metropolis Market"" support line. This call can be monitored or recorded for quality purposes.</Say>
    <Pause length=""1"" />
    <Dial callerId=""" + To + @""">
        <Number>" + dial + @"</Number>
    </Dial>
</Response>";
            }
            return Content(resp, "text/html");
        }

        [HttpPost("message/incoming/{integration}")]
        public async Task<IActionResult> GetMessageIncoming([FromRoute] string integration, [FromQuery] string secret, [FromForm] string? Body, [FromForm] string? From)
        {
            if (Config.I == null)
                return BadRequest(new BaseResponse(1, "Not configured."));
            if (Config.I.Secret != secret)
                return Unauthorized(new BaseResponse(2, "Unauthorized."));
            if (Config.I.Comm != null && Config.I.Comm.Twilio != null)
            {
                if(!TwilioUtil.Enabled)
                    return BadRequest(new BaseResponse(5, "Twilio is not enabled."));
                if (string.IsNullOrEmpty(From) || string.IsNullOrEmpty(Body))
                    return BadRequest(new BaseResponse(3, "No sender or body."));

                string msg = "";


                if (LockUtil.Lock("comm-msgcache", From, 1, DateTime.UtcNow.AddDays(1)))
                    msg = "<Message>We got your message, we will reply to you as soon as possible.</Message>";

                string notify = "";
                foreach(var phone in Config.I.NotifyPhones)
                {
                    notify += @"<Sms from=""+" + Config.I.Comm.Twilio.DefaultPhone + @""" to=""" + phone + @""">From: " + From + "\nMsg: " + Body + @"</Sms>";
                }

                var resp = @"<?xml version=""1.0"" encoding=""UTF-8""?>
<Response>
    " + msg + @"
    " + notify + @"
</Response>";
                return Content(resp, "text/html");
            }
            else
                return BadRequest(new BaseResponse(4, "Comm.Twilio not configured."));
        }
    }
}
