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
      title: 'T\u00e9rminos y Condiciones',
      body: `
        ### 1. Identificaci\u00f3n de las Partes
        El presente acuerdo se celebra entre Cobralo (en adelante "Cobralo" o el "Servicio") y el Usuario, entendi\u00e9ndose por tal a toda persona humana mayor de 18 a\u00f1os, con plena capacidad legal para contratar y que desarrolle una actividad comercial l\u00edcita de forma independiente.

        ### 2. Descripci\u00f3n del Servicio
        Cobralo es una plataforma de software (SaaS) dise\u00f1ada para la gesti\u00f3n operativa de alumnos, cobros, asistencias y comunicaci\u00f3n. Cobralo NO es un procesador de pagos, NO es una entidad financiera ni un banco, y NO brinda asesoramiento fiscal ni contable.

        ### 3. Condiciones de Alta y Elegibilidad
        Para utilizar el Servicio, el Usuario debe proporcionar datos ver\u00eddicos y actualizados. La cuenta es personal, \u00fanica e intransferible. El uso de identidades falsas o la duplicaci\u00f3n de cuentas podr\u00e1 resultar en la baja inmediata del Servicio.

        ### 4. Pagos, Planes y Facturaci\u00f3n (Ajuste IPC)
        Los precios y planes est\u00e1n detallados en el sitio. La facturaci\u00f3n es mensual/anual con renovaci\u00f3n autom\u00e1tica. **Importante:** Los precios de los planes est\u00e1n sujetos a modificaciones mensuales basadas en el **50% del \u00cdndice de Precios al Consumidor (IPC)** oficial de Argentina. Cualquier ajuste ser\u00e1 notificado con al menos 10 d\u00edas de antelaci\u00f3n.

        ### 5. Pagos de Alumnos y Terceros (Mercado Pago / WhatsApp)
        Cobralo facilita el registro de pagos, pero los fondos fluyen v\u00eda plataformas externas (como Mercado Pago). Cobralo no tiene responsabilidad sobre transacciones fallidas o retenciones. Asimismo, ante el env\u00edo de notificaciones por WhatsApp, Cobralo no se responsabiliza por la interacci\u00f3n del profesor con dicha plataforma ni por posibles bloqueos, demoras o fallos en la entrega. Se recomienda fuertemente el uso de **WhatsApp Business** para una gesti\u00f3n profesional y segura.

        ### 6. Propiedad Intelectual
        Todo el software, c\u00f3digo, dise\u00f1o, marcas y contenidos de Cobralo son propiedad exclusiva de la empresa. El Usuario conserva la propiedad de los datos que carga, otorgando a Cobralo una licencia limitada para la prestaci\u00f3n de servicio.

        ### 7. Uso Aceptable y Prohibiciones
        Queda terminantemente prohibido: utilizar el Servicio para fines il\u00edcitos, enviar spam a los alumnos, realizar ingenier\u00eda inversa o cargar informaci\u00f3n falsa o difamatoria.

        ### 8. Limitaci\u00f3n de Responsabilidad
        Cobralo no ser\u00e1 responsable por lucro cesante o p\u00e9rdida de datos. Nuestra responsabilidad m\u00e1xima no superar\u00e1 el monto abonado por el Usuario en los \u00faltimos 3 meses de servicio previo al incidente.

        ### 9. Jurisdicci\u00f3n y Ley Aplicable
        Este acuerdo se rige por las leyes de la Rep\u00fablica Argentina. Cualquier controversia se somete a la jurisdicci\u00f3n de los Tribunales Ordinarios de la Ciudad de C\u00f3rdoba, renunciando a cualquier otro fuero.

        ### 10. Cancelaci\u00f3n y Baja del Servicio
        El Usuario puede cancelar su suscripci\u00f3n en cualquier momento. Cobralo se reserva el derecho de rescindir el servicio unilateralmente ante incumplimientos graves o falta de pago persistente pasada la semana de gracia.

        ### 11. Disponibilidad y Mantenimiento
        Nos comprometemos a un esfuerzo razonable para alcanzar una disponibilidad del 99% mensual. El mantenimiento programado se realiza preferentemente en horarios de baja demanda (domingos madrugada).

        ### 12. Responsabilidad Fiscal (AFIP / ARCA)
        El Usuario es el \u00fanico responsable de cumplir con sus obligaciones impositivas. Cobralo act\u00faa como un intermediario t\u00e9cnico y no es responsable de la validez de los certificados fiscales ni de la veracidad de la facturaci\u00f3n emitida por el Usuario.

        ### 13. Modificaciones al Servicio y Precios
        Cobralo podr\u00e1 modificar funcionalidades o precios notificando al Usuario con al menos **10 d\u00edas de anticipaci\u00f3n** a trav\u00e9s de la plataforma o por correo electr\u00f3nico.

        ### 14. Acuerdo de Procesamiento de Datos (DPA)
        Cobralo act\u00faa como "Encargado de Tratamiento" de los datos de alumnos cargados por el Usuario, quien es el "Responsable de los Datos". Ambas partes deben cumplir con la Ley 25.326 de Protecci\u00f3n de Datos Personales.
      `
    },
    privacy: {
      title: 'Pol\u00edtica de Privacidad',
      body: `
        ### 1. Identidad del Responsable
        Cobralo es operado por Cobralo App S.A.S. (en formaci\u00f3n), con domicilio en la Ciudad de C\u00f3rdoba, Argentina. Contacto: privacidad@cobralo.info.

        ### 2. Qu\u00e9 Datos se Recopilan
        Recopilamos: datos del Usuario (nombre, email, CUIT/DNI) y datos de sus alumnos (nombre, contacto, pagos). Tambi\u00e9n datos t\u00e9cnicos autom\u00e1ticos (IP, cookies esenciales) para seguridad y funcionamiento.

        ### 3. Finalidad del Tratamiento
        Los datos se usan para: (a) Gesti\u00f3n de cuenta y suscripci\u00f3n, (b) Env\u00edo de recordatorios autom\u00e1ticos (v\u00eda email/WhatsApp), (c) Soporte t\u00e9cnico y (d) Mejora del producto mediante anal\u00edticas an\u00f3nimas.

        ### 4. Base Legal \u2014 Ley 25.326
        Tratamos sus datos bajo su consentimiento y la ejecuci\u00f3n del contrato de servicio, en total conformidad con la Ley de Protecci\u00f3n de Datos Personales de la Rep\u00fablica Argentina.

        ### 5. Proveedores y Terceros
        Solo compartimos datos con servicios esenciales: Mercado Pago (pagos), Google Cloud (alojamiento), Twilio/WhatsApp API (notificaciones) y herramientas de anal\u00edtica. No vendemos datos a terceros con fines publicitarios.

        ### 6. Transferencia Internacional
        Los datos pueden ser procesados en servidores ubicados fuera de Argentina (p. ej. EE.UU.), garantizando siempre niveles de protecci\u00f3n adecuados seg\u00fan est\u00e1ndares internacionales.

        ### 7. Per\u00edodo de Conservaci\u00f3n
        Los datos se conservan mientras la cuenta est\u00e9 activa. Al darse de baja, se otorga un plazo de 30 d\u00edas para exportar la informaci\u00f3n antes de su eliminaci\u00f3n o anonimizaci\u00f3n definitiva.

        ### 8. Derechos ARCO
        Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales. Escr\u00edbanos a privacidad@cobralo.info para ejercer estos derechos.

        ### 9. Pol\u00edtica de Cookies
        Usamos solo cookies esenciales para el login y preferencias de usuario. No utilizamos cookies de rastreo publicitario de terceros.

        ### 10. Datos de Menores (Consentimiento)
        Dado que el Servicio permite gestionar datos de alumnos menores de edad, el Usuario (academia/profesor) **garantiza taxativamente** contar con la autorizaci\u00f3n de los padres o tutores legales antes de cargar dicha informaci\u00f3n.

        ### 11. Seguridad de la Informaci\u00f3n
        Aplicamos cifrado TLS/HTTPS en tr\u00e1nsito, backups peri\u00f3dicos y encriptaci\u00f3n de datos sensibles para proteger su informaci\u00f3n contra accesos no autorizados.

        ### 12. Cambios en la Pol\u00edtica
        Cualquier cambio sustancial ser\u00e1 notificado v\u00eda plataforma o email con al menos 10 d\u00edas de antelaci\u00f3n. El uso continuo del servicio implica la aceptaci\u00f3n de los nuevos t\u00e9rminos.
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
            className="relative w-full max-w-2xl bg-surface border border-border-main rounded-3xl p-8 max-h-[80vh] overflow-y-auto hide-scrollbar shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-all cursor-pointer z-10"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-black mb-6 text-zinc-900 dark:text-emerald-50 uppercase tracking-tight font-accent">{current.title}</h2>
            <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none">
              <div className="space-y-6 text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                {current.body.split('\n\n').map((block, i) => (
                  <div key={i}>
                    {block.trim().startsWith('###') ? (
                      <h4 className="text-zinc-900 dark:text-emerald-400 font-black uppercase tracking-widest text-[10px] mb-3 mt-8">{block.replace('###', '').trim()}</h4>
                    ) : (
                      <p className="text-sm">{block.trim()}</p>
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
