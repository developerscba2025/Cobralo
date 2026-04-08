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
    className="relative overflow-hidden flex items-center border-b border-white/[0.04] bg-[#0E1113]/40 sm:backdrop-blur-md"
    style={{ height: '36px' }}
  >
    <style>{`
      @keyframes marquee-scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-33.333%); }
      }
      .animate-marquee {
        animation: marquee-scroll 40s linear infinite;
        will-change: transform;
      }
      @media (max-width: 640px) {
        .animate-marquee {
          animation-duration: 30s; /* Slightly faster on small screens to feel more dynamic if it's lagging */
        }
      }
    `}</style>
    
    {/* Left/Right Edge Fades */}
    <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none bg-gradient-to-r from-[#0E1113] to-transparent" />
    <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none bg-gradient-to-l from-[#0E1113] to-transparent" />

    {/* Scrolling track - Using CSS animation for maximum smoothness on mobile */}
    <div className="flex items-center whitespace-nowrap animate-marquee">
      {[...Array(3)].map((_, rep) => (
        <div key={rep} className="flex items-center">
          {ITEMS.map((item, i) => (
            <div key={i} className="inline-flex items-center gap-3 px-8">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 font-accent flex items-center gap-2">
                <span className="opacity-60">{item}</span>
                <span className="w-1 h-1 rounded-full bg-green-500/40 mx-2" />
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default OfferBanner;
