import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Clock, MessageSquare, Users, Zap, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';

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
    label: 'PRO',
    title: 'Clases Grupales Pro',
    description: 'Subimos de nivel la gestión de grupos. Control de cupos dinámicos, listas de espera e inscripciones automáticas desde tu perfil público.',
    bullets: ['Control de cupos limitado', 'Listas de espera automáticas', 'Inscripción vía landing page'],
    image: '/assets/calendar_mockup.png', 
    accentColor: '#4ade80',
    isFuture: false, // Ahora es una realidad
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

    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
      
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
        </motion.p>
      </div>

      {/* ── Main Feature Grid (Bento Style) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 md:mb-32">
        {MAIN_FEATURES.map((f, i) => (
          <FeatureCardItem key={i} f={f} i={i} />
        ))}
      </div>
    </div>
  </section>
);

const FeatureCardItem = ({ f, i }: { f: any; i: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }}
        className="flex flex-col p-8 rounded-[32px] border transition-all duration-500 relative overflow-hidden group"
        style={{ 
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', 
            borderColor: isHovered ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)',
            transform: isHovered ? 'translateY(-4px)' : 'none'
        }}
    >
        {/* Animated Gradient Border Beam */}
        {isHovered && (
             <motion.div 
                className="absolute inset-0 opacity-100 transition-opacity duration-1000"
                style={{
                    background: `radial-gradient(600px circle at ${springX}px ${springY}px, rgba(34,197,94,0.15), transparent 40%)`
                }}
             />
        )}

        {/* Dynamic Glow Effect following cursor */}
        <motion.div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
                background: `radial-gradient(circle at ${springX}px ${springY}px, rgba(34,197,94,0.08) 0%, transparent 70%)`
            }}
        />
        
        {/* Header */}
        <div className="flex items-start justify-between mb-8 relative z-10">
            <motion.div 
                animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors duration-500"
                style={{ 
                    background: isHovered ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.08)', 
                    borderColor: isHovered ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.2)' 
                }}>
               <f.icon size={26} className={isHovered ? "text-primary-light" : "text-primary"} />
            </motion.div>
            
            {(f.label === 'PRO' || f.isFuture) && (
                <motion.span 
                    animate={f.isFuture ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                        f.isFuture ? 'bg-zinc-800/80 text-zinc-400 border-zinc-700' : 'bg-primary/20 text-primary-light border-primary/30'
                    }`}
                >
                    {f.isFuture ? 'PRÓXIMAMENTE' : 'DISPONIBLE'}
                </motion.span>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 relative z-10">
            <h3 className="text-2xl font-bold tracking-tight mb-4 text-zinc-100 group-hover:text-primary-light transition-colors duration-300">
                {f.title}
            </h3>
            <p className="text-zinc-400 leading-relaxed mb-8 font-medium">
                {f.description}
            </p>

            <div className="space-y-4 mb-8">
                {f.bullets.map((bullet: string, j: number) => (
                    <motion.div 
                        key={j} 
                        initial={false}
                        animate={isHovered ? { x: 4 } : { x: 0 }}
                        transition={{ delay: j * 0.05 }}
                        className="flex items-start gap-3"
                    >
                        <div className="mt-1">
                            <CheckCircle2 size={16} className="text-primary-light" />
                        </div>
                        <span className="text-sm font-semibold text-zinc-300 leading-snug">{bullet}</span>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Action */}
        <div className="mt-auto pt-6 border-t border-white/10 relative z-10">
            <button className="flex items-center gap-2 text-zinc-400 group-hover:text-primary-light font-black uppercase text-[11px] tracking-widest transition-all duration-300">
                Saber más 
                <motion.div
                    animate={isHovered ? { x: 5 } : { x: 0 }}
                >
                    <ArrowRight size={14} />
                </motion.div>
            </button>
        </div>
    </motion.div>
  );
};

export default Features;
