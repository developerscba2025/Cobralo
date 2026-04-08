import { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const BASIC_FEATURES = [
  { text: 'ACCESO TOTAL A HERRAMIENTAS', included: true },
  { text: 'GESTIÓN DE ALUMNOS Y PAGOS', included: true },
  { text: 'RECORDATORIOS AUTOMÁTICOS', included: true },
];

const PRO_FEATURES = [
  { text: 'ALUMNOS ILIMITADOS', included: true },
  { text: 'DASHBOARD PRO & GRÁFICOS', included: true },
  { text: 'SINCRONIZACIÓN GOOGLE CALENDAR', included: true },
  { text: 'MENSAJES PARA WHATSAPP AUTOMATIZADOS', included: true },
  { text: 'INTEGRACIÓN EXPERTA MERCADO PAGO', included: true },
  { text: 'REPORTES FINANCIEROS & RECIBOS', included: true },
  { text: 'PERFIL DESTACADO EN LA PÁGINA', included: true },
];

const Pricing = () => {
  const [isTrimestral, setIsTrimestral] = useState(false);

  // 3D Tilt Logic for Pro Card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateXRaw = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
  const rotateYRaw = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);

  const rotateX = useSpring(rotateXRaw, { stiffness: 150, damping: 20 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Disable tilt on touch devices
    if (!window.matchMedia('(pointer: fine)').matches) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    mouseX.set(mouseXPos / width - 0.5);
    mouseY.set(mouseYPos / height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const monthlyPriceBasic = 6987;
  const finalBasic = 5240;

  const monthlyPricePro = 14987;
  const finalProMonthly = 11240;
  
  const trimestralPriceProFull = 40467;
  const finalProTrimestral = 30350;

  const finalPro = isTrimestral ? finalProTrimestral : finalProMonthly;
  const crossedPricePro = isTrimestral ? trimestralPriceProFull : monthlyPricePro;

  return (
    <section id="precios" className="section-padding relative overflow-hidden" style={{ background: '#0E1113' }}>
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #22c55e 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none opacity-20 blur-[120px]"
        style={{ background: 'radial-gradient(circle at center, rgba(34,197,94,0.15) 0%, transparent 70%)' }}
      />

      <div className="container relative z-10">
        
        {/* ── Header ── */}
        <div className="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-6 border"
            style={{ 
              background: 'rgba(34,197,94,0.06)', 
              borderColor: 'rgba(34,197,94,0.2)', 
              color: '#4ade80' 
            }}
          >
            PLANES & PRECIOS
          </div>
          <h2 className="text-3xl md:text-6xl font-bold mb-6 tracking-tight leading-[1.1]" style={{ color: '#fafafa' }}>
            Inversión mínima.<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, rgba(255,255,255,0.8) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Resultados máximos.
            </span>
          </h2>
        </div>

        {/* ── Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">

          {/* ── Plan Básico ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative flex flex-col p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] transition-all bg-black/40 border border-white/[0.05] group"
          >
            <div className="mb-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4ade80] mb-4">Plan Básico</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl sm:text-5xl font-black text-white">${finalBasic.toLocaleString('es-AR')}</span>
                <div className="flex flex-col">
                   <span className="text-sm font-bold text-zinc-600 line-through decoration-red-500/40">
                     ${monthlyPriceBasic.toLocaleString('es-AR')}
                   </span>
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">/ mes</span>
                </div>
              </div>
              <p className="text-[10px] font-black text-[#4ade80] uppercase tracking-[0.1em] mt-2">PRUEBA DE 14 DÍAS</p>
            </div>

            <div className="space-y-5 mb-12 flex-1">
              {BASIC_FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Zap size={14} className="text-[#22c55e] fill-[#22c55e] flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-zinc-300">
                    {f.text}
                  </span>
                </div>
              ))}
            </div>

            <Link to="/app/login?register=true" className="block w-full">
              <button
                className="w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-zinc-400 border border-white/[0.05] hover:bg-white/[0.02] transition-all"
              >
                PAGAR PLAN BÁSICO
              </button>
            </Link>
          </motion.div>

          {/* ── Plan Pro ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className="relative flex flex-col p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] transition-all bg-[#0A0C0E] border-2 border-[#22c55e]/20 group shadow-[0_20px_50px_rgba(34,197,94,0.05)] cursor-default"
          >
            <div className="mb-8" style={{ transform: 'translateZ(50px)' }}>
              <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4ade80]">Plan Pro</p>
                <div className="flex items-center gap-3">
                   <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${!isTrimestral ? 'text-white' : 'text-zinc-600'}`}>MENSUAL</span>
                   <button 
                      onClick={() => setIsTrimestral(!isTrimestral)}
                      className="w-10 h-5 rounded-full p-0.5 transition-all duration-300 relative bg-white/[0.05] border border-white/10"
                   >
                      <motion.div 
                         animate={{ x: isTrimestral ? 20 : 0 }}
                         className="w-4 h-4 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                      />
                   </button>
                   <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${isTrimestral ? 'text-white' : 'text-zinc-600'}`}>TRIMESTRAL</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/20 text-[8px] font-black text-[#4ade80] uppercase tracking-wider">
                         25% OFF
                      </span>
                   </div>
                </div>
              </div>
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl sm:text-5xl font-black text-white">${finalPro.toLocaleString('es-AR')}</span>
                <span className="text-sm font-bold text-zinc-600 line-through decoration-red-500/40">
                  ${crossedPricePro.toLocaleString('es-AR')}
                </span>
              </div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">
                {isTrimestral ? 'PAGO ÚNICO TRIMESTRAL' : 'FACTURACIÓN MENSUAL'}
              </p>
            </div>

            <div className="space-y-3 mb-10 flex-1" style={{ transform: 'translateZ(30px)' }}>
              {PRO_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
                  <Zap size={14} className="text-[#22c55e] fill-[#22c55e] flex-shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-200">
                    {f.text}
                  </span>
                </div>
              ))}
            </div>

            <Link to={`/app/login?register=true&plan=${isTrimestral ? 'PRO_TRIMESTRAL' : 'PRO_MONTHLY'}`} className="block w-full" style={{ transform: 'translateZ(60px)' }}>
              <button
                className="w-full py-5 rounded-2xl font-black text-[13px] uppercase tracking-[0.15em] transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: '#22c55e', color: '#090B0D' }}
              >
                PAGAR PRO {isTrimestral ? 'TRIMESTRAL' : 'MENSUAL'}
              </button>
            </Link>
          </motion.div>
        </div>

        {/* ── Footer Info ── */}
        <div className="mt-16 flex flex-col items-center gap-4 opacity-40">
           <p className="text-[9px] font-black uppercase tracking-widest text-center text-zinc-500">
              COBRALO PRO · SOLUCIONES PARA ACADEMIAS PROFESIONALES
           </p>
        </div>

      </div>
    </section>
  );
};

export default Pricing;
