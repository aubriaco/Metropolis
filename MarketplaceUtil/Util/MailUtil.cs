/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using MarketplaceData;
using MarketplaceData.Models;
using MarketplaceData.Models.Auction;
using SkiaSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using ZXing;
using ZXing.SkiaSharp;

namespace Marketplace.Util
{
    public class MailUtil
    {
        public static List<string> Blacklist = new List<string>();
        public static string? TplContent = null;
        public static string? TplPath = null;

        public static string? SMTPMailer, SMTPUsername, SMTPPassword, SMTPHost, BaseURL, FooterHTML;
        public static int SMTPPort = 587;
        public static bool SMTPSecure = true;
        public static byte[]? LogoFileData = null;
        public static string? LogoDataURL = null;

        public static void Init(string host, string username, string password, string mailer)
        {
            SMTPHost = host;
            SMTPMailer = mailer;
            SMTPUsername = username;
            SMTPPassword = password;
            SMTPPort = 587;
            SMTPSecure = true;
            if (File.Exists("const/email.html"))
                TplContent = File.ReadAllText("const/email.html");
            else
                TplContent = @"<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width"">
    <meta http-equiv=""X-UA-Compatible"" content=""IE=edge"">
    <meta name=""x-apple-disable-message-reformatting"">
</head>
<body>
    %(BODY)
</body>
</html>";
            if (File.Exists("const/logo.png"))
            {
                var data = File.ReadAllBytes("const/logo.png");
                LogoFileData = data;
                LogoDataURL = "data:image/png;base64," + Convert.ToBase64String(data);
            }
            else
                Console.WriteLine("MailUtil: Failed to load logo.");

            // SK TEST
            var encoder = new BarcodeWriter()
            {
                Format = BarcodeFormat.QR_CODE
            };
            var bm = encoder.Encode(Guid.NewGuid().ToString());
            var bitmap = encoder.Write(bm);

            using (var tmp = bitmap.Encode(SKEncodedImageFormat.Png, 100))
            {
                using (var ms = new MemoryStream())
                {
                    tmp.SaveTo(ms);
                    ms.Flush();
                }
            }

            Console.WriteLine("SK TEST SUCCESS: LOAD");
        }

        public static void LoadBlacklist(string fileName = "const/email-blacklist.txt")
        {
            try
            {
                Blacklist.Clear();
                using (var file = File.OpenText(fileName))
                {
                    string? line;
                    while ((line = file.ReadLine()) != null)
                    {
                        if (string.IsNullOrWhiteSpace(line))
                            continue;
                        line = line.Trim().ToLower().Replace("\r", "").Replace("\n", "");
                        Blacklist.Add(line);
                        Console.WriteLine("LoadBlacklist: Added: " + line);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("LoadBlacklist: Failed to load: " + ex.Message);
            }
        }

        public static bool EmailIsOK(string email, bool checkBlackList = true)
        {
            email = email.ToLower().Trim();
            if (!email.Contains('@'))
                return false;
            if (email.Contains('+'))
                return false;
            if (email.IndexOf('@') == email.Length)
                return false;

            var domain = email.Substring(email.IndexOf('@') + 1);

            if(checkBlackList)
            {
                if (Blacklist.Contains(domain))
                    return false;
            }

            return true;
        }

        public static bool Send(string to, string subject, string body, string? link = null, string? linkText = null, List<Attachment>? attachments = null, string? replyTo = null, string? mailer = null, bool nl2br = false)
        {
            if (TplContent == null || string.IsNullOrEmpty(SMTPMailer) || string.IsNullOrEmpty(SMTPHost))
                throw new Exception("MailUtil: Not configured.");
            if (mailer == null)
                mailer = SMTPMailer;
            MailMessage mail = new MailMessage(mailer, to);
            SmtpClient client = new SmtpClient();
            client.Port = SMTPPort;
            client.DeliveryMethod = SmtpDeliveryMethod.Network;
            client.UseDefaultCredentials = false;
            NetworkCredential creds = new NetworkCredential(SMTPUsername, SMTPPassword);
            client.Credentials = creds;
            client.Host = SMTPHost;
            client.EnableSsl = SMTPSecure;
            mail.IsBodyHtml = true;
            mail.Subject = subject;
            mail.HeadersEncoding = Encoding.UTF8;
            if (replyTo != null)
                mail.ReplyToList.Add(replyTo);

            if (nl2br)
                body = body.Replace("\n", "<br />");

            if (FooterHTML != null)
                body += FooterHTML;

            body += "<p style=\"text-align:center;\"><small>" + DateTime.UtcNow.ToLongDateString() + " UTC</small></p>";

            string content = TplContent;

            content = content.Replace("%(BODY)", body).Replace("%(SUBJECT)", subject).Replace("%(APPURL)", Config.I.AppUrl);

            if (link != null)
                content = content.Replace("%(LINK_URL)", link).Replace("%(LINK_TEXT)", linkText);
            else
            {
                content = Regex.Replace(content, @"<!--BEGIN:BUTTON-->((?:\r|\n|.)*?)<!--END:BUTTON-->", "");
            }

            if (attachments != null)
            {
                foreach (var i in attachments)
                {
                    mail.Attachments.Add(i);
                }
            }

            MemoryStream? logoFileStream = null;

            if (LogoFileData != null)
            {
                logoFileStream = new MemoryStream(LogoFileData);
                var att = new Attachment(logoFileStream, "logo.png", "image/png");
                att.ContentId = "logo";
                mail.Attachments.Add(att);
                content = content.Replace("%(LOGO)", "cid:logo");
            }
            else
            {
                content = Regex.Replace(content, @"<!--BEGIN:HEADING-->((?:\r|\n|.)*?)<!--END:HEADING-->", "");
            }

            mail.Body = content;


            client.Send(mail);

            if (logoFileStream != null)
                logoFileStream.Dispose();

            return true;
        }

        public static int SendUsers(List<User> users, string subject, string body, string? link = null, string? linkText = null)
        {
            int sentCount = 0;
            var emails = new List<string>();
            foreach (var user in users)
            {
                if (string.IsNullOrEmpty(user.Email))
                    continue;
                if (emails.Contains(user.Email))
                    continue;
                emails.Add(user.Email);
            }

            foreach (var email in emails)
            {
                Send(email, subject, body, link, linkText);
                sentCount++;
            }
            return sentCount;
        }

        public static void SendUserInvite(User user, string baseUrl, string appName = "Metropolis Market")
        {
            if (Config.I == null)
                throw new Exception("MailUtil: SendUserInvite: Not configured.");
            if (user.Email == null)
                throw new Exception("MailUtil: SendUserInvite: User email is null.");
            using (var redis = new RedisUtil())
            {
                var ident = Guid.NewGuid().ToString();
                redis.Put(ident, user.ID.ToString(), DateTime.UtcNow.AddHours(1));

                Send(user.Email, "Verificación de email - Email Verification", "Se ha registrado en " + (user.IsAuctionUser ? Config.I.AuctionAppName : Config.I.AppName) + " con su email (" + user.Email + "). Por favor, haga clic en el enlace de abajo para verificar su correo electrónico.<br /><br /><i>You have registered in the " + (user.IsAuctionUser ? Config.I.AuctionAppName : Config.I.AppName) + " with this email (" + user.Email + "). Please click the link below to verify your email.</i>", baseUrl + "/my/verify-email/" + ident, "Verify your email");
            }
        }

        public static void SendPasswordReset(User user, string baseUrl)
        {
            if (Config.I == null)
                throw new Exception("MailUtil: SendPasswordReset: Not configured.");
            if (user.Email == null)
                throw new Exception("MailUtil: SendPasswordReset: User email is null.");
            using (var redis = new RedisUtil())
            {
                var ident = Guid.NewGuid().ToString();
                redis.Put("passwordreset-" + ident, user.ID.ToString(), DateTime.UtcNow.AddHours(1));

                Send(user.Email, "Password Reset", "You have selected to reset your password for (" + user.Email + "). Please click the link below reset your password.<br /><br />If you did not send request this please ignore this email.", (user.IsAuctionUser ? Config.I.AuctionAppUrl : Config.I.BaseUrl) + "/reset-password/" + ident, "Reset Password");
            }
        }

        public static void SendApplianceAuctionStartSeller(Appliance item, User seller)
        {
            if (Config.I == null)
                throw new Exception("MailUtil: SendApplianceAuctionStartSeller: Not configured.");
            if (seller.Email == null)
                throw new Exception("MailUtil: SendApplianceAuctionStartSeller: User email is null.");

            string startDate = item.StartDate.ToString("MM/dd/yyyy");
            if (item.SelectedStart)
                startDate = item.SelectedStartDate.ToString("MM/dd/yyyy");
            string endDate = item.EndDate.ToString("MM/dd/yyyy");

            string startingBid = "", startingBidES = "";
            if (item.StartingBidEnabled)
            {
                startingBid = "Starting Bid: " + item.StartingBid.ToString("C") + "<br />";
                startingBidES = "Oferta de Inicio: " + item.StartingBid.ToString("C") + "<br />";
            }

            string reserve = "", reserveES = "";
            if (item.ReservePriceEnabled)
            {
                reserve = "Reserve Price: " + item.ReservePrice.ToString("C") + "<br />";
                reserveES = "Precio de Reserva: " + item.ReservePrice.ToString("C") + "<br />";
            }

            Send(seller.Email, "¡Tu subasta ha sido aprobada! - Your Auction Listing has been Approved!", @$"Estimado/a {seller.FirstName},
<br /><br />
¡Nos complace informarte que tu subasta en Bidea Online ha sido aprobada! Tu artículo ahora está activo y visible para posibles compradores, lo que te brinda la oportunidad de atraer ofertas y asegurar una venta exitosa.
<br /><br />
Aquí tienes algunos detalles clave sobre tu subasta:
<br /><br />
Artículo: {item.Name}<br />
Inicio de la Subasta: {startDate}<br />
Fin de la Subasta: {endDate}<br />
{startingBidES}
{reserveES}
<br /><br />
Para maximizar el éxito de tu subasta, te recomendamos promocionar activamente tu anuncio a través de las redes sociales, comunidades en línea y tu círculo personal. Comparte las características únicas y los beneficios de tu artículo para captar el interés de posibles compradores.
<br /><br />
Asegúrese de compartir su subasta utilizando el botón de compartir ubicado en la página de la subasta:<br /><a href=""{Config.I.AuctionAppUrl + "/auction/" + item.ID}"">{Config.I.AuctionAppUrl + "/auction/" + item.ID}</a>
<br /><br />
Durante el período de la subasta, recibirás notificaciones cuando se realicen ofertas o cuando haya actividad significativa en tu anuncio. Te animamos a mantener una participación activa y responder rápidamente a cualquier consulta o mensaje de compradores interesados. Establecer una buena relación con los posibles compradores puede aumentar su confianza para realizar ofertas y contribuir a un resultado exitoso.
<br /><br />
Si tienes alguna pregunta o necesitas asistencia durante el proceso de la subasta, nuestro equipo de soporte dedicado está aquí para ayudarte. No dudes en contactarnos a través de <i>support@bideaonline.com</i> para cualquier consulta o inquietud que puedas tener.
<br /><br />
¡Te deseamos mucha suerte con tu subasta! Esperamos que te brinde una experiencia de venta gratificante. Gracias por elegir Bidea Online como tu plataforma para vender tu valioso artículo.
<br /><br />
Atentamente,
<br /><br />
{Config.I.AuctionAppName}
<br /><br />
<br /><br />
<i>
Dear {seller.FirstName},
<br /><br />
We're excited to inform you that your auction on Bidea Online has officially been approved! Your item is now live and visible to potential buyers, creating an opportunity for you to attract bids and secure a successful sale.
<br /><br />
Here are a few key details about your auction:
<br /><br />
Item: {item.Name}<br />
Auction Start: {startDate}<br />
Auction End: {endDate}<br />
{startingBid}
{reserve}
<br /><br />
To maximize the success of your auction, we recommend actively promoting your listing through social media, online communities, and personal networks. Share the unique features and benefits of your item to captivate the interest of potential buyers.
<br /><br />
Be sure to share your auction utilizing the share button located in the auction page:<br /><a href=""{Config.I.AuctionAppUrl + "/auction/" + item.ID}"">{Config.I.AuctionAppUrl + "/auction/" + item.ID}</a>
<br /><br />
During the auction period, you will receive notifications when bids are placed or when there is significant activity on your listing. We encourage you to stay engaged and respond promptly to any inquiries or messages from interested buyers. Building a rapport with potential buyers can increase their confidence in placing bids and contribute to a successful outcome.
<br /><br />
Should you have any questions or require assistance throughout the auction process, our dedicated support team is here to help. Feel free to reach out to us at [Contact Email/Phone Number] for any inquiries or concerns you may have.
<br /><br />
Best of luck with your auction! We hope it leads to a rewarding selling experience. Thank you for choosing Bidea Online as your platform for selling your valuable item.
<br /><br />
Sincerely,
<br /><br />
{Config.I.AuctionAppName}
</i>", Config.I.AuctionAppUrl + "/auction/" + item.ID, "Ver tu subasta - View your auction");

        }


        public static void SendVehicleAuctionStartSeller(Vehicle item, User seller)
        {
            if (Config.I == null)
                throw new Exception("MailUtil: SendVehicleAuctionStartSeller: Not configured.");
            if (seller.Email == null)
                throw new Exception("MailUtil: SendVehicleAuctionStartSeller: User email is null.");

            Send(seller.Email, "¡Tu subasta ha sido aprobada! - Your Auction Listing has been Approved!", @$"Estimado/a {seller.FirstName},
<br /><br />
Nos complace informarte que tu subasta en {Config.I.AuctionAppName} ha sido aprobada y ahora está activa en nuestra plataforma. ¡Felicitaciones por dar este emocionante paso para vender tu coche!
<br /><br />
Tu anuncio muestra las características únicas y las cualidades de tu coche, lo que lo hace atractivo para posibles compradores. Creemos que tu coche generará un gran interés entre nuestra comunidad entusiasta de amantes de los autos y compradores.
<br /><br />
Para maximizar el éxito de tu subasta, te recomendamos promocionar tu anuncio a través de tus redes sociales y compartirlo con amigos, familiares y otros entusiastas de los autos. Cuanta más exposición reciba tu anuncio, mayor será la posibilidad de atraer a posibles compradores.
<br /><br />
Durante todo el proceso de subasta, te mantendremos informado/a sobre las ofertas y te brindaremos apoyo para garantizar una experiencia de venta fluida y exitosa. No dudes en contactar a nuestro dedicado equipo de soporte para vendedores si tienes alguna pregunta, necesitas asistencia o requieres orientación durante el proceso.
<br /><br />
Te animamos a interactuar activamente con los posibles compradores, respondiendo rápidamente a las consultas, proporcionando información adicional y resaltando los aspectos únicos de tu coche. Establecer una buena relación con los postores interesados puede aumentar significativamente tus posibilidades de lograr una venta exitosa.
<br /><br />
Asegúrese de compartir su subasta utilizando el botón de compartir ubicado en la página de la subasta:<br /><a href=""{Config.I.AuctionAppUrl + "/auction/" + item.ID}"">{Config.I.AuctionAppUrl + "/auction/" + item.ID}</a>
<br /><br />
Gracias por elegir {Config.I.AuctionAppName} como tu plataforma para vender tu coche. Nos comprometemos a brindarte una experiencia de subasta segura, transparente y eficiente. ¡Te deseamos mucha suerte con tu subasta y esperamos celebrar tu venta exitosa!
<br /><br />
Saludos cordiales,
<br /><br />
{Config.I.AuctionAppName}
<br /><br />
<br /><br />
<i>Dear {seller.FirstName},
<br /><br />
We are pleased to inform you that your auction listing on {Config.I.AuctionAppName} has been approved and is now live on our platform. Congratulations on taking this exciting step towards selling your car!
<br /><br />
Your listing showcases the unique features and qualities of your car, making it attractive to potential buyers. We believe your car will generate significant interest among our enthusiastic community of car enthusiasts and buyers.
<br /><br />
To maximize the success of your auction, we recommend promoting your listing through your social networks and sharing it with friends, family, and fellow car enthusiasts. The more exposure your listing receives, the greater the chance of attracting potential buyers.
<br /><br />
Throughout the auction process, we will keep you updated on any bids and provide support to ensure a smooth and successful selling experience. Feel free to reach out to our dedicated seller support team if you have any questions, need assistance, or require guidance along the way.
<br /><br />
We encourage you to actively engage with potential buyers by promptly responding to inquiries, providing additional information, and showcasing the unique aspects of your car. Building rapport with interested bidders can significantly increase your chances of achieving a successful sale.
<br /><br />
Be sure to share your auction utilizing the share button located in the auction page:<br /><a href=""{Config.I.AuctionAppUrl + "/auction/" + item.ID}"">{Config.I.AuctionAppUrl + "/auction/" + item.ID}</a>
<br /><br />
Thank you for choosing {Config.I.AuctionAppName} as your platform for selling your car. We are committed to providing you with a secure, transparent, and efficient auction experience. We wish you the best of luck with your auction, and we look forward to celebrating your successful sale!
<br /><br />
Best regards,
<br /><br />
{Config.I.AuctionAppName}
</i>", Config.I.AuctionAppUrl + "/auction/" + item.ID, "Ver tu subasta - View your auction");

        }

        public static void SendAuctionWinAppliance(Appliance item, User user, User seller, decimal pendingBalance, decimal fee)
        {
            if (Config.I == null)
                throw new Exception("MailUtil: SendAuctionWin: Not configured.");
            if (user.Email == null)
                throw new Exception("MailUtil: SendAuctionWin: User email is null.");

            var attachments = new List<Attachment>();
            var encoder = new BarcodeWriter()
            {
                Format = BarcodeFormat.QR_CODE,
                Options =
                {
                    Width = 300,
                    Height = 300
                }
            };
            var bm = encoder.Encode(item.PurchaseCode);
            var bitmap = encoder.Write(bm);

            using (var bdata = bitmap.Encode(SKEncodedImageFormat.Png, 100))
            {

                var att = new Attachment(bdata.AsStream(), "purchase-code.png", "image/png");
                att.ContentId = "purchase-code";
                attachments.Add(att);

                Send(user.Email, "¡Felicitaciones por ganar la subasta! - Congratulations on Winning the Auction!",
                    @$"Estimado/a {user.FirstName},
<br /><br />
¡Felicitaciones! Nos complace informarte que has ganado exitosamente la subasta del artículo <u>{item.Name}</u> en Bidea Online. Tu determinación y oferta ganadora han asegurado este valioso artículo, y estamos realmente felices por ti.
<br /><br />
Como ganador de la oferta, queremos recordarte los siguientes pasos para completar la transacción:
<br /><br />
Contactar al Vendedor: Por favor, comunícate con el vendedor, <strong>{item.FullName}</strong>, al <strong>{item.ContactPhone}</strong>, para iniciar el proceso de compra. Preséntate como el ganador de la subasta y proporciona los detalles necesarios para facilitar una transacción fluida.
<br /><br />
{Config.I.AuctionAppName} solo cobro el cargo por servicio: ${fee.ToString("N")}<br />
Monto de pago para hacer a el vendedor directamente: <strong>${pendingBalance.ToString("N")}</strong>
<br /><br />
Mostrar este email con este código:<br />
<h3>{item.PurchaseCode}</h3><br />
<img src=""cid:purchase-code"" alt="""" width=""90%"" /><br />
<br />
Entrega o Recolección: Coordina con el vendedor para organizar la entrega o recolección del artículo. Discute las opciones de envío, plazos y cualquier costo asociado directamente con el vendedor. Es importante establecer una comunicación clara para garantizar un proceso de entrega exitoso.
<br /><br />
¡Una vez más, felicitaciones por ganar la subasta! Esperamos que este artículo te brinde una gran alegría y cumpla con tus expectativas. Gracias por ser un miembro valioso de nuestra comunidad de subastas.
<br /><br />
Saludos cordiales,
<br /><br />
Subastas Bidea Online
<br /><br />
<br /><br />
<i>
Dear {user.FirstName},
<br /><br />
Congratulations! We are delighted to inform you that you have successfully won the auction for <u>{item.Name}</u> at Bidea Online. Your determination and winning bid have secured this valuable item, and we couldn't be happier for you.
<br /><br />
As the winning bidder, we kindly remind you of the next steps to complete the transaction:
<br /><br />
Contact the Seller: Please reach out to the seller,  <strong>{item.FullName}</strong>, at  <strong>{item.ContactPhone}</strong>, to initiate the purchase process. Introduce yourself as the winning bidder and provide necessary details to facilitate a smooth transaction.
<br /><br />
{Config.I.AuctionAppName} has only charged you for the buyers fee: ${fee.ToString("N")}<br />
Balance that must be paid to seller: <strong>${pendingBalance.ToString("N")}</strong>
<br /><br />
Show this code:<br />
<h3>{item.PurchaseCode}</h3><br />
<img src=""cid:purchase-code"" alt="""" width=""90%"" /><br />
<br />
Delivery or Pickup: Coordinate with the seller to arrange the delivery or pickup of the item. Discuss shipping options, timelines, and any associated costs directly with the seller. It is essential to establish clear communication to ensure a successful delivery process.
<br /><br />
Once again, congratulations on winning the auction! We hope this item brings you immense joy and fulfills your expectations. Thank you for being a valued member of our auction community.
<br /><br />
Best regards,
<br /><br />
{Config.I.AuctionAppName}
</i>
", null, null, attachments);

            }
        }

        public static void SendAuctionWinApplianceSeller(Appliance item, User user, User seller, decimal pendingBalance, decimal fee)
        {
            if (Config.I == null)
                throw new Exception("MailUtil: SendAuctionWinSeller: Not configured.");
            if (user.Email == null)
                throw new Exception("MailUtil: SendAuctionWinSeller: User email is null.");

            Send(seller.Email, "¡Felicitaciones por ganar la subasta! - Your Item Has Been Sold",
                @$"Estimado/a {seller.FirstName},
<br /><br />
Nos complace informarte que tu artículo listado en nuestra plataforma ha sido vendido con éxito a través de la subasta. Queremos extenderte nuestras más sinceras felicitaciones por este logro.
<br /><br />
La subasta ha generado un gran interés entre compradores entusiastas, y nos complace anunciar que <strong>{user.Username} ({user.Phone})</strong> ha resultado ser el postor más alto, asegurando la compra de tu artículo. La venta se ha finalizado y la transacción se ha completado.
<br /><br />
Te pedimos amablemente que inicies la comunicación con el comprador de manera oportuna para coordinar la entrega del artículo vendido y cualquier otro detalle necesario relacionado con la transacción. Mantener una comunicación abierta y un proceso de transacción fluido garantizará una experiencia positiva tanto para ti como para el comprador.
<br /><br />
{Config.I.AuctionAppName} solo cobro el cargo por servicio: ${fee.ToString("N")}<br />
El cliente debe pagar directamente con ustedes: <strong>${pendingBalance.ToString("N")}</strong>
<br /><br />
El código de compra es:<br />
<h3>{item.PurchaseCode}</h3><br />
Queremos expresar nuestro agradecimiento por elegir nuestra plataforma para vender tu artículo. Apreciamos tu confianza y apoyo, y esperamos que hayas tenido una experiencia positiva utilizando nuestros servicios de subasta. Seguimos comprometidos en brindarte un excelente servicio en el futuro.
<br /><br />
Si tienes alguna pregunta o necesitas asistencia adicional, no dudes en contactar a nuestro equipo de atención al cliente. Estamos aquí para ayudarte y abordar cualquier inquietud que puedas tener.
<br /><br />
Una vez más, felicidades por la exitosa venta de tu artículo, y te deseamos mucho éxito en tus futuros proyectos.
<br /><br />
Saludos cordiales,
{Config.I.AuctionAppName}
<br /><br />
<br /><br />
<i>
Dear {seller.FirstName}
<br /><br />
We are thrilled to inform you that your item listed on our platform has been successfully sold through the auction. We would like to extend our warmest congratulations on this achievement.
<br /><br />
The auction generated significant interest from enthusiastic buyers, and we are pleased to announce that <strong>{user.Username} ({user.Phone})</strong> has emerged as the highest bidder, securing the purchase of your item. The sale has been finalized, and the transaction is now complete.
<br /><br />
We kindly request that you initiate communication with the buyer promptly to arrange for the transfer of the sold item and any other necessary details related to the transaction. Open lines of communication and a smooth transaction process will ensure a positive experience for both you and the buyer.
<br /><br />
{Config.I.AuctionAppName} has only charged the service fee to the buyer: ${fee.ToString("N")}<br />
El cliente debe pagar directamente con ustedes: <strong>${pendingBalance.ToString("N")}</strong>
The purchase code is:<br />
<h3>{item.PurchaseCode}</h3><br />
We would like to express our gratitude for choosing our platform to sell your item. We appreciate your trust and support, and we hope that you had a positive experience using our auction services. We remain committed to providing you with excellent service in the future.
<br /><br />
If you have any questions or require further assistance, please do not hesitate to contact our customer support team. We are here to help and address any concerns you may have.
<br /><br />
Once again, congratulations on the successful sale of your item, and we wish you continued success in your future endeavors.
<br /><br />
Best regards,
{Config.I.AuctionAppName}
</i>
");

        }


        public static void SendAuctionWinVehicle(Vehicle item, User user)
        {
            if (Config.I == null)
                throw new Exception("MailUtil: SendAuctionWin: Not configured.");
            if (user.Email == null)
                throw new Exception("MailUtil: SendAuctionWin: User email is null.");

            var attachments = new List<Attachment>();
            var encoder = new BarcodeWriter()
            {
                Format = BarcodeFormat.QR_CODE,
                Options =
                {
                    Width = 300,
                    Height = 300
                }
            };
            var bm = encoder.Encode(item.PurchaseCode);
            var bitmap = encoder.Write(bm);

            using (var bdata = bitmap.Encode(SKEncodedImageFormat.Png, 100))
            {

                var att = new Attachment(bdata.AsStream(), "purchase-code.png", "image/png");
                att.ContentId = "purchase-code";
                attachments.Add(att);
                Send(user.Email, "¡Felicitaciones por ganar la subasta! - Congratulations on Winning the Auction!",
                @$"Estimado/a {user.FirstName},
<br /><br />
¡Felicitaciones! Nos complace informarte que has ganado exitosamente la subasta del artículo <u>{item.Year} {item.Make} {item.Model}</u> en Bidea Online. Tu determinación y oferta ganadora han asegurado este valioso artículo, y estamos realmente felices por ti.
<br /><br />
Como ganador de la oferta, queremos recordarte los siguientes pasos para completar la transacción:
<br /><br />
Contactar al Vendedor: Por favor, comunícate con el vendedor, <strong>{item.FullName}</strong>, al <strong>{item.ContactPhone}</strong>, para iniciar el proceso de compra. Preséntate como el ganador de la subasta y proporciona los detalles necesarios para facilitar una transacción fluida.
<br /><br />
Mostrar este email con este código:<br />
<h3>{item.PurchaseCode}</h3><br />
<img src=""cid:purchase-code"" alt="""" width=""90%"" /><br />
<br />
Pago: Coordina con el vendedor para realizar el pago directamente por el monto de la oferta ganadora. Acuerda un método de pago mutuamente conveniente y asegúrate de intercambiar los detalles de pago de manera segura.
<br /><br />
Entrega o Recolección: Coordina con el vendedor para organizar la entrega o recolección del artículo. Discute las opciones de envío, plazos y cualquier costo asociado directamente con el vendedor. Es importante establecer una comunicación clara para garantizar un proceso de entrega exitoso.
<br /><br />
¡Una vez más, felicitaciones por ganar la subasta! Esperamos que este artículo te brinde una gran alegría y cumpla con tus expectativas. Gracias por ser un miembro valioso de nuestra comunidad de subastas.
<br /><br />
Saludos cordiales,
<br /><br />
Subastas Bidea Online
<br /><br />
<br /><br />
<i>
Dear {user.FirstName},
<br /><br />
Congratulations! We are delighted to inform you that you have successfully won the auction for <u>{item.Year} {item.Make} {item.Model}</u> at Bidea Online. Your determination and winning bid have secured this valuable item, and we couldn't be happier for you.
<br /><br />
As the winning bidder, we kindly remind you of the next steps to complete the transaction:
<br /><br />
Contact the Seller: Please reach out to the seller,  <strong>{item.FullName}</strong>, at  <strong>{item.ContactPhone}</strong>, to initiate the purchase process. Introduce yourself as the winning bidder and provide necessary details to facilitate a smooth transaction.
<br /><br />
Show this code:<br />
<h3>{item.PurchaseCode}</h3><br />
<img src=""cid:purchase-code"" alt="""" width=""90%"" /><br />
<br />
Payment: Coordinate with the seller to arrange the payment for the winning bid amount directly. Agree on a mutually convenient method of payment and ensure that all payment details are securely exchanged.
<br /><br />
Delivery or Pickup: Coordinate with the seller to arrange the delivery or pickup of the item. Discuss shipping options, timelines, and any associated costs directly with the seller. It is essential to establish clear communication to ensure a successful delivery process.
<br /><br />
Once again, congratulations on winning the auction! We hope this item brings you immense joy and fulfills your expectations. Thank you for being a valued member of our auction community.
<br /><br />
Best regards,
<br /><br />
{Config.I.AuctionAppName}
</i>
", null, null, attachments);

            }
        }

        public static void SendAuctionWinVehicleSeller(Vehicle item, User user, User seller)
        {
            if (Config.I == null)
                throw new Exception("MailUtil: SendAuctionWinSeller: Not configured.");
            if (user.Email == null)
                throw new Exception("MailUtil: SendAuctionWinSeller: User email is null.");

            Send(seller.Email, "¡Felicitaciones por ganar la subasta! - Your Item Has Been Sold",
                @$"Estimado/a {seller.Username},
<br /><br />
Nos complace informarte que tu artículo listado en nuestra plataforma ha sido vendido con éxito a través de la subasta. Queremos extenderte nuestras más sinceras felicitaciones por este logro.
<br /><br />
La subasta ha generado un gran interés entre compradores entusiastas, y nos complace anunciar que <strong>{user.Username} ({user.Phone})</strong> ha resultado ser el postor más alto, asegurando la compra de tu artículo. La venta se ha finalizado y la transacción se ha completado.
<br /><br />
Te pedimos amablemente que inicies la comunicación con el comprador de manera oportuna para coordinar la entrega del artículo vendido y cualquier otro detalle necesario relacionado con la transacción. Mantener una comunicación abierta y un proceso de transacción fluido garantizará una experiencia positiva tanto para ti como para el comprador.
<br /><br />
Recuerda ejercer precaución y tomar las medidas necesarias al finalizar la transacción, como verificar el pago y abordar cualquier otro término o condición acordada entre tú y el comprador.
<br /><br />
Queremos expresar nuestro agradecimiento por elegir nuestra plataforma para vender tu artículo. Apreciamos tu confianza y apoyo, y esperamos que hayas tenido una experiencia positiva utilizando nuestros servicios de subasta. Seguimos comprometidos en brindarte un excelente servicio en el futuro.
<br /><br />
Si tienes alguna pregunta o necesitas asistencia adicional, no dudes en contactar a nuestro equipo de atención al cliente. Estamos aquí para ayudarte y abordar cualquier inquietud que puedas tener.
<br /><br />
Una vez más, felicidades por la exitosa venta de tu artículo, y te deseamos mucho éxito en tus futuros proyectos.
<br /><br />
Saludos cordiales,
{Config.I.AuctionAppName}
<br /><br />
<br /><br />
<i>
Dear {seller.Username}
<br /><br />
We are thrilled to inform you that your item listed on our platform has been successfully sold through the auction. We would like to extend our warmest congratulations on this achievement.
<br /><br />
The auction generated significant interest from enthusiastic buyers, and we are pleased to announce that <strong>{user.Username} ({user.Phone})</strong> has emerged as the highest bidder, securing the purchase of your item. The sale has been finalized, and the transaction is now complete.
<br /><br />
We kindly request that you initiate communication with the buyer promptly to arrange for the transfer of the sold item and any other necessary details related to the transaction. Open lines of communication and a smooth transaction process will ensure a positive experience for both you and the buyer.
<br /><br />
Please remember to exercise caution and take necessary precautions when finalizing the transaction, such as verifying the payment and addressing any additional terms or conditions agreed upon between you and the buyer.
<br /><br />
We would like to express our gratitude for choosing our platform to sell your item. We appreciate your trust and support, and we hope that you had a positive experience using our auction services. We remain committed to providing you with excellent service in the future.
<br /><br />
If you have any questions or require further assistance, please do not hesitate to contact our customer support team. We are here to help and address any concerns you may have.
<br /><br />
Once again, congratulations on the successful sale of your item, and we wish you continued success in your future endeavors.
<br /><br />
Best regards,
{Config.I.AuctionAppName}
</i>
");

        }

        public static void SendReserveNotMet(AuctionItem item, User user)
        {
            if (Config.I == null)
                throw new Exception("MailUtil: SendReserveNotMet: Not configured.");
            if (user.Email == null)
                throw new Exception("MailUtil: SendReserveNotMet: User email is null.");

            Send(user.Email, "Precio de reserva no alcanzado - Reserve Price Not Met",
                @$"Estimado/a {user.FirstName},
<br /><br />
Esperamos que este correo electrónico te encuentre bien. Queremos brindarte una actualización sobre la subasta en la que has estado participando en nuestra plataforma. Aunque tu oferta ha sido la más alta, lamentablemente, el precio de reserva para el artículo no se ha alcanzado.
<br /><br />
El precio de reserva es el precio mínimo establecido por el vendedor para vender el artículo. Como el postor con la oferta más alta, queremos informarte que, a pesar de no haberse alcanzado el precio de reserva, el vendedor aún podría considerar venderte el artículo al monto de tu oferta más alta.
<br /><br />
Te animamos a seguir de cerca la subasta, ya que esta continúa hasta su hora de cierre. En caso de que el vendedor decida proceder con la venta al precio de tu oferta más alta, se te notificará en consecuencia.
<br /><br />
Apreciamos tu interés y participación en nuestra subasta. Si tienes alguna pregunta o necesitas asistencia adicional, no dudes en ponerte en contacto con nuestro equipo de atención al cliente, quienes estarán encantados de ayudarte.
<br /><br />
Agradecemos tu comprensión y esperamos brindarte más emocionantes oportunidades de subasta en el futuro.
<br /><br />
Saludos cordiales,
{Config.I.AuctionAppName}
<br /><br />
<br /><br />
<i>Dear {user.FirstName},
<br /><br />
We hope this email finds you well. We wanted to provide you with an update regarding the auction you have been participating in on our platform. While your bid has been the highest, unfortunately, the reserve price for the item has not been met.
<br /><br />
The reserve price is the minimum price set by the seller to sell the item. As the highest bidder, we wanted to inform you that although the reserve price has not been reached, the seller may still consider selling the item to you at the highest bid amount.
<br /><br />
We encourage you to keep an eye on the auction as it continues until its closing time. In the event that the seller decides to proceed with the sale at the highest bid, you will be notified accordingly.
<br /><br />
We appreciate your interest and participation in our auction. If you have any questions or need further assistance, please feel free to reach out to our customer support team, who will be more than happy to assist you.
<br /><br />
Thank you for your understanding, and we hope to provide you with more exciting auction opportunities in the future.
<br /><br />
Best regards,
{Config.I.AuctionAppName}</i>");

        }


        public static void SendReserveNotMetSeller(AuctionItem item, User seller)
        {
            if (Config.I == null)
                throw new Exception("MailUtil: SendReserveNotMetSeller: Not configured.");
            if (seller.Email == null)
                throw new Exception("MailUtil: SendReserveNotMetSeller: User email is null.");

            Send(seller.Email, "Precio de reserva no alcanzado - Reserve Price Not Met",
                @$"Estimado/a {seller.FirstName},
<br /><br />
Esperamos que este correo electrónico te encuentre bien. Queremos brindarte una actualización sobre la subasta de tu artículo en nuestra plataforma. Lamentablemente, el precio de reserva que estableciste para el artículo no se ha alcanzado durante la subasta.
<br /><br />
Aunque la subasta ha generado interés y ofertas por parte de posibles compradores, la oferta más alta no ha alcanzado el precio de reserva que estableciste. Como resultado, el artículo no se ha vendido en este momento.
<br /><br />
Entendemos que este resultado puede ser decepcionante. Sin embargo, te animamos a considerar volver a listar el artículo en nuestra plataforma con un precio de reserva revisado o explorar opciones alternativas para vender tu artículo.
<br /><br />
Nuestra plataforma sigue atrayendo a compradores entusiastas y creemos que puede haber futuras oportunidades para vender tu artículo con éxito. Si tienes alguna pregunta o necesitas ayuda para volver a listar el artículo o en cualquier otro aspecto del proceso de venta, no dudes en comunicarte con nuestro equipo de atención al cliente. Estamos aquí para ayudarte a navegar por el proceso y maximizar tu experiencia de venta.
<br /><br />
Gracias por elegir nuestra plataforma para listar tu artículo. Apreciamos tu confianza y apoyo. Si tienes más consultas o necesitas información adicional, no dudes en contactarnos.
<br /><br />
Saludos cordiales,
{Config.I.AuctionAppName}
<br /><br />
<br /><br />
<i>Dear {seller.FirstName},
<br /><br />
We hope this email finds you well. We wanted to provide you with an update regarding the auction of your item on our platform. Unfortunately, the reserve price you set for the item has not been met during the auction.
<br /><br />
Although the auction has generated interest and bids from potential buyers, the highest bid did not reach the reserve price you established. As a result, the item has not been sold at this time.
<br /><br />
We understand that this outcome may be disappointing. However, we encourage you to consider relisting the item on our platform with a revised reserve price or exploring alternative options to sell your item.
<br /><br />
Our platform continues to attract enthusiastic buyers, and we believe there may be future opportunities to successfully sell your item. If you have any questions or need assistance with relisting or any other aspect of the selling process, please don't hesitate to reach out to our customer support team. We are here to help you navigate through the process and maximize your selling experience.
<br /><br />
Thank you for choosing our platform to list your item. We appreciate your trust and support. Should you have any further inquiries or require additional information, please feel free to contact us.
<br /><br />
Best regards,
{Config.I.AuctionAppName}</i>");

        }

        public static void SendVendorManagerInvite(Vendor vendor, UserInvite userInvite, string lang = "es")
        {
            if (Config.I == null)
                throw new Exception("MailUtil: SendVendorManagerInvite: Not configured.");
            if (userInvite.Email == null)
                throw new Exception("MailUtil: SendVendorManagerInvite: Email is null.");

            if (lang == "es")
            {
                Send(userInvite.Email, "Bienvenido a Metropolis Market", @$"Hola,

Has sido invitado por el administrador de la tienda a unirte a Metropolis Market como nuevo gerente. Metropolis Market es una plataforma que conecta a vendedores y compradores locales en tu ciudad. Como gerente, podrás gestionar el inventario, los pedidos y las promociones de la tienda.

Para aceptar la invitación, haz clic en el enlace de abajo y crea tu cuenta. El enlace será válido durante los próximos 7 días.

{Config.I.AppUrl}/signup/{userInvite.Code}

Si tienes alguna pregunta o necesitas ayuda, por favor contacta con el administrador de la tienda o con nuestro equipo de soporte en support@metropolis.market.

Esperamos contar contigo pronto!

Atentamente,
El equipo de Metropolis Market", Config.I.AppUrl + "/signup/" + userInvite.Code, "Aceptar la invitación", null, null, null, true);
            }
            else
            {
                Send(userInvite.Email, "Welcome to Metropolis Market", @$"Hello,

You have been invited by the store admin to join Metropolis Market as a new manager. Metropolis Market is a platform that connects local sellers and buyers in your city. As a manager, you will be able to manage the store's inventory, orders, and promotions.

To accept the invitation, please click on the link below and create your account. The link will expire in 7 days.

{Config.I.AppUrl}/signup/{userInvite.Code}

If you have any questions or need any assistance, please contact the store admin or our support team at support@metropolis.market.

We look forward to having you on board!

Sincerely,
The Metropolis Market Team", Config.I.AppUrl + "/signup/" + userInvite.Code, "Accept the Invitation", null, null, null, true);
            }
        }

        public static void SendVendorManagerInviteUserExists(Vendor vendor, User user, string lang = "es")
        {
            if (Config.I == null)
                throw new Exception("MailUtil: SendVendorManagerInviteUserExists: Not configured.");
            if (user.Email == null)
                throw new Exception("MailUtil: SendVendorManagerInviteUserExists: Email is null.");

            if (lang == "es")
            {
                Send(user.Email, "Te han ascendido a gerente en Metropolis Market", @$"Hola,

El administrador de la tienda te ha ascendido a gerente en Metropolis Market. Metropolis Market es una plataforma que conecta a vendedores y compradores locales en tu ciudad. Como gerente, podrás gestionar el inventario, los pedidos y las promociones de la tienda.

Para acceder a tu panel de gerente, haz clic en el enlace de abajo e inicia sesión con tu cuenta.

{Config.I.AppUrl}/my/stores/manage/{vendor.MasterID}

Si tienes alguna pregunta o necesitas ayuda, por favor contacta con el administrador de la tienda o con nuestro equipo de soporte en support@metropolis.market.

Te felicitamos por tu ascenso!

Atentamente,
El equipo de Metropolis Market", Config.I.AppUrl + "/my/stores/manage/" + vendor.MasterID, "Acceder a tu panel de gerente", null, null, null, true);
            }
            else
            {
                Send(user.Email, " You have been invited as manager", @$"Hello,

The store admin has invited you as manager at {vendor.Name}.

To access your manager dashboard, please click on the link below and sign in with your account.

{Config.I.AppUrl}/my/stores/manage/{vendor.MasterID}

If you have any questions or need any assistance, please contact the store admin or our support team at support@metropolis.market.

We congratulate you on your promotion!

Sincerely,
The Metropolis Market Team", Config.I.AppUrl + "/my/stores/manage/" + vendor.MasterID, "Access your Manager Dashboard", null, null, null, true);
            }
        }

        public static void SendOrderCreated(Order order, User user, string lang = "es")
        {
             if (Config.I == null)
                throw new Exception("MailUtil: SendOrderCreated: Not configured.");
            if (user.Email == null)
                throw new Exception("MailUtil: SendOrderCreated: Email is null.");

            string subject = "Your order #" + order.Ident + " is being processed";
            string body = @$"Hello {user.FirstName},
            
            Your order {order.Ident} is now in process. You will receive more notifications as the vendor(s) confirm the item(s).
            
            Thank you,
            The Metropolis Market Team";
            string linkText = "Track Order";
            if(lang == "es")
            {
                subject = "To pedido #" + order.Ident + " esta en proceso";
                body = @$"Hola {user.FirstName},
            
            Su pedido {order.Ident} ya está en proceso. Recibirá más notificaciones a medida que los proveedores confirmen los artículos.
            
            Gracias,
            El equipo de mercado de Metropolis";
                linkText = "Ver Orden";
            }

            MailUtil.Send(user.Email, subject, body, Config.I.AppUrl + "/my/orders/" + order.MasterID, linkText, null, null, null, true);
        }

        public static void SendOrderCreatedVendor(Database db, Order vendorOrder, Vendor vendor)
        {
             if (Config.I == null)
                throw new Exception("MailUtil: SendOrderCreatedVendor: Not configured.");
            if (vendor == null)
                throw new Exception("MailUtil: SendOrderCreatedVendor: Email is null.");

            var users = UserVendor.GetUsers(db, vendor.ID);

            foreach(var user in users)
            {
                if(string.IsNullOrEmpty(user.Email))
                    continue;
                string subject = $"{vendor.Name}: A new order #" + vendorOrder.Ident + " has been created";
                string body = @$"Hello {user.FirstName},
                
                A customer has created an order on your {vendor.Name} store.
                Vendor Order ID: {vendorOrder.Ident}
                
                Thank you,
                The Metropolis Market Team";
                string linkText = "View Order";
                if(user.Lang == "es")
                {
                    subject = $"{vendor.Name}: Un pedido #" + vendorOrder.Ident + " fue creado";
                    body = @$"Hola {user.FirstName},
                
                        Un cliente ha creado un pedido en su tienda: {vendor.Name}.
                        Id. de pedido: {vendorOrder.Ident}
                        
                        Gracias,
                        El equipo de mercado de Metropolis";
                    linkText = "Ver Orden";
                }

                MailUtil.Send(user.Email, subject, body, Config.I.AppUrl + "/my/stores/manage/" + vendor.MasterID + "/orders/" + vendorOrder.MasterID, linkText, null, null, null, true);
            }
        }

        public static void SendOrderConfirmed(Database db, Order order, string lang = "es")
        {
             if (Config.I == null)
                throw new Exception("MailUtil: SendOrderConfirmed: Not configured.");
            var user = User.GetFromID<User>(db, order.UserID);
            if(user == null)
                throw new Exception("MailUtil: SendOrderConfirmed: User not found.");
            if (user.Email == null)
                throw new Exception("MailUtil: SendOrderConfirmed: Email is null.");

            string subject = "Your order #" + order.Ident + " is confirmed";
            string body = @$"Hello {user.FirstName},
            
            Your order {order.Ident} is confirmed. You will receive more notifications as the vendor(s) ships the item(s).
            
            Thank you,
            The Metropolis Market Team";
            string linkText = "Track Order";
            if(lang == "es")
            {
                subject = "¡Tu pedido #" + order.Ident + " está confirmado!";
                body = @$"Hola {user.FirstName},
            
            Su pedido {order.Ident} ya está confirmado. Recibirá más notificaciones a medida que los proveedores hacen el envio.
            
            Gracias,
            El equipo de mercado de Metropolis";
                linkText = "Ver Orden";
            }

            MailUtil.Send(user.Email, subject, body, Config.I.AppUrl + "/my/orders/" + order.MasterID, linkText, null, null, null, true);
        }

        public static void SendOrderCanceled(Database db, Order order, string lang = "es")
        {
             if (Config.I == null)
                throw new Exception("MailUtil: SendOrderCanceled: Not configured.");
            var user = User.GetFromID<User>(db, order.UserID);
            if(user == null)
                throw new Exception("MailUtil: SendOrderCanceled: User not found.");
            if (user.Email == null)
                throw new Exception("MailUtil: SendOrderCanceled: Email is null.");

            string subject = "Your order #" + order.Ident + " has been canceled.";
            string body = @$"Hello {user.FirstName},
            
            Your order {order.Ident} was canceled. Please contact the vendor for any questions.
            
            Thank you,
            The Metropolis Market Team";
            string linkText = "Track Order";
            if(lang == "es")
            {
                subject = "Su pedido #" + order.Ident + " ha sido cancelado.";
                body = @$"Hola {user.FirstName},
            
            Su pedido {order.Ident} fue cancelado. Si tiene preguntas por favor contactar a el vendedor.
            
            Gracias,
            El equipo de mercado de Metropolis";
                linkText = "Ver Orden";
            }

            MailUtil.Send(user.Email, subject, body, Config.I.AppUrl + "/my/orders/" + order.MasterID, linkText, null, null, null, true);
        }

        public static void SendOrderPackaged(Database db, Order order, string extra = "", string lang = "es")
        {
             if (Config.I == null)
                throw new Exception("MailUtil: SendOrderPackaged: Not configured.");
            var user = User.GetFromID<User>(db, order.UserID);
            if(user == null)
                throw new Exception("MailUtil: SendOrderPackaged: User not found.");
            if (user.Email == null)
                throw new Exception("MailUtil: SendOrderPackaged: Email is null.");

            string subject = "Your order #" + order.Ident + " is ready to ship!";
            string body = @$"Hello {user.FirstName},
            
            Your order {order.Ident} is packaged and ready to ship. You will receive more notifications as the vendor(s) ships the item(s).
            {extra}
            
            Thank you,
            The Metropolis Market Team";
            string linkText = "Track Order";
            if(lang == "es")
            {
                subject = "¡Tu pedido #" + order.Ident + " está listo para enviar!";
                body = @$"Hola {user.FirstName},
            
            Su pedido {order.Ident} está empaquetada y lista para enviar. Recibirá más notificaciones a medida que los proveedores hacen el envio.
            {extra}
            
            Gracias,
            El equipo de mercado de Metropolis";
                linkText = "Ver Orden";
            }

            MailUtil.Send(user.Email, subject, body, Config.I.AppUrl + "/my/orders/" + order.MasterID, linkText, null, null, null, true);
        }

    }
}
