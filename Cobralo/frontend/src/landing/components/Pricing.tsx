import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const [isTrimestral, setIsTrimestral] = useState(false);

  return (
    <section id="precios" className="section-padding">
      <div className="container">
        <div className="text-center mb-16">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-light mb-4">Inversión</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">Simple. Sin letra chica.</h2>
          <p className="text-text-muted">Desbloqueá todo el potencial de tu academia.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto px-4 sm:px-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="p-10 glass-card bg-primary/[0.03] border-primary/20 relative glow-card flex flex-col h-full"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-primary text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap z-10 shadow-[0_0_20px_rgba(22,163,74,0.5)]"
            >
              ¡25% OFF LANZAMIENTO! 🔥
            </motion.div>

            <div className="text-sm font-bold text-primary-light uppercase tracking-widest mb-2">Comunidad</div>
            <h3 className="text-4xl font-black mb-4 text-white uppercase tracking-tighter">Plan Básico</h3>
            <div className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-primary-light/60">Prueba de 14 días</div>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-4xl font-black font-mono text-white">$5.242</span>
              <span className="text-lg text-text-dim line-through decoration-red-500/50">$6.990</span>
              <span className="text-sm font-normal text-text-dim">/ mes*</span>
            </div>

            <div className="space-y-4 mb-10 text-white min-h-[340px]">
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" /> Acceso total a herramientas
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" /> Gestión de alumnos y pagos
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" /> Recordatorios automáticos
              </div>
            </div>

            <div className="mt-auto w-full">
              <Link to="/login?register=true" className="w-full">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-ghost w-full justify-center text-white py-4 border-primary/20 hover:bg-primary/5 uppercase font-black text-xs tracking-widest shadow-[0_0_15px_rgba(22,163,74,0.05)]"
                >
                  Probar 14 Días
                </motion.div>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="p-10 glass-card bg-primary/[0.03] border-primary/30 relative glow-card flex flex-col h-full"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-primary text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap z-10 shadow-[0_0_20px_rgba(22,163,74,0.5)]"
            >
              ¡25% OFF LANZAMIENTO! 🔥
            </motion.div>

            <div className="text-sm font-bold text-primary-light uppercase tracking-widest mb-2">Cobralo Pro</div>
            <h3 className="text-4xl font-black mb-4 text-white uppercase tracking-tighter">Plan Pro</h3>

            <div className="flex bg-black/40 p-1 rounded-xl mb-8 relative z-10">
              <button
                onClick={() => setIsTrimestral(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isTrimestral ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}
              >
                Mensual
              </button>
              <button
                onClick={() => setIsTrimestral(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isTrimestral ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}
              >
                Trimestral <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded ml-1">-10%</span>
              </button>
            </div>

            <div className="flex items-baseline gap-2 mb-2 relative z-10">
              <span className="text-4xl font-black font-mono text-white">
                {isTrimestral ? '$30.352' : '$11.242'}
              </span>
              <span className="text-lg text-text-dim line-through decoration-red-500/50">
                {isTrimestral ? '$40.470' : '$14.990'}
              </span>
            </div>
            
            <p className="text-[10px] text-primary-light font-black uppercase mb-8 tracking-widest relative z-10">
              {isTrimestral ? 'Pago único trimestral' : 'Facturación mensual'}
            </p>

            <div className="grid grid-cols-1 gap-4 mb-10 text-white relative z-10 min-h-[340px]">
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" /> Alumnos ilimitados
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" /> Dashboard PRO & Gráficos
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" />Sincronizacion con Google Calendar
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" /> Mensajes personalizados para WhatsApp
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" /> Integracion con Mercado Pago
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" /> Reportes & Recibos
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" /> Destacado en la pagina
              </div>
            </div>

            <div className="mt-auto w-full relative z-10">
              <Link 
                to={`/login?register=true&plan=${isTrimestral ? 'PRO_TRIMESTRAL' : 'PRO_MONTHLY'}`} 
                className="w-full"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary w-full justify-center py-4 text-zinc-900 font-black uppercase tracking-widest text-[11px]"
                >
                  {isTrimestral ? 'Pagar Pro Trimestral' : 'Pagar Pro Mensual'}
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Disclaimer de Precios */}
        <div className="mt-12 text-center max-w-2xl mx-auto space-y-4">
          <p className="text-[10px] text-text-dim uppercase font-extrabold tracking-widest leading-relaxed text-primary-light opacity-80">
            * El Plan Básico es una prueba gratuita de 14 días con acceso total.
          </p>
          <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest leading-relaxed opacity-60">
            Los precios de los planes están sujetos a modificaciones mensuales basadas en el 50% del Índice de Precios al Consumidor (IPC) oficial de Argentina. 
            Te avisaremos con 10 días de antelación dentro de la plataforma ante cualquier ajuste.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
