import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { TrendingUp, Users2, MessageSquare, DollarSign } from 'lucide-react';
import { useEffect, useRef } from 'react';

const STATS = [
  { icon: Users2, value: 500, suffix: '+', label: 'PROFESORES ACTIVOS', color: '#22c55e' },
  { icon: MessageSquare, value: 12000, suffix: '+', label: 'WHATSAPPS ENVIADOS', color: '#4ade80' },
  { icon: DollarSign, value: 48, prefix: '$', suffix: 'M+', label: 'COBROS GESTIONADOS', color: '#22c55e' },
  { icon: TrendingUp, value: 98, suffix: '%', label: 'TASA DE SATISFACCIÓN', color: '#4ade80' },
];

const RollingNumber = ({ value, prefix = '', suffix = '' }: { value: number, prefix?: string, suffix?: string }) => {
  const count = useMotionValue(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const rounded = useTransform(count, (latest) => {
    const num = value > 1000 
      ? Math.round(latest).toLocaleString('es-AR') 
      : Math.round(latest);
    return `${prefix}${num}${suffix}`;
  });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration: 2.5,
        ease: [0.16, 1, 0.3, 1] as any,
        delay: 0.2,
      });
      return controls.stop;
    }
  }, [value, isInView]);

  return (
    <motion.p ref={ref} className="text-2xl font-black tracking-tight" style={{ color: '#fafafa' }}>
      {rounded}
    </motion.p>
  );
};

const StatsBar = () => (
  <div
    className="relative border-y overflow-hidden"
    style={{ background: '#0E1113', borderColor: 'rgba(255,255,255,0.06)' }}
  >
    {/* subtle inner glow */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(34,197,94,0.04) 0%, transparent 70%)' }}
    />
    
    {/* Animated background stripes */}
    <div className="absolute inset-0 opacity-[0.02] pointer-events-none overflow-hidden">
      <div className="absolute inset-0 flex rotate-12 scale-150">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="h-full w-px bg-white mx-4" />
        ))}
      </div>
    </div>

    <div className="container py-10 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0">
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }}
            className="flex flex-col items-center text-center md:border-r last:border-r-0"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-black/20"
              style={{ 
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.12)'
              }}
            >
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <RollingNumber value={s.value} prefix={s.prefix} suffix={s.suffix} />
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] mt-1.5 opacity-40" style={{ color: '#a1a1aa' }}>
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default StatsBar;
