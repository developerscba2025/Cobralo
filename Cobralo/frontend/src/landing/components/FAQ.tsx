import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: '¿Para quién es Cobralo?',
    a: 'Para cualquier profesional independiente que hoy gestiona sus alumnos o clientes con Excel, cuadernos o mensajes de WhatsApp sueltos. Profesores de yoga, inglés, piano, entrenadores personales, nutricionistas… si tenés alumnos y cobrás por clase o mensualmente, Cobralo es para vos.',
  },
  {
    q: '¿Tienen plan gratuito?',
    a: 'Sí. Al registrarte accedés a 14 días de prueba con todas las funciones PRO activadas, sin necesidad de tarjeta de crédito. Luego podés quedarte con el Plan Básico a $5.242/mes (con 25% OFF de lanzamiento) o pasarte a Pro.',
  },
  {
    q: '¿Cómo recibo los pagos de mis alumnos?',
    a: 'Cobralo no retiene tu dinero. Los pagos van directo a tu CBU, alias o cuenta de Mercado Pago. Nosotros generamos el link de pago automáticamente y vos trackeás quién pagó y quién no, todo en un solo lugar.',
  },
  {
    q: '¿Cobran comisión por mis ventas?',
    a: 'No, cero comisiones de nuestra parte. Mercado Pago aplica su tarifa estándar (entre 0.99% y 6.39% + IVA según el medio de pago). Nosotros sólo cobramos la suscripción mensual fija.',
  },
  {
    q: '¿Cómo funciona el WhatsApp automático?',
    a: 'Configurás tu plantilla de mensaje con variables como {alumno}, {monto} y {servicio}. Con un clic enviás recordatorios de cobro a todos los que tienen pagos pendientes. En el plan Pro también podés automatizar el aviso de clases con confirmación de asistencia.',
  },
  {
    q: '¿Qué pasa si mis alumnos no tienen la app?',
    a: 'No necesitan nada. Tus alumnos reciben un link por WhatsApp o email que abren desde el navegador para ver su estado de cuenta o pagar. Todo sin descargas ni registros.',
  },
  {
    q: '¿Los precios suben sin aviso?',
    a: 'Nunca. Nuestros precios se actualizan mensualmente al 50% de la inflación (IPC), siempre por debajo de la inflación real. Y te avisamos con anticipación en tu dashboard antes de cualquier ajuste.',
  },
  {
    q: '¿Puedo importar mis alumnos existentes?',
    a: 'Sí. Podés cargar tus alumnos manualmente, uno a uno, o importarlos desde un CSV. La configuración completa lleva menos de 2 minutos.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="section-padding relative overflow-hidden" style={{ background: '#0E1113' }}>
      {/* Top accent */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.15), transparent)' }}
      />
      {/* Glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center bottom, rgba(34,197,94,0.07) 0%, transparent 70%)' }}
      />

      <div className="container max-w-3xl relative z-10">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] mb-5 border"
            style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)', color: '#4ade80' }}
          >
            FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight" style={{ color: '#fafafa' }}>
            Preguntas{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, rgba(255,255,255,0.8) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              frecuentes.
            </span>
          </h2>
          <p className="text-base font-medium" style={{ color: '#a1a1aa' }}>
            Todo lo que necesitás saber para empezar hoy mismo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="rounded-2xl overflow-hidden transition-colors duration-200 h-fit"
              style={{
                background: '#171A1D',
                border: openIndex === i
                  ? '1px solid rgba(34,197,94,0.25)'
                  : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                <span
                  className="font-bold text-[14px] leading-snug"
                  style={{ color: openIndex === i ? '#4ade80' : '#fafafa' }}
                >
                  {faq.q}
                </span>
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: openIndex === i ? '#22c55e' : 'rgba(255,255,255,0.06)',
                  }}
                >
                  {openIndex === i
                    ? <Minus size={14} style={{ color: '#0E1113' }} />
                    : <Plus size={14} style={{ color: '#a1a1aa' }} />
                  }
                </div>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-5 text-[13px] leading-relaxed font-medium" style={{ color: '#a1a1aa' }}>
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA removed for cleaner layout */}
      </div>
    </section>
  );
};

export default FAQ;
