import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Search, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Mock API for teachers (In a real app, this would be a fetch to api.getTopTeachers)
const MOCK_TEACHERS = [
  { id: 1, name: "Lucas Ferrero", bizName: "Acordes Online", category: "M\u00fasica", biography: "Clases de guitarra y ukelele con metodolog\u00eda propia.", city: "Buenos Aires", tags: ["M\u00fasica", "Arte"], avgRating: 4.9, reviewCount: 24 },
  { id: 2, name: "Sofía Rodriguez", bizName: "Namaste Yoga", category: "Bienestar", biography: "Instructora certificada de Hatha y Vinyasa Yoga.", city: "CABA", tags: ["Yoga", "Salud"], avgRating: 4.8, reviewCount: 18 },
  { id: 3, name: "Enzo Rossi", bizName: "Rossi Coaching", category: "Fitness", biography: "Personal trainer enfocado en entrenamiento funcional.", city: "C\u00f3rdoba", tags: ["Deportes", "Salud"], avgRating: 5.0, reviewCount: 12 },
  { id: 4, name: "Micaela Paz", bizName: "Ingl\u00e9s al D\u00eda", category: "Idiomas", biography: "Preparaci\u00f3n para ex\u00e1menes internacionales y conversaci\u00f3n.", city: "Rosario", tags: ["Educaci\u00f3n", "Idiomas"], avgRating: 4.7, reviewCount: 31 }
];



const Directory = () => {
  const [teachers] = useState<any[]>(MOCK_TEACHERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('Todos');



  const filteredTeachers = teachers.filter(t => {
    const fullName = (t.bizName || t.name || '').toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          (t.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'Todos' || (t.tags || []).includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = ['Todos', ...new Set(teachers.flatMap(t => t.tags || []))];

  return (
    <div className="bg-[#050805] text-text min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050805]/80 backdrop-blur-xl border-b border-white/5">
        <Navbar />
      </header>

      <main className="pt-32 pb-20 container">
        <div className="max-w-4xl mx-auto text-center mb-16 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary-light uppercase mb-6 tracking-widest">
            Comunidad Profesional
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Directorio de <span className="text-primary-light">Profesionales</span>
          </h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto font-medium">
            Encontrá a los mejores expertos que eligen Cobralo para gestionar su negocio. Calidad garantizada por nuestra comunidad.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="max-w-5xl mx-auto mb-12 px-4">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-light transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o especialidad..."
                className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-[24px] text-white font-bold outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-6 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                    selectedTag === tag 
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-4">
          {filteredTeachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTeachers.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -10 }}
                  className="glass-card p-8 border-white/5 group hover:border-primary/30 transition-all flex flex-col h-full"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center font-black text-primary-light border border-primary/20 text-2xl uppercase">
                      {(t.bizName || t.name || '?')[0]}
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 mb-1">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm font-black">{t.avgRating?.toFixed(1) || '5.0'}</span>
                      </div>
                      <span className="text-[9px] font-black text-text-dim uppercase tracking-widest">{t.reviewCount || 0} opiniones</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-primary-light transition-colors mb-1 line-clamp-1">{t.bizName || t.name}</h3>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-primary-light font-black">{t.category || 'Profesional Cobralo'}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-text-muted">
                      <MapPin size={14} />
                      <span className="text-xs font-bold">{t.city || 'Argentina'}</span>
                    </div>

                    <p className="text-sm text-text-dim font-medium leading-relaxed italic line-clamp-3">
                      "{t.biography || 'Sin descripción disponible.'}"
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                       {t.tags?.map((tag: string) => (
                         <span key={tag} className="px-2.5 py-1 bg-white/5 rounded-lg text-[9px] font-black uppercase text-text-muted border border-white/5">#{tag}</span>
                       ))}
                    </div>
                  </div>

                  <Link to={`/profile/${t.id}`} className="w-full py-5 bg-white/5 hover:bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl border border-white/5 hover:border-primary transition-all shadow-sm flex items-center justify-center gap-2 group/btn active:scale-95">
                    VER PERFIL COMPLETO <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-[48px] border border-dashed border-white/10">
              <p className="text-text-muted font-bold text-lg mb-2">No encontramos profesionales con esos criterios.</p>
              <button 
                onClick={() => {setSearchTerm(''); setSelectedTag('Todos');}}
                className="text-primary-light font-black uppercase tracking-widest text-xs hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer 
        onOpenSupport={() => {}} 
        onOpenLegal={() => {}} 
      />
    </div>
  );
};

export default Directory;
