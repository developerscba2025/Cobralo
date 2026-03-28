import { motion } from 'framer-motion';

const DashboardMockup = () => (
  <section className="section-padding overflow-hidden bg-gradient-to-b from-transparent to-primary/5">
    <div className="container">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black mb-4">Interfaz <span className="text-primary-light">moderna e intuitiva.</span></h2>
        <p className="text-text-muted">Diseñado para que gestiones tu negocio sin fricciones.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto glass-card p-2 md:p-4 relative group shadow-[0_0_50px_rgba(22,163,74,0.15)] border-white/10"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 blur-2xl rounded-[40px] opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="relative bg-[#080d08] rounded-[20px] overflow-hidden border border-white/5">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            </div>
            <div className="ml-4 h-7 px-4 rounded-lg bg-white/5 text-[9px] flex items-center text-text-dim font-mono border border-white/5">
              www.cobraloapp.com/dashboard
            </div>
          </div>

          <div className="grid grid-cols-1 min-h-[400px]">

            <div className="p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { l: 'Ingresos mes', v: '$148.000', c: 'text-primary-light' },
                  { l: 'Ganancia neta', v: '$131.500', c: 'text-white' },
                  { l: 'Alumnos', v: '18', c: 'text-white' },
                ].map((card, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -2 }}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner"
                  >
                    <div className="text-[9px] font-black uppercase tracking-widest text-text-dim mb-2">{card.l}</div>
                    <div className={`text-2xl font-black ${card.c}`}>{card.v}</div>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-4 mb-4 text-[10px] font-black text-text-dim uppercase tracking-widest">
                  <span>Alumno</span>
                  <div className="flex gap-16">
                    <span>Monto</span>
                    <span className="w-20">Estado</span>
                  </div>
                </div>
                {[
                  { n: 'Lucía Fernández', s: 'Matemática', a: '$9.000', p: true },
                  { n: 'Tomás Quiroga', s: 'Inglés', a: '$12.000', p: false },
                  { n: 'Valentina Ríos', s: 'Piano', a: '$8.500', p: true },
                  { n: 'Mateo Lopez', s: 'Crossfit', a: '$15.000', p: true },
                ].map((row, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/5 group/row"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs font-black text-primary-light group-hover/row:scale-110 transition-transform">
                        {row.n[0]}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover/row:text-primary-light transition-colors">{row.n}</div>
                        <div className="text-[10px] text-text-dim font-medium">{row.s}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-xs font-mono font-bold text-primary-light">{row.a}</div>
                      <div className={`text-[9px] font-black px-3 py-1.5 rounded-lg w-20 text-center transition-all ${row.p ? 'bg-primary/10 text-primary-light border border-primary/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                        {row.p ? 'Cobrado' : 'Pendiente'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default DashboardMockup;
