import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

const LegalModal = ({ isOpen, onClose, type }: LegalModalProps) => {
  const content = {
    terms: {
      title: 'Términos y Condiciones',
      body: `
        ### 1. Identificación de las Partes
        El presente acuerdo se celebra entre Cobralo (en adelante "Cobralo" o el "Servicio") y el Usuario, entendiéndose por tal a toda persona humana mayor de 18 años, con plena capacidad legal para contratar y que desarrolle una actividad comercial lícita de forma independiente.

        ### 2. Descripción del Servicio
        Cobralo es una plataforma de software (SaaS) diseñada para la gestión operativa de alumnos, cobros, asistencias y comunicación. Cobralo NO es un procesador de pagos, NO es una entidad financiera ni un banco, y NO brinda asesoramiento fiscal ni contable.

        ### 3. Condiciones de Alta y Elegibilidad
        Para utilizar el Servicio, el Usuario debe proporcionar datos verídicos y actualizados. La cuenta es personal, única e intransferible. El uso de identidades falsas o la duplicación de cuentas podrá resultar en la baja inmediata del Servicio.

        ### 4. Pagos, Planes y Facturación
        Los precios y planes están detallados en el sitio. La facturación es mensual/anual con renovación automática. En caso de fallo en el pago, la cuenta entrará en un período de gracia de 7 días antes de la suspensión temporal de las funcionalidades de edición.

        ### 5. Pagos de Alumnos y Deslinde de Responsabilidad
        Cobralo facilita el registro y seguimiento de pagos, pero los fondos fluyen exclusivamente a través de plataformas externas (como Mercado Pago) o transferencias directas. Cobralo no tiene responsabilidad ni injerencia sobre transacciones fallidas, disputas o retenciones de fondos en dichas plataformas.

        ### 6. Propiedad Intelectual
        Todo el software, código, diseño, marcas y contenidos de Cobralo son propiedad exclusiva de la empresa. El Usuario conserva la propiedad de los datos que carga, otorgando a Cobralo una licencia limitada y necesaria para la prestación técnica del servicio.

        ### 7. Uso Aceptable y Prohibiciones
        Queda terminantemente prohibido: utilizar el Servicio para fines ilícitos, realizar ingeniería inversa del software, enviar comunicaciones no autorizadas (spam) a los alumnos o cargar información falsa o difamatoria.

        ### 8. Limitación de Responsabilidad
        Cobralo no será responsable por lucro cesante, pérdida de datos o daños indirectos. La responsabilidad máxima de Cobralo no superará, en ningún caso, el monto abonado por el Usuario en los últimos 3 meses de servicio.

        ### 9. Jurisdicción y Ley Aplicable
        Este acuerdo se rige por las leyes de la República Argentina. Para cualquier controversia, las partes se someten a la jurisdicción de los Tribunales Ordinarios de la Ciudad de Córdoba, renunciando a cualquier otro fuero.

        ### 10. Cancelación y Baja del Servicio
        El Usuario puede cancelar su suscripción en cualquier momento desde la configuración. Cobralo se reserva el derecho de rescindir el servicio unilateralmente ante incumplimientos graves de estos términos.

        ### 11. Disponibilidad y Mantenimiento
        Nos comprometemos a un esfuerzo razonable para alcanzar una disponibilidad (uptime) del 99% mensual. El mantenimiento programado se realiza preferentemente los domingos entre las 02:00 y 04:00 AM (hora Arg), pudiendo haber interrupciones breves.

        ### 12. Responsabilidad Fiscal del Usuario
        El Usuario es el único responsable de cumplir con sus obligaciones impositivas y de facturación ante la AFIP u otros organismos pertinentes. Cobralo no emite facturas en nombre del Usuario ni actúa como agente de retención.

        ### 13. Modificaciones al Servicio y Precios
        Cobralo podrá modificar funcionalidades o precios notificando al Usuario con al menos 30 días de anticipación vía correo electrónico o avisos en la plataforma.

        ### 14. Acuerdo de Procesamiento de Datos (DPA)
        Respecto a los datos de terceros (alumnos) cargados por el Usuario, Cobralo actúa como "Encargado de Tratamiento" bajo las instrucciones del Usuario, quien es el "Responsable de los Datos". Ambas partes se comprometen al cumplimiento de la Ley 25.326.
      `
    },
    privacy: {
      title: 'Política de Privacidad',
      body: `
        ### 1. Identidad del Responsable
        Cobralo es operado por Cobralo App S.A.S. (en formación), con domicilio en la Ciudad de Córdoba, Argentina. Contacto para asuntos de privacidad: privacidad@cobralo.info.

        ### 2. Qué Datos se Recopilan
        Recopilamos: nombre completo, correo electrónico, CUIT/DNI del Usuario, así como nombre, contacto y registros de asistencia/pago de sus alumnos. También recopilamos datos de uso técnico, dirección IP y cookies esenciales.

        ### 3. Para qué se Usan los Datos
        Finalidades: (a) Gestión y mantenimiento de cuenta, (b) Envío de notificaciones y recordatorios a alumnos (a pedido del usuario), (c) Soporte técnico y resolución de consultas, (d) Mejora del producto mediante analíticas anónimas.

        ### 4. Base Legal — Ley 25.326
        El tratamiento de sus datos se realiza bajo su consentimiento expreso y para la ejecución del contrato de servicio, de plena conformidad con la Ley de Protección de Datos Personales 25.326 de la República Argentina.

        ### 5. Con quién se Comparten los Datos
        Compartimos datos solo con proveedores esenciales: Mercado Pago (pagos), Google Cloud/AWS (alojamiento), PostHog (analíticas) y servicios de envío de emails. NO vendemos ni alquilamos sus datos a terceros con fines publicitarios.

        ### 6. Dónde se Almacenan los Datos
        Los datos se almacenan en servidores de alta seguridad ubicados en EE.UU. u otros centros de datos globales de proveedores líderes. En caso de transferencia internacional, se garantizan niveles de protección adecuados según estándares legales.

        ### 7. Por cuánto Tiempo se Conservan
        Los datos se conservan mientras la cuenta esté activa. Al solicitar la baja, el Usuario tiene 30 días para exportar su información; luego de este plazo, los datos son eliminados o anonimizados, excepto registros de auditoría obligatorios.

        ### 8. Derechos del Usuario (ARCO)
        Usted tiene derecho a acceder, rectificar, cancelar u oponerse al tratamiento de sus datos personales. Puede ejercer estos derechos enviando un correo a privacidad@cobralo.info. Responderemos en un plazo máximo de 30 días hábiles.

        ### 9. Política de Cookies
        Utilizamos cookies de sesión (esenciales) para el correcto funcionamiento del login y cookies de preferencia. No utilizamos cookies de rastreo publicitario de terceros. Usted puede gestionar las cookies desde la configuración de su navegador.

        ### 10. Datos de Menores de Edad
        Si los alumnos gestionados en la plataforma son menores de edad, el Usuario garantiza contar con el consentimiento de los tutores legales para la carga de dichos datos. Cobralo actúa exclusivamente como encargado técnico del tratamiento.

        ### 11. Seguridad Técnica
        Implementamos cifrado en tránsito (TLS/HTTPS), encriptación de datos sensibles en reposo, backups diarios y estrictos controles de acceso por roles para garantizar la integridad y confidencialidad de la información.

        ### 12. Cambios en la Política
        Cualquier actualización sustancial de esta política será notificada al Usuario a través de la plataforma o por correo electrónico con al menos 10 días de anticipación a su entrada en vigencia.
      `
    }
  };

  const current = content[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0f0a] border border-white/10 rounded-3xl p-8 max-h-[80vh] overflow-y-auto shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-black mb-6 text-white">{current.title}</h2>
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="space-y-6 text-text-muted leading-relaxed">
                {current.body.split('\n\n').map((block, i) => (
                  <div key={i}>
                    {block.trim().startsWith('###') ? (
                      <h4 className="text-white font-bold mb-2">{block.replace('###', '').trim()}</h4>
                    ) : (
                      <p>{block.trim()}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LegalModal;
