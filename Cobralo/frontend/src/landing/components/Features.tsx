import { motion } from 'framer-motion';
import { Clock, MessageSquare, Smartphone, Users, Zap, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';

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
  {
    icon: Users,
    label: 'FUTURO',
    title: 'Portal del Alumno',
    description: 'Tus alumnos tendrán su propio espacio para gestionar su asistencia, ver pagos realizados y descargar recibos sin tener que preguntarte nada.',
    bullets: ['Autogestión de clases', 'Historial de pagos', 'Descarga de facturas/recibos'],
    image: '/assets/student_portal.png', 
    accentColor: '#4ade80',
    isFuture: true,
  },
  {
    icon: BarChart3,
    label: 'FUTURO',
    title: 'Gastos y Análisis AFIP',
    description: 'Control total de la rentabilidad real de tu academia. Registrá gastos operativos y obtené reportes listos para presentar ante tu contador o AFIP.',
    bullets: ['Registro de gastos fijos', 'Reportes impositivos', 'Cálculo de ganancia neta'],
    image: '/assets/dashboard_future.png', 
    accentColor: '#22c55e',
    reverse: true,
    isFuture: true,
  },
  {
    icon: Clock,
    label: 'FUTURO',
    title: 'Clases Grupales Pro',
    description: 'Subimos de nivel la gestión de grupos. Control de cupos dinámicos, listas de espera y inscripciones automáticas desde tu perfil público.',
    bullets: ['Control de cupos limitado', 'Listas de espera automáticas', 'Inscripción vía landing page'],
    image: '/assets/calendar_mockup.png', 
    accentColor: '#4ade80',
    isFuture: true,
  },
];



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
    title: 'Perfiles Premium',
    description: 'Personalizá tu marca con fotos, bios y links directos a tus redes sociales.',
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
          EL FUTURO DE TU ACADEMIA
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

      {/* ── Main Feature Grid (Bento Style) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 md:mb-32">
        {MAIN_FEATURES.map((f, i) => (
          <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }}
              className="flex flex-col p-8 rounded-[32px] border transition-all duration-500 relative overflow-hidden group"
              style={{ 
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', 
                  borderColor: 'rgba(255,255,255,0.08)' 
              }}
          >
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Header */}
              <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                       style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                     <f.icon size={26} className="text-primary" />
                  </div>
                  
                  {(f.label === 'PRO' || f.isFuture) && (
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                          f.isFuture ? 'bg-zinc-800/80 text-zinc-400 border-zinc-700' : 'bg-primary/10 text-primary border-primary/20'
                      }`}>
                          {f.isFuture ? 'PRÓXIMAMENTE' : 'PRO'}
                      </span>
                  )}
              </div>

              {/* Content */}
              <div className="flex-1 relative z-10">
                  <h3 className="text-2xl font-bold tracking-tight mb-4 text-zinc-100 group-hover:text-primary transition-colors duration-300">
                      {f.title}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed mb-8">
                      {f.description}
                  </p>

                  <div className="space-y-3 mb-8">
                      {f.bullets.map((bullet, j) => (
                          <div key={j} className="flex items-start gap-3">
                              <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                              <span className="text-sm font-semibold text-zinc-300 leading-snug">{bullet}</span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Action */}
              <div className="mt-auto pt-6 border-t border-white/10 relative z-10">
                  <button className="flex items-center gap-2 text-zinc-400 group-hover:text-primary font-black uppercase text-[11px] tracking-widest transition-colors duration-300">
                      Saber más <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
              </div>
          </motion.div>
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
