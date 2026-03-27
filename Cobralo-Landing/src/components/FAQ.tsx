import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: "¿Para quién es Cobralo?",
    a: "Cobralo está diseñado para cualquier profesional independiente, docente, o prestador de servicios que hoy gestione sus alumnos y pagos de manera manual o con planillas Excel y busque profesionalizar su negocio."
  },
  {
    q: "¿Cómo recibo los pagos de mis alumnos?",
    a: "Cobralo no retiene tu dinero. Los pagos van directo a tu cuenta bancaria (CBU/Alias) o Mercado Pago a través de los links que generás automáticamente. Nosotros simplemente te ayudamos a trackear quién pagó y quién no."
  },
  {
    q: "¿El plan gratuito es para siempre?",
    a: "¡Sí! El plan 'Gratis' es ideal para quienes están arrancando. Podés gestionar hasta 5 alumnos activos con todas las funciones básicas sin costo mensual."
  },
  {
    q: "¿Es difícil de configurar?",
    a: "Para nada. Buscamos que las personas puedan crecer y agilizar sus servicios, por lo que la configuración toma menos de 2 minutos. Solo registrás tus servicios, cargás tus alumnos y ya podés empezar a cobrar."
  },
  {
    q: "¿Mis alumnos necesitan bajarse una app?",
    a: "No. Tus alumnos reciben links o notificaciones por WhatsApp o Email que pueden abrir en cualquier navegador para ver su estado de cuenta o pagar. Simple para vos, simple para ellos."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="section-padding bg-bg-soft/30 relative">
      <div className="container max-w-3xl">
        <div className="text-center mb-16">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-light mb-4 text-center">Despejá tus dudas</div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-white text-center">Preguntas Frecuentes</h2>
          <p className="text-text-muted text-sm text-center">Todo lo que necesitás saber para empezar a agilizar tu negocio hoy mismo.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-white/5 rounded-2xl overflow-hidden glass-card">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-bold text-white pr-8">{faq.q}</span>
                <div className={`transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}>
                  {openIndex === i ? <Minus size={18} className="text-primary-light" /> : <Plus size={18} className="text-text-dim" />}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-6 text-sm leading-relaxed text-text-muted">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
