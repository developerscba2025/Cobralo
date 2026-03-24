import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  MessageCircle,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  Star,
  Zap,
  Menu,
  X,
  ShieldCheck,
  MousePointer2,
  Rocket,
  Instagram,
  Twitter,
  Linkedin,
  ArrowUpRight,
  Send
} from 'lucide-react';

const OfferBanner = () => (
  <div className="offer-banner">
    <div className="offer-track">
      {[...Array(10)].map((_, i) => (
        <span key={i}>🚀 @COBRALO_APP — 50% OFF LANZAMIENTO — ¡QUEDAN POCOS CUPOS! — </span>
      ))}
    </div>
  </div>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black/80 backdrop-blur-xl border-b border-white/5 py-2">
      <div className="container flex justify-between items-center">
        <a href="#" className="text-2xl font-black italic tracking-tighter text-[#22c55e]">COBRALO</a>

        <div className="hidden md:flex items-center gap-8">
          {['Funciones', 'Profes', 'Precios'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-text-muted hover:text-text transition-colors">
              {item}
            </a>
          ))}
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://app.cobralo.com/register"
            className="btn btn-primary text-xs !py-3"
          >
            Empezar gratis
          </motion.a>
        </div>

        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

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
            <a href="https://app.cobralo.com/register" onClick={() => setIsOpen(false)} className="btn btn-primary w-full justify-center">Empezar gratis</a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};


const Hero = () => (
  <section className="relative min-h-screen flex items-center justify-center pt-12 overflow-hidden">
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
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="https://app.cobralo.com/register"
          className="btn btn-primary px-10 py-4 text-lg"
        >
          Probar gratis
          <ArrowRight size={20} />
        </motion.a>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="#funciones"
          className="btn btn-ghost px-10 py-4 text-lg"
        >
          Ver funciones
        </motion.a>
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

const HowItWorks = () => (
  <section className="section-padding bg-bg-soft/30 border-y border-white/5">
    <div className="container">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black mb-4">Empoderá tu academia en <span className="text-primary-light">3 pasos.</span></h2>
        <p className="text-text-muted">Simple, rápido y diseñado para personas independientes.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { icon: Rocket, title: 'Registrate', desc: 'Creá tu cuenta en menos de 1 minuto y configurá tu alias de pago.' },
          { icon: MousePointer2, title: 'Cargá tus Alumnos', desc: 'Subí tus contactos y asignales sus clases, días y montos.' },
          { icon: ShieldCheck, title: 'Automatizá y Cobrá', desc: 'Enviá recordatorios por WhatsApp y marcá pagos en un clic.' }
        ].map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center group"
          >
            <div className="step-number group-hover:scale-110 transition-transform">{i + 1}</div>
            <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mb-6 text-primary-light group-hover:bg-primary/10 transition-colors">
              <step.icon size={32} />
            </div>
            <h4 className="text-xl font-black mb-2 text-white">{step.title}</h4>
            <p className="text-sm text-text-muted leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const FeatureCard = ({ icon: Icon, title, desc, pills, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, borderColor: 'rgba(34, 197, 94, 0.3)' }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
    className="p-8 glass-card group transition-all cursor-default"
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

/**
 * SECCIÓN: Profesionales Destacados
 * Conectado conceptualmente al modelo 'Rating' del backend. 
 * Muestra los perfiles Pro con mejores notas para dar credibilidad social.
 */
const FeaturedTeachers = () => {
  const teachers = [
    { name: 'Ana Martínez', cat: 'Yoga & Bienestar', rate: 5.0, img: 'A' },
    { name: 'Carlos Ruiz', cat: 'Matemáticas', rate: 4.9, img: 'C' },
    { name: 'Elena Perez', cat: 'Piano', rate: 5.0, img: 'E' },
    { name: 'Javier Lopez', cat: 'Crossfit', rate: 4.8, img: 'J' }
  ];

  return (
    <section id="profes" className="section-padding bg-bg-soft/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary-light uppercase mb-4 tracking-widest">
            Comunidad Cobralo
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Profesores Seleccionados</h2>
          <p className="text-text-muted text-sm max-w-lg mx-auto">
            Los profesionales con mejores calificaciones en nuestra plataforma. 
            Basado en el sistema de <span className="text-primary-light font-bold">Ratings Reales</span> de Cobralo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.map((pro, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="glass-card p-6 border-white/5 group hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary-light border border-primary/20 text-xl group-hover:bg-primary/20 transition-colors">
                  {pro.img}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400">
                  <Star size={12} fill="currentColor" />
                  <span className="text-xs font-black">{pro.rate.toFixed(1)}</span>
                </div>
              </div>
              
              <div className="space-y-1 mb-6">
                <h4 className="text-lg font-black text-white group-hover:text-primary-light transition-colors">{pro.name}</h4>
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold">{pro.cat}</p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-bg-soft bg-white/5" />
                  ))}
                  <div className="w-6 h-6 rounded-full border-2 border-bg-soft bg-primary/20 flex items-center justify-center text-[8px] font-black text-primary-light">+10</div>
                </div>
                <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider">Ver Perfil</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

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

const Testimonials = () => (
  <section className="section-padding overflow-hidden">
    <div className="container">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black mb-4">Lo que dicen <span className="text-primary-light">nuestros profes.</span></h2>
        <p className="text-text-muted text-sm">Convertite en el próximo profesional que automatiza su academia.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'Sofía', role: 'Profesora de Yoga', text: 'Increíble. Ahora mando los recordatorios en un segundo y mis alumnos me pagan puntual. Me cambió la vida.' },
          { name: 'Lucas Gomez', role: 'Clases de Matemática', text: 'Tener todos los pagos trackeadisimos sin Excel es un antes y un después. El soporte es 10/10.' },
          { name: 'Valentina', role: 'Coach de Canto', text: 'La versión gratis ya te ayuda un montón, pero la Pro te lleva al siguiente nivel con los gráficos de ingresos.' }
        ].map((t, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="p-8 glass-card border-white/5 relative"
          >
            <div className="flex gap-1 mb-4 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
            </div>
            <p className="text-sm italic text-text-muted mb-6">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary-light">
                {t.name[0]}
              </div>
              <div>
                <div className="font-bold text-white text-xs">{t.name}</div>
                <div className="text-[10px] text-text-dim uppercase tracking-widest font-black">{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Pricing = () => {
  const [isSemestral, setIsSemestral] = useState(false);

  return (
    <section id="precios" className="section-padding">
      <div className="container">
        <div className="text-center mb-16">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-light mb-4">Inversión</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">Simple. Sin letra chica.</h2>
          <p className="text-text-muted">Empezá gratis, escalá cuando crezcas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plan FREE: Vinculado al límite de 5 alumnos del backend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-10 glass-card flex flex-col h-full"
          >
            <div className="text-sm font-bold text-text-dim uppercase tracking-widest mb-2">Plan</div>
            <h3 className="text-4xl font-black mb-4 text-white">Gratis</h3>
            <div className="text-text-muted text-sm mb-8">Ideal para quienes arrancan.</div>
            <div className="text-3xl font-black mb-8 font-mono text-white">$0 <span className="text-sm font-normal text-text-dim">/ siempre</span></div>

            <div className="space-y-4 mb-10 text-white">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={14} className="text-primary-light" /> Hasta 5 alumnos activos
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={14} className="text-primary-light" /> Registro de pagos básico
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={14} className="text-primary-light" /> Calendario básico
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={14} className="text-primary-light" /> Estadísticas simples
              </div>
            </div>

            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://app.cobralo.com/register"
              className="btn btn-ghost w-full justify-center text-white mt-auto"
            >
              Empezar Gratis
            </motion.a>
          </motion.div>

          {/* Plan PRO: Semestral + 50% OFF Lanzamiento */}
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
              ¡50% OFF LANZAMIENTO! 🚀
            </motion.div>

            <div className="text-sm font-bold text-primary-light uppercase tracking-widest mb-2">Plan Pro</div>
            <h3 className="text-4xl font-black mb-4 text-white">Avanzado</h3>

            <div className="flex bg-black/40 p-1 rounded-xl mb-8 relative z-10">
              <button
                onClick={() => setIsSemestral(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isSemestral ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}
              >
                Mensual
              </button>
              <button
                onClick={() => setIsSemestral(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isSemestral ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}
              >
                Semestral <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded ml-1">-25%</span>
              </button>
            </div>

            <div className="text-4xl font-black mb-2 font-mono text-white relative z-10">
              {isSemestral ? '$749' : '$999'} <span className="text-sm font-normal text-text-dim">/ mes</span>
            </div>
            <p className="text-[10px] text-primary-light font-black uppercase mb-8 tracking-widest relative z-10">
              Facturado {isSemestral ? 'cada 6 meses' : 'mensualmente'}
            </p>

            <div className="grid grid-cols-1 gap-4 mb-10 text-white relative z-10">
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" /> Alumnos ilimitados
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" /> Dashboard PRO & Gráficos
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" /> Google Calendar Sync
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" /> WhatsApp Personalizado
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" /> Mercado Pago Integration
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" /> Reportes & Recibos (Excel)
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Zap size={14} className="text-primary-light fill-current" /> Salir Destacado en Landing
              </div>
            </div>

            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://app.cobralo.com/register"
              className="btn btn-primary w-full justify-center py-4 text-white relative z-10 mt-auto"
            >
              Aprovechar 50% OFF
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
const Toast = ({ message, isOpen, onClose }: { message: string; isOpen: boolean; onClose: () => void }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-md"
        >
          <CheckCircle2 size={18} />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SupportModal = ({ isOpen, onClose, onSent }: { isOpen: boolean; onClose: () => void; onSent: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-bg-soft border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-white">Soporte Cobralo</h3>
                <p className="text-sm text-text-muted mt-1">Envíanos tu mensaje y te responderemos pronto.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-dim hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); onSent(); }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-text-dim tracking-widest pl-1">Nombre</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/40 transition-all text-sm font-medium" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-text-dim tracking-widest pl-1">Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/40 transition-all text-sm font-medium" 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-text-dim tracking-widest pl-1">Asunto</label>
                <input 
                  type="text" 
                  required
                  placeholder="¿En qué podemos ayudarte?"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/40 transition-all text-sm font-medium" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-text-dim tracking-widest pl-1">Mensaje</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/40 transition-all text-sm font-medium resize-none" 
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <Send size={16} />
                Enviar Mensaje
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Footer = ({ onOpenSupport }: { onOpenSupport: () => void }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative z-50 mt-12 border-t border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden text-left pointer-events-auto">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="w-full px-8 md:px-12 lg:px-24 pt-10 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-32">
          {/* Brand & Socials */}
          <div className="space-y-6 text-left">
            <div className="space-y-4">
              <a href="#" className="text-2xl font-black italic tracking-tighter text-primary-light block">COBRALO</a>
              <p className="text-sm text-text-muted leading-relaxed max-w-xs">
                Una plataforma segura y confiable para gestionar tus cobros.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {[
                { icon: Instagram, href: "https://www.instagram.com/studiodevelopers/" },
                //{ icon: Linkedin, href: "#" }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  whileHover={{ y: -3, color: '#22c55e' }}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-dim transition-colors hover:border-primary/20"
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links: Producto */}
          <div className="space-y-6 text-left">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Producto</h4>
            <nav className="flex flex-col gap-3">
              {[
                { name: 'Funciones', href: '#funciones' },
                { name: 'Precios', href: '#precios' },
                { name: 'Testimonios', href: '#testimonios' },
                { name: 'App Login', href: 'https://app.cobralo.com' }
              ].map(link => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="text-sm text-text-muted hover:text-white transition-colors flex items-center gap-1 group w-fit footer-link"
                >
                  {link.name}
                  {link.href.startsWith('http') && <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5" />}
                </a>
              ))}
            </nav>
          </div>

          {/* Links: Legal */}
          <div className="space-y-6 text-left">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Legal</h4>
            <nav className="flex flex-col gap-3">
              {[
                { name: 'Términos', href: '#', badge: 'Soon' },
                { name: 'Privacidad', href: '#', badge: 'Soon' },
                { name: 'Soporte', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=developerscba2025@gmail.com' }
              ].map(link => (
                <a 
                  key={link.name} 
                  onClick={link.name === 'Soporte' ? (e) => { e.preventDefault(); onOpenSupport(); } : undefined}
                  href={link.href} 
                  target={link.href.startsWith('http') ? "_blank" : undefined}
                  rel={link.href.startsWith('http') ? "noopener noreferrer" : undefined}
                  className="text-sm text-text-muted hover:text-white transition-colors flex items-center justify-between group grayscale hover:grayscale-0 sm:max-w-[150px] footer-link"
                >
                  {link.name}
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-text-dim group-hover:text-primary-light group-hover:border-primary/20 transition-all">
                      {link.badge}
                    </span>
                  )}
                </a>
              ))}
            </nav>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[11px] text-text-dim/60 font-medium whitespace-nowrap">
            © {currentYear} Cobralo Inc. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};

const App = () => {
  const [showSupport, setShowSupport] = useState(false);
  const [showToast, setShowToast] = useState(false);

  return (
    <div className="bg-[#050805] text-text min-h-screen">
      <SupportModal 
        isOpen={showSupport} 
        onClose={() => setShowSupport(false)} 
        onSent={() => setShowToast(true)} 
      />
      <Toast 
        message="Mensaje enviado con éxito!" 
        isOpen={showToast} 
        onClose={() => setShowToast(false)} 
      />
      
      <header className="fixed top-0 left-0 right-0 z-50">
        <OfferBanner />
        <Navbar />
      </header>
      <div className="pt-[110px]"> {/* Space for the fixed header */}
        <Hero />
        <HowItWorks />
        <Features />
        <FeaturedTeachers />
        <Testimonials />

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
        <section id="empezar" className="pt-16 pb-0 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="container relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-8">Tu negocio. <br /><span className="text-primary-light">Tu tiempo. Tu plata.</span></h2>
            <p className="text-text-muted mb-10 max-w-lg mx-auto">Podes hacer la prueba con el 50% de descuento en el plan Pro por 14 dias.</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto mb-20">
              <input
                type="email"
                placeholder="hola@cobralo.com"
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-primary/50 transition-all font-medium text-sm"
              />
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://app.cobralo.com/register"
                className="btn btn-primary w-full sm:w-auto px-10 py-4 text-xs font-bold"
              >
                Empezar
              </motion.a>
            </div>

            {/* Se movió el Footer fuera de este container para ocupar el 100% */}
          </div>
        </section>
        <Footer onOpenSupport={() => setShowSupport(true)} />
      </div>
    </div>
  );
};

export default App;
