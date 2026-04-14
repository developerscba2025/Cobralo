import { motion } from 'framer-motion';
import { Star, MapPin, Users, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_PROS = [
  { name: 'Lucas Ferrero', bizName: 'Acordes Online', category: 'Guitarra y Ukelele', location: 'CABA', avgRating: 4.9, students: 24, gradient: 'linear-gradient(135deg, #065f46, #059669)' },
  { name: 'Sofía Rodriguez', bizName: 'Namaste Yoga', category: 'Yoga y Meditación', location: 'Rosario', avgRating: 4.8, students: 18, gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)' },
  { name: 'Enzo Rossi', bizName: 'Rossi Personal Trainer', category: 'Fitness Funcional', location: 'Córdoba', avgRating: 5.0, students: 12, gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' },
  { name: 'Micaela Paz', bizName: 'Inglés con Mica', category: 'Idiomas / TOEFL', location: 'CABA', avgRating: 4.7, students: 31, gradient: 'linear-gradient(135deg, #b91c1c, #dc2626)' },
];

const FeaturedTeachers = () => (
  <section id="profes" className="section-padding relative overflow-hidden" style={{ background: '#0E1113' }}>
    {/* Background ambient orbs */}
    <div
      className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none opacity-20 blur-[120px]"
      style={{ background: 'radial-gradient(circle at center, rgba(34,197,94,0.15) 0%, transparent 70%)' }}
    />
    
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
      
      {/* ── Header ── */}
      <div className="text-center mb-20 max-w-2xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-6 border"
          style={{ 
            background: 'rgba(34,197,94,0.06)', 
            borderColor: 'rgba(34,197,94,0.15)', 
            color: '#4ade80',
            boxShadow: '0 0 20px rgba(34,197,94,0.1)'
          }}
        >
          COMUNIDAD COBRALO
        </div>
        <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-[1.1]" style={{ color: '#fafafa' }}>
          Ellos ya <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, rgba(255,255,255,0.8) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            viven de lo que aman.
          </span>
        </h2>
        <p className="text-lg font-medium opacity-60 max-w-md mx-auto" style={{ color: '#a1a1aa' }}>
          Desde música hasta fitness, Cobralo impulsa a los mejores profesionales del país.
        </p>
      </div>

      {/* ── Professionals Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_PROS.map((pro, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }}
            whileHover={{ y: -10 }}
            className="group relative p-8 rounded-[36px] flex flex-col transition-all duration-500 overflow-hidden"
            style={{
              background: '#171A1D',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Hover Background Accent */}
            <div 
               className="absolute inset-x-0 bottom-0 h-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
               style={{ background: `linear-gradient(to top, ${pro.gradient.split(',')[1]}15, transparent)` }}
            />

            {/* Header: Avatar + Rating */}
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div
                className="w-16 h-16 rounded-[24px] overflow-hidden flex items-center justify-center text-xl font-black text-white shadow-2xl transition-all duration-500 group-hover:rounded-3xl group-hover:rotate-6"
                style={{ background: pro.gradient, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
              >
                {pro.name[0]}
              </div>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black"
                style={{ 
                   background: 'rgba(251,191,36,0.1)', 
                   border: '1px solid rgba(251,191,36,0.2)', 
                   color: '#fbbf24' 
                }}
              >
                <Star size={12} fill="currentColor" strokeWidth={0} />
                {pro.avgRating.toFixed(1)}
              </div>
            </div>

            {/* Body: Info */}
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-1.5 mb-2 opacity-50">
                 <MapPin size={10} className="text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{pro.location}</span>
              </div>
              <h4 className="text-xl font-bold mb-2 tracking-tight text-white group-hover:text-primary transition-colors duration-300">
                {pro.bizName}
              </h4>
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-600 mb-6">
                {pro.category}
              </p>
            </div>

            {/* Footer: Stats + Link */}
            <div
              className="mt-6 pt-6 border-t border-white/[0.04] flex items-center justify-between relative z-10"
            >
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full border-2 border-[#171A1D] bg-primary/20 flex items-center justify-center">
                    <Users size={12} className="text-primary" />
                 </div>
                 <span className="text-[11px] font-black text-zinc-500">+{pro.students} alumnos</span>
              </div>
              
              <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:bg-primary group-hover:border-primary group-hover:text-black">
                 <ArrowUpRight size={14} strokeWidth={3} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Final Call to Action ── */}
      <div className="mt-24 text-center">
         <p className="text-sm font-medium opacity-60 mb-3" style={{ color: '#a1a1aa' }}>
            ¿Querés que tu academia aparezca acá?
         </p>
         <Link to="/app/login?register=true">
            <button className="text-xs font-black uppercase tracking-widest text-[#22c55e] hover:text-[#4ade80] transition-colors border border-[#22c55e]/20 px-6 py-3 rounded-2xl bg-[#22c55e]/5 hover:bg-[#22c55e]/10">
               CON LA VERSIÓN PRO DESTACÁS EN NUESTRA LANDING →
            </button>
         </Link>
      </div>

    </div>
  </section>
);

export default FeaturedTeachers;
