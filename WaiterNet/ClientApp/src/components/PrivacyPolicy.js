import Globals from "../shared/Globals";
import BaseCom from "./BaseCom";

class PrivacyPolicy extends BaseCom {
    render() {
        const dt = '08/31/2023';

        if (Globals.currentLang === 'es') {
            return <div className="PrivacyPolicy container py-5">
                <h1>Pol&iacute;tica de Privacidad de la Plataforma de Pedido de Comida en el Local Waitr.NET</h1>
                <p><strong>&Uacute;ltima Actualizaci&oacute;n:</strong> {dt}</p>

                <p><em>LEA ATENTAMENTE ESTA POL&iacute;TICA DE PRIVACIDAD ANTES DE UTILIZAR LA PLATAFORMA DE PEDIDO DE COMIDA EN EL LOCAL WAITR.NET ("Plataforma"). AL ACCEDER O UTILIZAR LA PLATAFORMA, USTED ACEPTA LOS T&eacute;RMINOS Y CONDICIONES DE ESTA POL&iacute;TICA DE PRIVACIDAD. SI NO EST&aacute; DE ACUERDO CON ESTOS T&eacute;RMINOS, NO ACCEDA NI UTILICE LA PLATAFORMA.</em></p>

                <h2>1. Informaci&oacute;n que Recopilamos</h2>
                <p>Podemos recopilar informaci&oacute;n personal, incluyendo, entre otros, su nombre, datos de contacto y preferencias, cuando utiliza la Plataforma Waitr.NET para hacer pedidos en el restaurante.</p>

                <h2>2. Uso de la Informaci&oacute;n</h2>
                <p>Utilizamos la informaci&oacute;n recopilada para procesar sus pedidos y mejorar la experiencia de la comida. Su informaci&oacute;n tambi&eacute;n puede utilizarse para fines de comunicaci&oacute;n relacionados con sus pedidos y actualizaciones sobre la Plataforma.</p>

                <h2>3. Compartir la Informaci&oacute;n</h2>
                <p>No compartimos su informaci&oacute;n personal con terceros, excepto para el procesamiento necesario de las transacciones de pago, que es gestionado por un proveedor de pagos de terceros.</p>

                <h2>4. Seguridad</h2>
                <p>Tomamos precauciones razonables para proteger su informaci&oacute;n. Sin embargo, ning&uacute;n m&eacute;todo de transmisi&oacute;n por Internet o almacenamiento electr&oacute;nico es completamente seguro.</p>

                <h2>5. Sus Opciones</h2>
                <p>Puede optar por no proporcionar cierta informaci&oacute;n, aunque esto puede afectar su capacidad para utilizar ciertas caracter&iacute;sticas de la Plataforma.</p>

                <h2>6. Actualizaciones de la Pol&iacute;tica de Privacidad</h2>
                <p>Podemos actualizar esta Pol&iacute;tica de Privacidad de vez en cuando. La versi&oacute;n revisada ser&aacute; efectiva a partir de la fecha indicada al comienzo de la Pol&iacute;tica de Privacidad.</p>

                <p>Si tiene alguna pregunta o inquietud acerca de esta Pol&iacute;tica de Privacidad, cont&aacute;ctenos en:</p>
                <p><strong>Solusek Systems</strong><br />
                    Urb Beverly Hills Cam Palma #33<br />
                    San Juan PR 00926<br />
                    Correo Electr&oacute;nico: legal@solusek.com<br />
                    Tel&eacute;fono: (617) 447-6581</p>

                <p><strong>Fecha:</strong> {dt}</p>
            </div>;
        }

        return <div className="PrivacyPolicy container py-5">
            <h1>Privacy Policy for Waitr.NET In-Dine Food Ordering Platform</h1>
            <p><strong>Last Updated:</strong> {dt}</p>

            <p><em>PLEASE READ THIS PRIVACY POLICY CAREFULLY BEFORE USING THE WAITR.NET IN-DINE FOOD ORDERING PLATFORM ("Platform"). BY ACCESSING OR USING THE PLATFORM, YOU AGREE TO THE TERMS AND CONDITIONS OF THIS PRIVACY POLICY. IF YOU DO NOT AGREE TO THESE TERMS, DO NOT ACCESS OR USE THE PLATFORM.</em></p>

            <h2>1. Information We Collect</h2>
            <p>We may collect personal information, including but not limited to, your name, contact details, and preferences, when you use the Waitr.NET Platform to place orders in the restaurant.</p>

            <h2>2. Use of Information</h2>
            <p>We use the information collected to process your orders and improve the dining experience. Your information may also be used for communication purposes related to your orders and updates about the Platform.</p>

            <h2>3. Sharing of Information</h2>
            <p>We do not share your personal information with third parties, except for necessary processing of payment transactions which is handled by a third-party payment provider.</p>

            <h2>4. Security</h2>
            <p>We take reasonable precautions to protect your information. However, no method of transmission over the internet or electronic storage is completely secure.</p>

            <h2>5. Your Choices</h2>
            <p>You can choose not to provide certain information, although this may affect your ability to use certain features of the Platform.</p>

            <h2>6. Updates to Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. The revised version will be effective as of the date stated at the beginning of the Privacy Policy.</p>

            <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
            <p><strong>Solusek Systems</strong><br />
                Urb Beverly Hills Cam Palma #33<br />
                San Juan PR 00926<br />
                Email: legal@solusek.com<br />
                Phone: (617) 447-6581</p>

            <p><strong>Date:</strong> {dt}</p>
        </div>;
    }
}

export default PrivacyPolicy;