import { motion } from 'framer-motion';
import { Rocket, MousePointer2, ShieldCheck } from 'lucide-react';

const STEPS = [
  {
    icon: Rocket,
    title: 'Registrate',
    desc: 'Creá tu cuenta en menos de 1 minuto y configurá tu alias de pago. Sin tarjeta de crédito.',
  },
  {
    icon: MousePointer2,
    title: 'Cargá tus alumnos',
    desc: 'Subí tus contactos y asignales sus clases, días y montos. Tu negocio en un solo lugar.',
  },
  {
    icon: ShieldCheck,
    title: 'Automatizá y cobrá',
    desc: 'Enviá recordatorios por WhatsApp y marcá pagos en un clic. Dile chau al Excel.',
  },
];

const HowItWorks = () => (
  <section className="section-padding relative overflow-hidden" style={{ background: '#0E1113' }}>
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
      
      {/* ── Header ── */}
      <div className="text-center mb-12 md:mb-24 max-w-2xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-6 border"
          style={{ 
            background: 'rgba(34,197,94,0.06)', 
            borderColor: 'rgba(34,197,94,0.15)', 
            color: '#4ade80',
            boxShadow: '0 0 20px rgba(34,197,94,0.1)'
          }}
        >
          SIMPLICIDAD TOTAL
        </div>
        <h2 className="text-3xl md:text-6xl font-bold mb-6 tracking-tight leading-[1.1]" style={{ color: '#fafafa' }}>
          Empezá en{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, rgba(255,255,255,0.8) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            3 minutos.
          </span>
        </h2>
        <p className="text-lg font-medium opacity-60" style={{ color: '#a1a1aa' }}>
          Diseñado para personas reales, no para expertos en tecnología.
        </p>
      </div>

      {/* ── Steps Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-6xl mx-auto">
        
        {/* Decorative connecting "flow" lines (Desktop only) */}
        <div className="hidden md:flex absolute top-14 left-[15%] right-[15%] justify-between pointer-events-none z-0">
           {[...Array(2)].map((_, i) => (
             <div key={i} className="flex-1 px-10">
                <div 
                   className="h-px w-full" 
                   style={{ background: 'linear-gradient(90deg, rgba(34,197,94,0.3) 0%, transparent 100%)' }}
                />
             </div>
           ))}
        </div>

        {STEPS.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }}
            viewport={{ once: true, margin: '-50px' }}
            className="flex flex-col items-center text-center group relative z-10"
          >
            {/* Step Icon Container */}
            <div className="relative mb-10">
              {/* Step number badge (floating background) */}
              <div 
                 className="absolute -top-4 -right-4 w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black rotate-12 transition-transform group-hover:rotate-0 duration-500 shadow-2xl z-20"
                 style={{ 
                    background: '#22c55e', 
                    color: '#0E1113',
                    boxShadow: '0 8px 24px rgba(34,197,94,0.4)',
                    border: '2px solid #0E1113'
                 }}
              >
                0{i + 1}
              </div>

              {/* Main Icon Box */}
              <div
                className="w-28 h-28 rounded-[32px] flex items-center justify-center relative overflow-hidden transition-all duration-700 group-hover:rounded-[40px] group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #171A1D 0%, #0E1113 100%)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.05)',
                }}
              >
                {/* Internal Glow on Hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
                  style={{ background: 'radial-gradient(circle at center, rgba(34,197,94,0.15) 0%, transparent 65%)' }}
                />
                
                <step.icon
                  size={32}
                  className="relative z-10 transition-all duration-700 text-zinc-500 group-hover:text-primary group-hover:scale-110"
                />
              </div>
            </div>

            {/* Text Content */}
            <h3 className="text-2xl font-bold mb-4 tracking-tight text-white group-hover:text-primary transition-colors duration-300">
              {step.title}
            </h3>
            <p className="text-[15px] font-medium leading-relaxed max-w-[280px] opacity-60 group-hover:opacity-100 transition-opacity duration-300" style={{ color: '#a1a1aa' }}>
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>

    </div>
  </section>
);

export default HowItWorks;
