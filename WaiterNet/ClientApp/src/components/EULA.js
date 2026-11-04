import Globals from "../shared/Globals";
import BaseCom from "./BaseCom";

class EULA extends BaseCom {
    render() {
        const dt = '08/31/2023';
        if (Globals.currentLang === 'es') {
            
            return <div className="EULA container py-5">
                <h1>Contrato de Licencia para el Usuario Final (CLUF) para Clientes de Restaurantes</h1>
                <p><strong>&Uacute;ltima Actualizaci&oacute;n:</strong> {dt}</p>

                <p><em>LEA DETENIDAMENTE ESTE CONTRATO DE LICENCIA PARA EL USUARIO FINAL ("CLUF") ANTES DE UTILIZAR LA PLATAFORMA WAITR.NET ("Plataforma"). AL ACCEDER O UTILIZAR LA PLATAFORMA, USTED ACEPTA ESTAR VINCULADO POR LOS T&Eacute;RMINOS Y CONDICIONES DE ESTE CLUF. SI NO ACEPTA ESTOS T&Eacute;RMINOS, NO ACCEDA NI UTILICE LA PLATAFORMA.</em></p>

                <h2>1. Aceptaci&oacute;n de T&eacute;rminos</h2>
                <p>Este CLUF es un acuerdo legal entre su restaurante ("Usted" o "Su") y Solusek Systems ("Empresa," "Nosotros," "Nos" o "Nuestro"). Al acceder o utilizar la Plataforma Waitr.NET, Usted acepta cumplir con los t&eacute;rminos y condiciones establecidos en este CLUF.</p>

                <h2>2. Concesi&oacute;n de Licencia</h2>
                <p>Sujeto a los t&eacute;rminos de este CLUF, la Empresa otorga a Su restaurante una licencia no exclusiva, no transferible y revocable para acceder y utilizar la Plataforma Waitr.NET con el prop&oacute;sito de facilitar la realizaci&oacute;n de pedidos de comida en su restaurante.</p>

                <h2>3. Obligaciones del Usuario</h2>
                <p>a. Usted deber&aacute; utilizar la Plataforma Waitr.NET cumpliendo con todas las leyes y regulaciones aplicables.</p>
                <p>b. Usted reconoce que cualquier procesamiento de pagos asociado con la Plataforma es responsabilidad de un proveedor de pagos de terceros, y la Empresa no ser&aacute; responsable por problemas relacionados con los pagos.</p>
                <p>c. Usted no intentar&aacute; modificar, ingeniar inversamente ni crear obras derivadas basadas en la Plataforma Waitr.NET.</p>
                <p>d. Usted garantizar&aacute; la confidencialidad de sus credenciales de inicio de sesi&oacute;n y no las compartir&aacute; con personas no autorizadas.</p>

                <h2>4. Propiedad</h2>
                <p>La Plataforma Waitr.NET, incluidos todos los derechos de propiedad intelectual, sigue siendo propiedad exclusiva de la Empresa. Este CLUF no le otorga derechos sobre patentes, derechos de autor, marcas comerciales ni ning&uacute;n otro derecho de propiedad intelectual en la Plataforma Waitr.NET.</p>

                <h2>5. Limitaci&oacute;n de Responsabilidad</h2>
                <p>La Empresa no ser&aacute; responsable de ning&uacute;n da&ntilde;o indirecto, incidental, especial, consecuencial o punitivo, ni de la p&eacute;rdida de ganancias o ingresos, ya sea incurrida directa o indirectamente, ni de la p&eacute;rdida de datos, uso, buena voluntad u otras p&eacute;rdidas intangibles.</p>

                <h2>6. Terminaci&oacute;n</h2>
                <p>Este CLUF es v&aacute;lido hasta que se resuelva. La Empresa puede finalizar este CLUF de inmediato si usted incumple alguno de sus t&eacute;rminos. Al finalizarlo, deber&aacute; cesar todo uso de la Plataforma Waitr.NET.</p>

                <h2>7. Ley Aplicable</h2>
                <p>Este CLUF se regir&aacute; y se interpretar&aacute; de acuerdo con las leyes de [Su Jurisdicci&oacute;n], sin tener en cuenta sus conflictos de leyes.</p>

                <p>Si tiene alguna pregunta o inquietud acerca de este CLUF, cont&aacute;ctenos en:</p>

                <p><strong>Solusek Systems</strong><br />
                    Urb Beverly Hills Cam Palma #33<br />
                    San Juan PR 00926<br />
                    Correo Electr&oacute;nico: legal@solusek.com<br />
                    Tel&eacute;fono: (617) 447-6581</p>

                <p><strong>Fecha:</strong> {dt}</p>
            </div>;
        }

        return <div className="EULA container doc py-5">
            <h1>End-User License Agreement (EULA) for Restaurant Clients</h1>
            <p><strong>Last Updated:</strong> {dt}</p>

            <p><em>PLEASE READ THIS END-USER LICENSE AGREEMENT ("EULA") CAREFULLY BEFORE USING THE WAITR.NET PLATFORM ("Platform"). BY ACCESSING OR USING THE PLATFORM, YOU AGREE TO BE BOUND BY THE TERMS AND CONDITIONS OF THIS EULA. IF YOU DO NOT AGREE TO THESE TERMS, DO NOT ACCESS OR USE THE PLATFORM.</em></p>

            <h2>1. Acceptance of Terms</h2>
            <p>This EULA is a legal agreement between your restaurant ("You" or "Your") and Solusek Systems ("Company," "We," "Us," or "Our"). By accessing or using the Waitr.NET Platform, You agree to comply with and be bound by the terms and conditions outlined in this EULA.</p>

            <h2>2. License Grant</h2>
            <p>Subject to the terms of this EULA, Company grants Your restaurant a non-exclusive, non-transferable, revocable license to access and use the Waitr.NET Platform for the purpose of facilitating in-dine food ordering at Your restaurant.</p>

            <h2>3. User Obligations</h2>
            <p>a. You shall use the Waitr.NET Platform in compliance with all applicable laws and regulations.</p>
            <p>b. You acknowledge that any payment processing associated with the Platform is the responsibility of a third-party payment provider, and Company shall not be responsible for any payment-related issues.</p>
            <p>c. You shall not attempt to modify, reverse engineer, or create derivative works based on the Waitr.NET Platform.</p>
            <p>d. You shall ensure the confidentiality of Your login credentials and shall not share them with unauthorized individuals.</p>

            <h2>4. Ownership</h2>
            <p>The Waitr.NET Platform, including all intellectual property rights, remains the sole property of Company. This EULA does not grant You any rights to patents, copyrights, trademarks, or any other intellectual property rights in the Waitr.NET Platform.</p>

            <h2>5. Limitation of Liability</h2>
            <p>Company shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.</p>

            <h2>6. Termination</h2>
            <p>This EULA is effective until terminated. Company may terminate this EULA immediately if You breach any of its terms. Upon termination, You shall cease all use of the Waitr.NET Platform.</p>

            <h2>7. Governing Law</h2>
            <p>This EULA shall be governed by and construed in accordance with the laws of Puerto Rico and USA, without regard to its conflict of law principles.</p>

            <p>If You have any questions or concerns regarding this EULA, please contact us at:</p>
            <p><strong>Solusek Systems</strong><br />
                Urb Beverly Hills Cam Palma #33<br />
                San Juan PR 00926<br />
                Email: legal@solusek.com<br />
                Phone: (617) 447-6581</p>

            <p><strong>Date:</strong> {dt}</p>
        </div>;
    }
}

export default EULA;