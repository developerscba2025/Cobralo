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
    a: 'No necesitan nada. Tus alumnos reciben un link por WhatsApp o email que abren desde el navegador para ver su estado de cuenta o pagar. Todo sin descargas ni registros. Se tiene pensado que en el futuro se añada un portal para que cada alumno pueda ver sus clases.',
  },
  {
    q: '¿Los precios suben sin aviso?',
    a: 'Nunca. Nuestros precios se actualizan mensualmente al 50% de la inflación (IPC), siempre por debajo de la inflación real. Y te avisamos con anticipación en tu dashboard antes de cualquier ajuste.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="section-padding relative overflow-hidden" style={{ background: '#0E1113' }}>
      {/* Top accent */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.1), transparent)' }}
      />

      <div className="w-full max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border"
            style={{ background: 'rgba(34,197,94,0.04)', borderColor: 'rgba(34,197,94,0.15)', color: '#4ade80' }}
          >
            Preguntas Frecuentes
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight font-accent text-white">
            Despejá tus dudas.
          </h2>
          <p className="text-sm font-medium text-zinc-500 max-w-xl mx-auto">
            Todo lo que necesitás saber sobre la gestión de tus alumnos con Cobralo.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl overflow-hidden border border-white/[0.05] transition-all duration-300"
              style={{
                background: openIndex === i ? 'rgba(255,255,255,0.02)' : 'transparent',
                borderColor: openIndex === i ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 outline-none"
              >
                <span
                  className="font-bold text-[14px] leading-snug transition-colors duration-300"
                  style={{ color: openIndex === i ? '#4ade80' : '#d4d4d8' }}
                >
                  {faq.q}
                </span>
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 border border-zinc-800"
                  style={{
                    background: openIndex === i ? '#22c55e' : 'transparent',
                    borderColor: openIndex === i ? '#22c55e' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  {openIndex === i
                    ? <Minus size={12} style={{ color: '#0E1113' }} />
                    : <Plus size={12} style={{ color: '#a1a1aa' }} />
                  }
                </div>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as any }}
                  >
                    <div className="px-6 pb-6 text-[13.5px] leading-relaxed text-zinc-500 font-medium">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
