import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const MOCK_PROS = [
  { id: 1, name: "Lucas Ferrero", bizName: "Acordes Online", category: "Guitarra \u0026 Ukelele", avgRating: 4.9, reviewCount: 24 },
  { id: 2, name: "Sofía Rodriguez", bizName: "Namaste Yoga", category: "Yoga \u0026 Mindfulness", avgRating: 4.8, reviewCount: 18 },
  { id: 3, name: "Enzo Rossi", bizName: "Rossi Coaching", category: "Entrenamiento Funcional", avgRating: 5.0, reviewCount: 12 },
  { id: 4, name: "Micaela Paz", bizName: "Ingl\u00e9s al D\u00eda", category: "Idiomas y TOEFL", avgRating: 4.7, reviewCount: 31 }
];



const FeaturedTeachers = () => {


  const teachers = MOCK_PROS;

  if (teachers.length === 0) return null;

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
              key={pro.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="glass-card p-6 border-white/5 group hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary-light border border-primary/20 text-xl group-hover:bg-primary/20 transition-colors uppercase">
                  {(pro.bizName || pro.name)?.[0]}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400">
                  <Star size={12} fill="currentColor" />
                  <span className="text-xs font-black">{pro.avgRating?.toFixed(1) || '5.0'}</span>
                </div>
              </div>
              
              <div className="space-y-1 mb-6">
                <h4 className="text-lg font-black text-white group-hover:text-primary-light transition-colors line-clamp-1">{pro.bizName || pro.name}</h4>
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold">{pro.category || 'Profesional Cobralo'}</p>
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

export default FeaturedTeachers;
