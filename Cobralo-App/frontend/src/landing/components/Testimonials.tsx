import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const Testimonials = () => (
  <section id="testimonios" className="section-padding overflow-hidden">
    <div className="container">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black mb-4">Lo que dicen <span className="text-primary-light">nuestros profes.</span></h2>
        <p className="text-text-muted text-sm">Convertite en el próximo profesional que automatiza su academia.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'Sofía', role: 'Estudio Contable', text: 'Antes perdía horas con Excel. Ahora veo todo en un lugar con Cobralo y cobro mucho más rápido. Es un antes y un después.' },
          { name: 'Lucas', role: 'Electricista', text: 'Envié 15 recordatorios en un clic y cobré 9 en menos de 24 horas. Para los que trabajamos solos, esto es una locura.' },
          { name: 'Valentina', role: 'Coach de Fitness', text: 'Me ahorré más de 10 horas semanales de mensajes por WhatsApp. Mis alumnos ya saben que el link les llega automático.' }
        ].map((t, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="p-8 glass-card border-white/5 relative"
          >
            <div className="flex gap-1 mb-4 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
            </div>
            <p className="text-sm italic text-text-muted mb-6">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary-light">
                {t.name[0]}
              </div>
              <div>
                <div className="font-bold text-white text-xs">{t.name}</div>
                <div className="text-[10px] text-text-dim uppercase tracking-widest font-black">{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
