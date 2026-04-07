import { motion } from 'framer-motion';
import { Clock, MessageSquare, Smartphone, Users, Zap, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';
import PaymentMockup from './PaymentMockup';

const MAIN_FEATURES = [
  {
    icon: MessageSquare,
    label: 'PRO',
    title: 'Automatización WhatsApp',
    description: 'Enviá recordatorios de cobro a todos tus alumnos con un solo clic. Nuestra integración inteligente pre-arma el mensaje para que solo tengas que darle a "Enviar".',
    bullets: ['Plantillas personalizadas', 'Variables dinámicas {monto}, {mes}', 'Recordatorios automáticos'],
    image: '/assets/whatsapp_mockup.png', 
    accentColor: '#22c55e',
  },
  {
    icon: BarChart3,
    label: 'PRO',
    title: 'Reportes y Estadísticas',
    description: 'Visualizá el crecimiento de tu academia en tiempo real. Ingresos mensuales, tasa de cobro y alumnos más activos en gráficas diseñadas para la toma de decisiones.',
    bullets: ['Gráficos de barras y torta', 'Exportación a Excel/PDF', 'Seguimiento de morosidad'],
    image: '/assets/stats_mockup.png', 
    accentColor: '#22c55e',
    reverse: true,
  },
  {
    icon: Zap,
    label: 'PRO',
    title: 'Cobros con Mercado Pago',
    description: 'Generá links de pago automáticos que tus alumnos reciben por WhatsApp. El dinero ingresa directamente a tu cuenta, sin intermediarios ni comisiones extras.',
    bullets: ['Links de pago instantáneos', 'Conciliación automática', 'Sin tarjeta de crédito'],
    image: '/assets/payment_mockup.png', 
    accentColor: '#22c55e',
    isCustomMockup: true,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any }
  }
};

const SECONDARY_FEATURES = [
  {
    icon: Clock,
    title: 'Chau planillas',
    description: 'Asistencia individual y grupal con un clic. Descuento automático de créditos por clase.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Premium',
    description: 'Gestión diseñada para usar en movimiento con gestos nativos y accesos rápidos.',
  },
  {
    icon: Users,
    title: 'Clases grupales',
    description: 'Gestión masiva, control de cupos limitados y organización por día de la semana.',
  },
];

const Features = () => (
  <section id="funciones" className="section-padding relative overflow-hidden" style={{ background: '#0E1113' }}>
    {/* Dot grid background */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)',
      }}
    />

    <div className="container relative z-10">
      
      {/* ── Section Header ── */}
      <div className="text-center mb-12 md:mb-24 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-6 border"
          style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)', color: '#4ade80' }}
        >
          POTENCIA TU ACADEMIA
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-6xl font-bold mb-6 tracking-tight leading-[1.1]" style={{ color: '#fafafa' }}
        >
          Menos administración.<br />
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>Más tiempo para enseñar.</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium opacity-60 max-w-xl mx-auto" style={{ color: '#a1a1aa' }}
        >
          Diseñamos Cobralo para que sea el asistente que siempre quisiste tener: invisible, eficiente y profesional.
        </motion.p>
      </div>

      {/* ── Main Feature Rows (Zig-Zag) ── */}
      <div className="space-y-16 md:space-y-48 mb-16 md:mb-32">
        {MAIN_FEATURES.map((f, i) => (
          <div 
            key={i} 
            className={`flex flex-col ${f.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-24`}
          >
            {/* Text Side */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="flex-1 space-y-8"
            >
              <motion.div variants={itemVariants} className="space-y-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 md:mb-6"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
                >
                  <f.icon size={22} style={{ color: '#4ade80' }} />
                </div>
                <h3 className="text-2xl md:text-4xl font-bold tracking-tight" style={{ color: '#fafafa' }}>
                  {f.title}
                </h3>
                <p className="text-lg leading-relaxed opacity-60" style={{ color: '#a1a1aa' }}>
                  {f.description}
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3">
                {f.bullets.map((bullet, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-primary" />
                    <span className="text-sm font-bold text-zinc-300">{bullet}</span>
                  </div>
                ))}
              </motion.div>

              <motion.button
                variants={itemVariants}
                whileHover={{ gap: '12px' }}
                className="flex items-center gap-2 text-primary font-black uppercase text-[11px] tracking-widest pt-4 transition-all"
              >
                Saber más <ArrowRight size={14} />
              </motion.button>
            </motion.div>

            {/* Visual Side (Mockup Placeholder / Custom Component) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as any, delay: 0.1 }}
              className="flex-1 relative group w-full"
            >
              <div 
                className="absolute -inset-4 bg-primary/10 rounded-[40px] blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity duration-1000" 
              />
              <div 
                className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 shadow-black/60 w-full"
              >
                {f.isCustomMockup ? (
                  <PaymentMockup />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent z-10" />
                    <img 
                      src={f.image} 
                      alt={f.title}
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                    />
                  </>
                )}
                
                {/* Minimal Overlay UI */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                   <div className="px-6 py-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-3 scale-90 md:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150">
                      <Zap size={16} className="text-primary fill-primary" />
                      <span className="text-xs font-black uppercase tracking-widest text-white">Función Pro Activa</span>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* ── Secondary Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-white/5">
        {SECONDARY_FEATURES.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="p-8 rounded-[32px] border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:border-white/[0.08]"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center mb-6">
              <f.icon size={18} className="text-zinc-400" />
            </div>
            <h4 className="text-lg font-bold mb-3 text-zinc-100">{f.title}</h4>
            <p className="text-sm leading-relaxed text-zinc-500 font-medium">{f.description}</p>
          </motion.div>
        ))}
      </div>

    </div>
  </section>
);

export default Features;
