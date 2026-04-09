import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Zap, LayoutDashboard, Users2, Calendar, LibraryBig, Settings, Bell, Search, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef } from 'react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Users2, label: 'Alumnos' },
  { icon: DollarSign, label: 'Cobros' },
  { icon: Calendar, label: 'Calendario' },
  { icon: LibraryBig, label: 'Clases' },
  { icon: Settings, label: 'Ajustes' },
];

const HeroDashboardMockup = () => (
  <div className="w-full h-full bg-[#0E1113] flex flex-col overflow-hidden text-left font-sans select-none">
    {/* Global Header */}
    <div className="h-12 border-b border-white/[0.05] flex items-center justify-between px-6 bg-[#0E1113]/50 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-[#22c55e] flex items-center justify-center font-black italic text-[10px] text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]">C</div>
        <span className="text-[11px] font-black italic tracking-tighter text-white">COBRALO</span>
        <span className="text-[7px] font-black px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded border border-green-500/20">BETA</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-6 w-32 rounded-full bg-white/[0.03] border border-white/5 flex items-center px-3 gap-2">
          <Search size={10} className="text-zinc-600" />
          <span className="text-[8px] font-bold text-zinc-500">Buscar alumnos...</span>
        </div>
        <div className="relative">
          <Bell size={14} className="text-zinc-500 hover:text-zinc-300 transition-colors" />
        </div>
      </div>
    </div>

    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar - Mini version for Hero - Hidden on mobile */}
      <div className="hidden sm:flex w-36 border-r border-white/[0.05] flex-col py-6 px-3 gap-2 bg-[#090B0D]">
        {NAV_ITEMS.map((item, i) => (
          <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${item.active ? 'bg-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'text-zinc-600'}`}>
            <item.icon size={12} strokeWidth={item.active ? 3 : 2} />
            {item.label}
          </div>
        ))}
        
        <div className="mt-auto pt-4 space-y-4">
            <div className="p-3 rounded-2xl bg-green-500/5 border border-green-500/10">
                <p className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-1">SOPORTE</p>
                <div className="w-full py-1.5 bg-green-500 text-black text-[8px] font-black uppercase tracking-widest rounded-lg text-center mt-2 shadow-lg shadow-green-500/10">Contactar</div>
            </div>
            <div className="flex items-center gap-2 px-1">
                <div className="w-6 h-6 rounded-lg bg-[#0E1113] border border-white/5 flex items-center justify-center text-[8px] font-black text-green-500">U</div>
                <div>
                   <p className="text-[8px] font-black text-white uppercase truncate tracking-tighter">USUARIO BÁSICO</p>
                   <p className="text-[6px] font-black text-zinc-700 uppercase tracking-widest">+ FREE</p>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content Area: Basic Dashboard Replica */}
      <div className="flex-1 p-6 md:p-8 overflow-auto custom-scrollbar-hero space-y-8 bg-[#090B0D]">
        
        <div className="space-y-2">
           <div className="flex items-center gap-2">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">HOLA, USUARIO</h2>
              <span className="text-2xl md:text-3xl">👋</span>
           </div>
           <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Resumen de tu academia hoy</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2 p-6 rounded-[24px] flex flex-col justify-between relative overflow-hidden" 
               style={{ background: 'linear-gradient(165deg, #121518 0%, #090B0D 100%)', border: '1px solid rgba(255,255,255,0.05)' }}>
             <div className="flex justify-between items-start">
               <div className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-xl text-[8px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1 h-1 rounded-full bg-green-500" /> + MES ACTUAL
               </div>
               <div className="w-8 h-8 rounded-xl bg-green-500/5 text-green-500 border border-green-500/10 flex items-center justify-center">
                   <span className="font-bold text-xs">$</span>
               </div>
             </div>
             <div className="mt-8">
               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 italic">Ingresos (Mes Actual)</p>
               <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">$152.000</p>
             </div>
          </div>

          <div className="p-6 rounded-[24px] flex flex-col justify-between" 
               style={{ background: 'var(--color-surface, #121518)', border: '1px solid rgba(255,255,255,0.05)' }}>
             <div className="flex justify-between items-start">
               <h3 className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">ALUMNOS</h3>
               <Users2 size={14} className="text-zinc-600" />
             </div>
             <div className="mt-6">
               <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">8</p>
               <p className="text-[9px] font-black text-zinc-600 uppercase mt-2 tracking-widest">Alumnos Activos</p>
             </div>
          </div>

          <div className="p-6 rounded-[24px] flex flex-col justify-between relative overflow-hidden" 
               style={{ background: 'var(--color-surface, #121518)', border: '1px solid rgba(255,255,255,0.05)' }}>
             <div className="flex justify-between items-start">
               <h3 className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">COBRADO</h3>
               <div className="w-6 h-6 rounded-lg bg-green-500/5 flex items-center justify-center text-green-500">
                   <TrendingUp size={12} />
               </div>
             </div>
             <div className="mt-6">
               <p className="text-4xl md:text-5xl font-black text-green-500 tracking-tighter">85%</p>
               <p className="text-[9px] font-black text-zinc-600 uppercase mt-2 tracking-widest">Eficiencia</p>
             </div>
             <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500/20">
                <div className="h-full bg-green-500 w-[85%]" />
             </div>
          </div>
        </div>

        {/* Actividad Reciente Table */}
        <div className="bg-[#0E1113] border border-white/[0.05] rounded-[28px] overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
             <div className="flex items-center gap-4">
                <h3 className="text-[9px] font-black text-white uppercase tracking-[0.2em]">ACTIVIDAD RECIENTE</h3>
                <div className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20 text-[7px] font-black uppercase tracking-widest flex items-center gap-1.5">
                   <div className="w-1 h-1 rounded-full bg-green-500" /> AL DÍA
                </div>
             </div>
             <div className="text-[8px] font-black text-green-500 uppercase tracking-widest">VER TODOS →</div>
          </div>
          
          <table className="w-full text-left">
             <tbody className="divide-y divide-white/[0.02]">
                {[
                  { name: 'roberto', svc: 'Plan Guitarra', amount: '$25.000', ok: true },
                  { name: 'camila', svc: 'Ensayo Banda', amount: '$15.000', ok: true },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-white/[0.01]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/[0.05] flex items-center justify-center text-[10px] font-black text-zinc-500 uppercase">
                          {item.name[0]}
                        </div>
                        <span className="text-[12px] font-black text-zinc-200 uppercase tracking-tight">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-[10px] font-bold text-zinc-500">{item.svc}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-black text-white tabular-nums">{item.amount}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/5 text-green-500 border border-green-500/10 text-[8px] font-black uppercase tracking-widest shadow-inner">
                         <CheckCircle2 size={10} /> COBRADO
                      </div>
                    </td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>

      </div>
    </div>
    
  </div>
);

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const spring = { stiffness: 90, damping: 28, restDelta: 0.001 };
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.45], [14, 0]), spring);
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.45], [0.88, 1]), spring);
  const yPush = useSpring(useTransform(scrollYProgress, [0, 0.45], [0, -30]), spring);
  const fadeOut = useSpring(useTransform(scrollYProgress, [0.6, 1], [1, 0]), spring);

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacityGrid = useTransform(scrollYProgress, [0, 0.5], [0.6, 0.2]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center pt-24 sm:pt-40 pb-0 overflow-hidden bg-[#0E1113]"
    >
      {/* Dot grid background with Parallax */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          y: backgroundY,
          scale: backgroundScale,
          opacity: opacityGrid,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 90% 65% at 50% 0%, #000 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 65% at 50% 0%, #000 20%, transparent 100%)',
        }}
      />

      {/* Primary top glow with Parallax */}
      <motion.div
        className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full pointer-events-none"
        style={{ 
          y: useTransform(scrollYProgress, [0, 1], [0, 300]),
          background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.15) 0%, transparent 65%)' 
        }}
      />
      {/* Left ambient orb with Parallax */}
      <motion.div
        className="absolute top-[35%] -left-[150px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ 
          y: useTransform(scrollYProgress, [0, 1], [0, -200]),
          background: 'radial-gradient(ellipse at center, rgba(74,222,128,0.06) 0%, transparent 70%)' 
        }}
      />

      <div className="container relative z-10 flex flex-col items-center text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-5 sm:mb-6 border"
          style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)', backdropFilter: 'blur(12px)' }}
        >
          <Zap size={11} className="text-primary fill-primary flex-shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.08em] sm:tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Para profes & freelancers
          </span>
        </motion.div>

        {/* Social Proof Trust Bar */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5, delay: 0.1 }}
           className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <div className="flex -space-x-3">
            {[
              { color: '#166534', char: 'L' },
              { color: '#15803d', char: 'T' },
              { color: '#14532d', char: 'V' },
              { color: '#166534', char: 'M' },
            ].map((usr, i) => (
              <div 
                key={i} 
                className="w-8 h-8 rounded-full border-2 border-[#0E1113] flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
                style={{ background: usr.color }}
              >
                {usr.char}
              </div>
            ))}
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <CheckCircle2 key={i} size={10} className="text-primary fill-primary" />
              ))}
              <span className="text-[11px] font-bold text-white ml-1">4.9/5</span>
            </div>
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              +500 profes gestionan con Cobralo
            </p>
          </div>
        </motion.div>

        {/* Headline with split reveal effect */}
        <div className="overflow-hidden mb-4 sm:mb-5 px-2 sm:px-0">
          <motion.h1
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl lg:text-[6rem] font-bold tracking-tight leading-[1.1] sm:leading-[1.05]"
            style={{ color: '#fafafa' }}
          >
            Organización sin
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 45%, rgba(255,255,255,0.85) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              límites
            </span>
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm sm:text-lg max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium px-4 sm:px-0"
          style={{ color: '#a1a1aa' }}
        >
          Dejá de perseguir alumnos para cobrar. Automatizá pagos y recordatorios en una interfaz diseñada para ser{' '}
          <span style={{ color: '#fafafa' }}>extremadamente rápida</span>.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20 w-full sm:w-auto"
        >
          <Link to="/app/login?register=true" className="w-full sm:w-auto group">
            <button
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 bg-[#22c55e] text-[#0E1113] shadow-[0_0_28px_rgba(34,197,94,0.4)] inset-shadow-white/20 hover:bg-[#4ade80] hover:shadow-[0_0_42px_rgba(74,222,128,0.5)] active:scale-95"
            >
              Probar gratis
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </Link>

          <a
            href="#funciones"
            className="w-full sm:w-auto flex items-center justify-center px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:bg-white/[0.07] hover:border-white/15"
          >
            Ver funciones
          </a>
        </motion.div>

        {/* ── High-fidelity Device Frame ── */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          style={{ opacity: fadeOut, y: yPush, rotateX, scale, transformPerspective: 1400, transformOrigin: 'center top' }}
          className="relative w-full max-w-5xl mx-auto px-2 sm:px-0"
        >
          {/* Glow beneath */}
          <div
            className="absolute -bottom-16 sm:-bottom-24 left-1/2 -translate-x-1/2 w-[80%] h-[80px] sm:h-[120px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.25) 0%, transparent 70%)', filter: 'blur(40px)' }}
          />

          {/* Device Chassis - Responsive: phone-style on mobile, laptop on desktop */}
          <div
            className="relative w-full rounded-[24px] sm:rounded-[44px] p-1.5 sm:p-2 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] sm:shadow-[0_100px_200px_-20px_rgba(0,0,0,1)] aspect-[4/5] sm:aspect-[16/10]"
            style={{ 
              background: 'linear-gradient(135deg, #32393F 0%, #171A1D 45%, #0E1113 55%, #2A2F34 100%)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.4)'
            }}
          >
             {/* Internal Screen Container */}
             <div className="relative w-full h-full rounded-[18px] sm:rounded-[36px] overflow-hidden border border-white/10" style={{ background: '#0E1113' }}>
                <HeroDashboardMockup />
                
                {/* Surface Reflection Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent z-20" />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.02] to-transparent z-20" />
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
