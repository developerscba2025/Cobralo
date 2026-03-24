import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  MessageCircle,
  CheckCircle2,
  BarChart3,
  Wallet,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Clock,
  Menu,
  X
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 py-4">
      <div className="container flex justify-between items-center">
        <a href="#" className="text-2xl font-black italic tracking-tighter text-[#22c55e]">COBRALO</a>

        <div className="hidden md:flex items-center gap-8">
          {['Funciones', 'Profes', 'Precios'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-text-muted hover:text-text transition-colors">
              {item}
            </a>
          ))}
          <a href="#empezar" className="btn btn-primary text-xs !py-3">Empezar gratis</a>
        </div>

        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-black border-b border-white/10 p-4 flex flex-col gap-4 md:hidden"
          >
            {['Funciones', 'Profes', 'Precios'].map((item) => (
              <a key={item} onClick={() => setIsOpen(false)} href={`#${item.toLowerCase()}`} className="text-lg font-medium text-text-muted">
                {item}
              </a>
            ))}
            <a href="#empezar" onClick={() => setIsOpen(false)} className="btn btn-primary w-full justify-center">Empezar gratis</a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => (
  <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(22,163,74,0.1)_0%,transparent_60%)]" />
    <div className="absolute inset-0 opacity-20 pointer-events-none"
      style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}
    />

    <div className="container relative z-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold tracking-widest text-primary-light uppercase mb-8"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Para personas independientes
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-5xl md:text-8xl font-black mb-6 leading-tight"
      >
        Gestiona y<br />
        <span className="gradient-text">escala tu negocio.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg md:text-xl text-text-muted mb-10 max-w-xl mx-auto leading-relaxed"
      > Alumnos, pagos, clases y asistencia en un solo lugar.
        Menos planillas, más tiempo para enseñar.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
      >
        <a href="#empezar" className="btn btn-primary px-10 py-4 text-lg">
          Probar gratis
          <ArrowRight size={20} />
        </a>
        <a href="#funciones" className="btn btn-ghost px-10 py-4 text-lg">
          Ver funciones
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-10 border-t border-white/5"
      >
        {[
          //{ n: '+1.200', l: 'Docentes activos' },
          { n: '24/7', l: 'Disponible' },
          { n: '+50%', l: 'Ahorra tiempo' },
          { n: 'Free', l: 'Para arrancar' },
        ].map((stat, i) => (
          <div key={i}>
            <div className="text-3xl font-black text-primary-light font-mono leading-none">{stat.n}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-text-dim mt-2">{stat.l}</div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

const FeatureCard = ({ icon: Icon, title, desc, pills, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
    className="p-8 glass-card group hover:border-primary/30 transition-all cursor-default"
  >
    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-primary/20">
      <Icon className="text-primary-light" size={24} />
    </div>
    <h3 className="text-xl font-black mb-3 text-white">{title}</h3>
    <p className="text-text-muted text-sm leading-relaxed mb-6">{desc}</p>
    <div className="flex flex-wrap gap-2">
      {pills.map((p: string) => (
        <span key={p} className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-text-dim">
          {p}
        </span>
      ))}
    </div>
  </motion.div>
);

const Features = () => (
  <section id="funciones" className="section-padding bg-bg-soft">
    <div className="container">
      <div className="mb-16">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-light mb-4">Potencia tu enseñanza</div>
        <h2 className="text-4xl md:text-5xl font-black leading-tight">
          Toda la organizacion <br />
          <span className="text-text-dim">en un solo lugar.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Users, title: 'Gestión de Alumnos', desc: 'Cada alumno con su servicio, cuota y método de pago. Marcá cobrado en un clic.', pills: ['Filtros', 'CSV', 'Notas'] },
          { icon: Calendar, title: 'Calendario Semanal', desc: 'Visualizá todas tus clases. Detección automática de conflictos y con integracion a Google Calendar.', pills: ['Organizacion Semanal', 'Google Calendar'] },
          { icon: MessageCircle, title: 'WhatsApp Vinculado', desc: 'Mandá recordatorios personalizados con monto, servicio y alias en un par de segundos.', pills: ['Recordatorios', 'Mensajes Personalizados'] },
          { icon: BarChart3, title: 'Control de tus ingresos', desc: 'Dashboard mensual de tus finanzas. Potenciá tus cobros con Cobralo.', pills: ['Gráficos', 'Ganancias', 'Dashboard'] },
        ].map((f, i) => <FeatureCard key={i} {...f} index={i} />)}
      </div>
    </div>
  </section>
);

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="precios" className="section-padding">
      <div className="container">
        <div className="text-center mb-16">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-light mb-4">Inversión</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">Simple. Sin letra chica.</h2>
          <p className="text-text-muted">Empezá gratis, escalá cuando crezcas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-10 glass-card"
          >
            <div className="text-sm font-bold text-text-dim uppercase tracking-widest mb-2">Plan</div>
            <h3 className="text-4xl font-black mb-4">Gratis</h3>
            <div className="text-text-muted text-sm mb-8">Ideal para quienes arrancan.</div>
            <div className="text-3xl font-black mb-8 font-mono">$0 <span className="text-sm font-normal text-text-dim">/ siempre</span></div>

            <div className="space-y-4 mb-10">
              {['Hasta 5 alumnos activos', 'Registro de pagos básico'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-primary-light" />
                  </div>
                  {item}
                </div>
              ))}
              {['Reportes avanzados', 'Recibos PDF Pro', 'Directorio Destacado'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-text-dim">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                    <X size={12} />
                  </div>
                  {item}
                </div>
              ))}
            </div>

            <button className="btn btn-ghost w-full justify-center opacity-50 cursor-default">Plan Actual</button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-10 glass-card bg-primary/[0.03] border-primary/30 relative"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-primary text-[10px] font-black uppercase tracking-widest">
              Más Popular
            </div>

            <div className="text-sm font-bold text-primary-light uppercase tracking-widest mb-2">Plan Pro</div>
            <h3 className="text-4xl font-black mb-4">Avanzado</h3>

            <div className="flex bg-black/40 p-1 rounded-xl mb-8">
              <button
                onClick={() => setIsAnnual(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isAnnual ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}
              >
                Mensual
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isAnnual ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}
              >
                Anual <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded ml-1">-17%</span>
              </button>
            </div>

            <div className="text-4xl font-black mb-8 font-mono">
              {isAnnual ? '$833' : '$999'} <span className="text-sm font-normal text-text-dim">/ mes</span>
            </div>

            <div className="space-y-4 mb-10">
              {[
                'Alumnos ilimitados',
                'Reportes y estadísticas',
                'Recibos PDF con tu marca',
                'Directorio de Profes Pro',
                'WhatsApp Masivo ilimitado'
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap size={12} className="text-primary-light fill-current" />
                  </div>
                  {item}
                </div>
              ))}
            </div>

            <a href="#empezar" className="btn btn-primary w-full justify-center py-4">Pasarme a Pro</a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const App = () => {
  return (
    <div className="bg-[#050805] text-text min-h-screen">
      <Navbar />
      <Hero />
      <Features />

      {/* Mockup Section */}
      <section className="section-padding overflow-hidden">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="MAX-W-5xl mx-auto glass-card p-4 md:p-8 relative group"
          >
            <div className="absolute -inset-1 bg-primary/10 blur-3xl rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <div className="ml-4 h-6 px-4 rounded-lg bg-white/5 text-[10px] flex items-center text-text-dim font-mono">
                cobralo.app/dashboard
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
              <div className="hidden md:block space-y-2 border-r border-white/5 pr-8">
                {['Dashboard', 'Alumnos', 'Calendario', 'Historial', 'Gastos'].map((item, i) => (
                  <div key={item} className={`px-4 py-2.5 rounded-xl text-xs font-bold ${i === 0 ? 'bg-primary/20 text-primary-light' : 'text-text-muted'}`}>
                    {item}
                  </div>
                ))}
              </div>

              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { l: 'Ingresos mes', v: '$148.000', c: 'text-primary-light' },
                    { l: 'Ganancia neta', v: '$131.500', c: 'text-white' },
                    { l: 'Alumnos', v: '18', c: 'text-white' },
                  ].map((card, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] font-black uppercase tracking-widest text-text-dim mb-2">{card.l}</div>
                      <div className={`text-xl font-black ${card.c}`}>{card.v}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  {[
                    { n: 'Lucía Fernández', s: 'Matemática', a: '$9.000', p: true },
                    { n: 'Tomás Quiroga', s: 'Inglés', a: '$12.000', p: false },
                    { n: 'Valentina Ríos', s: 'Piano', a: '$8.500', p: true },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors border-b border-white/5 last:border-none">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">{row.n[0]}</div>
                        <div>
                          <div className="text-xs font-bold">{row.n}</div>
                          <div className="text-[10px] text-text-dim">{row.s}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-xs font-mono font-bold text-primary-light">{row.a}</div>
                        <div className={`text-[9px] font-black px-2 py-1 rounded ${row.p ? 'bg-primary/10 text-primary-light' : 'bg-amber-500/10 text-amber-400'}`}>
                          {row.p ? 'Cobrado' : 'Pendiente'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Pricing />

      {/* Footer / CTA Section */}
      <section id="empezar" className="section-padding text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full" />
        <div className="container relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-8">Tu negocio. <br /><span className="text-primary-light">Tu tiempo. Tu plata.</span></h2>
          <p className="text-text-muted mb-10 max-w-lg mx-auto">Podes hacer la prueba con el 50% de descuento en el plan Pro por 14 dias.</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto mb-20">
            <input
              type="email"
              placeholder=""
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-primary/50 transition-all font-medium"
            />
            <button className="btn btn-primary w-full sm:w-auto px-10 py-4">Empezar gratis</button>
          </div>

          <footer className="pt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-2xl font-black italic text-primary-light">COBRALO</div>
            <div className="text-xs text-text-dim">© 2026 Cobralo. Hecho en Argentina.</div>
            <div className="flex gap-6">
              {['Términos', 'Privacidad', 'Contacto'].map((item) => (
                <a key={item} href="#" className="text-xs text-text-dim hover:text-text">{item}</a>
              ))}
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
};

export default App;
