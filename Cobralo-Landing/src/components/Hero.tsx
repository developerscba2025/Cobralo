import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { APP_URL } from '../config';

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
          href={`${APP_URL}/login?register=true`}
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

export default Hero;
