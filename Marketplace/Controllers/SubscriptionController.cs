/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Marketplace.Util;
using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceUtil.Util;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Controllers
{
    [ApiController]
    [Route("api/subscription")]
    public class SubscriptionController : BaseController
    {
        [HttpPost("subscribe")]
        public async Task<IActionResult> PostSubscribe([FromBody] Subscription req)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            if (req.PaymentMethodID == 0)
                return BASE(11, "You must add a payment method to subscribe.");

            using (var db = await Database.CreateAsync())
            {
                var se = SessionExtra.Get(db, CurrentUser);
                if (se == null)
                    return BASE(3, "Session extra not present.");

                var vendor = Vendor.GetFromID<Vendor>(db, se.ActiveVendorID);
                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                var st = new SubscriptionType() { Service = req.Service };
                if (!st.Select(db, "Service"))
                    return BASE(2, "Subscription type not found.");

                var sub = new Subscription() { SubscriptionTypeID = st.ID,
                    Service = st.Service,
                    IsActive = true,
                    VendorID = vendor.ID,
                    UserID = CurrentUser.ID,
                    PriceAmount = st.PriceAmount,
                    CycleType = st.CycleType,
                };
                if (sub.Select(db, "SubscriptionTypeID,VendorID,IsActive"))
                    return BASE(3, "You already are subscribed to this.");

                var uc = new UserCustomer() { UserID = CurrentUser.ID, ExternalSource = "STRIPE" };
                if (!uc.Select(db, "UserID,ExternalSource"))
                    return BASE(10, "Customer for this user not found.");

                var pm = new PaymentMethod() { ID = req.PaymentMethodID, UserID = CurrentUser.ID };
                if (!pm.Select(db, "ID,UserID"))
                    return BASE(4, "Payment method not found.");

                var pu = PaymentUtil.GetUtil("stripe");


                var payment = new Payment() { UserID = CurrentUser.ID,
                    PaymentMethodID = pm.ID,
                    ChargeAmount = st.PriceAmount,
                    ItemID = sub.ID,
                    ItemType = "Subscription"
                };
                try
                {
                    var r = await pu.CreateCharge(pm, payment, uc);
                    if (r == null)
                        return BASE(5, "Error creating charge.");

                    r = await pu.CaptureCharge(payment);
                    if (r == null)
                        return BASE(6, "Error capturing charge.");
                }
                catch
                {
                    return BASE(7, "Payment failed. Please try another payment method.");
                }
                sub.PaymentMethodID = pm.ID;
                sub.ID = sub.Insert(db);
                payment.ItemID = sub.ID;
                payment.ID = payment.Insert(db);

                sub.LastPaymentID = payment.ID;
                sub.Update(db, "LastPaymentID");

                NotifyUtil.Enqueue(CurrentUser.Email, "¡Gracias por Suscribirte a Waitr.NET - ¡Bienvenidos! | Thank You for Joining Waitr.NET - Welcome Aboard!", $@"
Estimado {vendor.Name},
<br /><br />
Esperamos que este mensaje te encuentre bien. Queremos tomarnos un momento para expresar nuestro sincero agradecimiento por elegir Waitr.NET como tu socio para mejorar la experiencia gastronómica en {vendor.Name}.
<br /><br />
Tu suscripción está ahora activa y estamos emocionados de tenerte a bordo. Entendemos que tienes opciones para seleccionar una plataforma que optimice el proceso de pedido de comida en tu restaurante, y nos sentimos honrados de que nos hayas elegido.
<br /><br />
Esto es lo que puedes esperar de tu suscripción:
<br /><br />
Gestión de Pedidos sin Esfuerzo: Con Waitr.NET, puedes gestionar los pedidos de tu restaurante de manera eficiente, asegurando un servicio rápido y preciso a tus valiosos clientes.
<br /><br />
Mayor Eficiencia: Dile adiós al proceso manual de toma de pedidos y da la bienvenida a una forma más eficiente de gestionar los pedidos, lo que se traduce en una rotación más rápida de las mesas.
<br /><br />
Experiencia del Cliente Mejorada: Nuestra plataforma fácil de usar y las opciones de personalización brindarán a tus clientes una experiencia gastronómica de primera clase.
<br /><br />
Actualizaciones Regulares: Estamos comprometidos en mejorar constantemente nuestra plataforma. Puedes esperar actualizaciones y nuevas características que aumentarán aún más la eficiencia de tu restaurante.
<br /><br />
Para comenzar, consulta la guía de usuario que te hemos enviado, que te guiará a través del proceso de configuración. Si tienes alguna pregunta o necesitas ayuda en cualquier momento, no dudes en comunicarte con nuestro equipo de soporte.
<br /><br />
Estamos emocionados de emprender este viaje contigo y estamos seguros de que Waitr.NET desempeñará un papel importante en el éxito de tu restaurante. Gracias nuevamente por elegirnos.
<br /><br />
Atentamente,
<br /><br />
Equipo Waitr.NET<br />
<a href=""https://waitr.net"">waitr.net</a>
<br /><br />
<i>
Dear {vendor.Name},
<br /><br />
We hope this message finds you well. We wanted to take a moment to express our sincere gratitude for choosing Waitr.NET as your partner in enhancing the dining experience at {vendor.Name}.
<br /><br />
Your subscription is now active, and we are thrilled to have you on board. We understand that you have a choice in selecting a platform to streamline your in-dine food ordering process, and we are honored that you have chosen us.
<br /><br />
Here's what you can expect from your subscription:
<br /><br />
Effortless Order Management: With Waitr.NET, you can manage your restaurant's orders seamlessly, ensuring quick and accurate service to your valued customers.
<br /><br />
Increased Efficiency: Say goodbye to manual order taking and hello to a more efficient way of handling orders, leading to quicker table turnover.
<br /><br />
Enhanced Customer Experience: Our user-friendly platform and customizable options will provide your customers with a top-notch dining experience.
<br /><br />
Regular Updates: We are committed to continuously improving our platform. You can expect updates and new features that will further enhance your restaurant's efficiency.
<br /><br />
To get started, please refer to the user guide we've sent you, which will walk you through the setup process. If you have any questions or need assistance at any point, don't hesitate to reach out to our support team at [Support Email] or by calling [Support Phone Number].
<br /><br />
We are excited to embark on this journey with you and are confident that Waitr.NET will play a significant role in boosting the success of your restaurant. Thank you again for choosing us.
<br /><br />
Warm regards,
<br /><br />
Waitr.NET Team<br />
<a href=""https://waitr.net"">waitr.net</a>
</i>");

                return ITEM(payment);
            }
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus([FromQuery] string service)
        {
            if (CurrentUser == null)
                return BASE(1, "Not logged in.");

            using (var db = await Database.CreateAsync())
            {
                var se = SessionExtra.Get(db, CurrentUser);
                if (se == null)
                    return BASE(3, "Session extra not present.");

                var vendor = Vendor.GetFromID<Vendor>(db, se.ActiveVendorID);
                if (vendor == null)
                    return BASE(2, "Vendor not found.");

                if (!vendor.CanEdit(db, CurrentUser))
                    return BASE(2, "No access to vendor.");

                var st = new SubscriptionType() { Service = service };
                if (!st.Select(db, "Service"))
                    return BASE(2, "Subscription type not found.");

                var sub = new Subscription() { SubscriptionTypeID = st.ID, VendorID = vendor.ID };
                if (!sub.Select(db, "SubscriptionTypeID,VendorID"))
                    return BASE(3, "This vendor is not subscribed.");

                return ITEM(sub);
            }
        }
    }
}
