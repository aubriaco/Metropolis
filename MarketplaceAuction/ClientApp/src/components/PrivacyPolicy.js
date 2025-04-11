import Globals from "../shared/Globals";
import BaseCom from "./BaseCom";
import L from "./Lang";

export default class PrivacyPolicy extends BaseCom {
    render() {
        var content;
        if (Globals.currentLang === 'es') {
            content = <>
                Esta Pol&iacute;tica de Privacidad rige la forma en que Bidea Online ("nosotros," "nuestro," o "nos") recopila, utiliza, mantiene y divulga la informaci&oacute;n recopilada de los usuarios ("t&uacute;" o "tu") del sitio web y plataforma de Bidea Online ("Plataforma"). Nos comprometemos a proteger tu privacidad y garantizar la seguridad de la informaci&oacute;n que proporcionas al utilizar nuestra Plataforma.
                <br /><br />
                Informaci&oacute;n que Recopilamos:
                <br /><br />
                a. Informaci&oacute;n Personal: Podemos recopilar informaci&oacute;n personal, como tu nombre, direcci&oacute;n de correo electr&oacute;nico, datos de contacto y otra informaci&oacute;n que nos proporcionas voluntariamente al registrar una cuenta o interactuar con la Plataforma.
                <br /><br />
                b. Informaci&oacute;n de Transacciones: Podemos recopilar informaci&oacute;n relacionada con tus transacciones en la Plataforma, incluyendo el historial de pujas, historial de compras y detalles de pago.
                <br /><br />
                c. Informaci&oacute;n de Uso: Podemos recopilar informaci&oacute;n no personal sobre c&oacute;mo utilizas y navegas por la Plataforma, incluyendo direcciones IP, tipo de navegador, sistema operativo y URLs de referencia.
                <br /><br />
                Uso de la Informaci&oacute;n Recopilada:
                <br /><br />
                a. Podemos utilizar la informaci&oacute;n que recopilamos para diversos fines, incluyendo:
                <br /><br />
                Proporcionar y mejorar nuestros servicios, incluyendo facilitar subastas, procesar transacciones y resolver disputas.<br />
                Personalizar la experiencia del usuario y ofrecer contenido y ofertas relevantes.<br />
                Comunicarnos contigo, responder consultas y brindar soporte al cliente.<br />
                Hacer cumplir nuestros t&eacute;rminos y pol&iacute;ticas y prevenir actividades fraudulentas.<br />
                Analizar y monitorear patrones y tendencias de uso con fines de investigaci&oacute;n y an&aacute;lisis.
                Compartir Informaci&oacute;n:
                <br /><br />
                a. No vendemos, comerciamos o alquilamos tu informaci&oacute;n personal a terceros. Sin embargo, podemos compartir tu informaci&oacute;n con terceros de confianza que nos ayudan a operar nuestra Plataforma y brindarte servicios, siempre y cuando se comprometan a mantener la informaci&oacute;n confidencial.
                <br /><br />
                b. Tambi&eacute;n podemos divulgar tu informaci&oacute;n en respuesta a procesos legales, solicitudes gubernamentales exigibles o para proteger nuestros derechos, privacidad, seguridad o propiedad, o los derechos, privacidad, seguridad o propiedad de terceros.
                <br /><br />
                Medidas de Seguridad:
                <br /><br />
                a. Tomamos medidas de seguridad apropiadas para proteger tu informaci&oacute;n personal contra acceso no autorizado, alteraci&oacute;n, divulgaci&oacute;n o destrucci&oacute;n. Estas medidas incluyen el uso de cifrado, almacenamiento seguro y acceso restringido a los datos personales.
                <br /><br />
                Cookies y Tecnolog&iacute;as de Seguimiento:
                <br /><br />
                a. Podemos utilizar cookies y tecnolog&iacute;as de seguimiento similares para mejorar la experiencia del usuario, analizar patrones de uso y recopilar informaci&oacute;n sobre las preferencias de los usuarios. Puedes elegir desactivar las cookies en la configuraci&oacute;n de tu navegador, pero esto puede afectar la funcionalidad de la Plataforma.
                <br /><br />
                Sitios Web de Terceros:
                <br /><br />
                a. La Plataforma puede contener enlaces a sitios web de terceros. No somos responsables de las pr&aacute;cticas de privacidad o el contenido de dichos sitios web. Te recomendamos revisar las pol&iacute;ticas de privacidad de estos sitios web de terceros antes de proporcionar cualquier informaci&oacute;n personal.
                <br /><br />
                Privacidad de los Ni&ntilde;os:
                <br /><br />
                a. La Plataforma no est&aacute; destinada a ser utilizada por personas menores de 18 a&ntilde;os. No recopilamos de manera intencionada informaci&oacute;n personal de ni&ntilde;os. Si crees que hemos recopilado informaci&oacute;n de un ni&ntilde;o por error, por favor cont&aacute;ctanos de inmediato y tomaremos las medidas necesarias para eliminar la informaci&oacute;n de nuestros registros.
                <br /><br />
                Cambios a esta Pol&iacute;tica de Privacidad:
                <br /><br />
                a. Nos reservamos el derecho de actualizar o modificar esta Pol&iacute;tica de Privacidad en cualquier momento. Cualquier cambio ser&aacute; publicado en esta p&aacute;gina y la fecha de revisi&oacute;n se indicar&aacute; en la parte superior de la pol&iacute;tica. Es tu responsabilidad revisar peri&oacute;dicamente esta pol&iacute;tica para cualquier actualizaci&oacute;n.
                <br /><br />
                Cont&aacute;ctanos:
                <br /><br />
                a. Si tienes alguna pregunta o inquietud acerca de esta Pol&iacute;tica de Privacidad o nuestras pr&aacute;cticas de privacidad, por favor cont&aacute;ctanos en: <i>support@bideaonline.com</i>
                <br /><br />
                Esta Pol&iacute;tica de Privacidad es efectiva a partir de Julio 7, 2023 y reemplaza a cualquier versi&oacute;n anterior.
                <br /><br />
                Nota: Esta Pol&iacute;tica de Privacidad se proporciona como una plantilla general y debe ser personalizada para que se ajuste a tus pr&aacute;cticas de privacidad y requisitos legales espec&iacute;ficos.
            </>
        }
        else {
            content = <>
                This Privacy Policy governs the manner in which Bidea Online ("we," "our," or "us") collects, uses, maintains, and discloses information collected from users ("you" or "your") of the Bidea Online website and platform ("Platform"). We are committed to protecting your privacy and ensuring the security of the information you provide while using our Platform.
                <br /><br />
                Information We Collect:
                <br /><br />
                a. Personal Information: We may collect personal information, such as your name, email address, contact details, and other information you voluntarily provide to us when registering an account or interacting with the Platform.
                <br /><br />
                b. Transaction Information: We may collect information related to your transactions on the Platform, including bid history, purchase history, and payment details.
                <br /><br />
                c. Usage Information: We may collect non-personal information about how you use and navigate the Platform, including IP addresses, browser type, operating system, and referring URLs.
                <br /><br />
                Use of Collected Information:
                <br /><br />
                a. We may use the information we collect for various purposes, including:
                <br /><br />
                To provide and improve our services, including facilitating auctions, processing transactions, and resolving disputes.<br />
                To personalize user experience and deliver relevant content and offers.<br />
                To communicate with you, respond to inquiries, and provide customer support.<br />
                To enforce our terms and policies and prevent fraudulent activities.<br />
                To analyze and monitor usage patterns and trends for research and analytics purposes.
                Information Sharing:
                <br /><br />
                a. We do not sell, trade, or rent your personal information to third parties. However, we may share your information with trusted third parties who assist us in operating our Platform and providing services to you, as long as they agree to keep the information confidential.
                <br /><br />
                b. We may also disclose your information in response to legal processes, enforceable governmental requests, or to protect our rights, privacy, safety, or property, or the rights, privacy, safety, or property of others.
                <br /><br />
                Security Measures:
                <br /><br />
                a. We take appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include the use of encryption, secure storage, and restricted access to personal data.
                <br /><br />
                Cookies and Tracking Technologies:
                <br /><br />
                a. We may use cookies and similar tracking technologies to enhance user experience, analyze usage patterns, and gather information about users' preferences. You may choose to disable cookies in your browser settings, but this may affect the functionality of the Platform.
                <br /><br />
                Third-Party Websites:
                <br /><br />
                a. The Platform may contain links to third-party websites. We are not responsible for the privacy practices or content of such websites. We encourage you to review the privacy policies of these third-party websites before providing any personal information.
                <br /><br />
                Children's Privacy:
                <br /><br />
                a. The Platform is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately, and we will take appropriate steps to remove the information from our records.
                <br /><br />
                Changes to this Privacy Policy:
                <br /><br />
                a. We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page, and the revised date will be indicated at the top of the policy. It is your responsibility to review this policy periodically for any updates.
                <br /><br />
                Contact Us:
                <br /><br />
                a. If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at: <i>support@bideaonline.com</i>
                <br /><br />
                This Privacy Policy is effective as of July 7, 2023 and supersedes any prior versions.
                <br /><br />
                Note: This Privacy Policy is provided as a general template and should be customized to align with your specific privacy practices and legal requirements.
            </>;
        }

        return <div className="container-narrow">
            <h1 className="text-center mb-5"><L>Privacy Policy</L></h1>
            <div className="mb-5">
                {content}
            </div>
        </div>
    }
}