import { motion } from 'framer-motion';

const ITEMS = [
  '🔥 25% OFF lanzamiento',
  '⚡ Automatizá tu negocio',
  '✓ Prueba Gratuita por 14 días',
  '🇦🇷 Integración Mercado Pago',
  '✓ Recordatorios por WhatsApp',
  '🔒 Sin comisiones ocultas',
  '✓ Alumnos ilimitados en Pro',
];

const OfferBanner = () => (
  <div
    className="relative overflow-hidden flex items-center border-b border-white/[0.04]"
    style={{
      background: 'rgba(14,17,19,0.4)',
      backdropFilter: 'blur(10px)',
      height: '36px',
    }}
  >
    {/* Left/Right Edge Fades for smooth entry/exit */}
    <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, #0E1113 0%, transparent 100%)' }} />
    <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(270deg, #0E1113 0%, transparent 100%)' }} />

    {/* Scrolling track with Framer Motion for better control */}
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: '-33.333%' }}
      transition={{ 
        duration: 40, 
        repeat: Infinity, 
        ease: 'linear' 
      }}
      className="flex items-center whitespace-nowrap"
    >
      {[...Array(3)].map((_, rep) => (
        <div key={rep} className="flex items-center">
          {ITEMS.map((item, i) => (
            <div key={i} className="inline-flex items-center gap-3 px-8">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 font-accent flex items-center gap-2">
                <span className="opacity-60">{item}</span>
                <span className="w-1 h-1 rounded-full bg-primary/40 mx-2" />
              </span>
            </div>
          ))}
        </div>
      ))}
    </motion.div>
  </div>
);

export default OfferBanner;
