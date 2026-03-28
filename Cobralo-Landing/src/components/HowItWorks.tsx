import { motion } from 'framer-motion';
import { Rocket, MousePointer2, ShieldCheck } from 'lucide-react';

const HowItWorks = () => (
  <section className="section-padding bg-bg-soft/30 border-y border-white/5">
    <div className="container">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black mb-4">Empoderá tu academia en <span className="text-primary-light">3 pasos.</span></h2>
        <p className="text-text-muted">Simple, rápido y diseñado para personas independientes.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { icon: Rocket, title: 'Registrate', desc: 'Creá tu cuenta en menos de 1 minuto y configurá tu alias de pago.' },
          { icon: MousePointer2, title: 'Cargá tus Alumnos', desc: 'Subí tus contactos y asignales sus clases, días y montos.' },
          { icon: ShieldCheck, title: 'Automatizá y Cobrá', desc: 'Enviá recordatorios por WhatsApp y marcá pagos en un clic.' }
        ].map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center group"
          >
            <div className="step-number group-hover:scale-110 transition-transform">{i + 1}</div>
            <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mb-6 text-primary-light group-hover:bg-primary/10 transition-colors">
              <step.icon size={32} />
            </div>
            <h4 className="text-xl font-black mb-2 text-white">{step.title}</h4>
            <p className="text-sm text-text-muted leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
