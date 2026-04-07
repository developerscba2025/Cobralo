import { Plus, Clock, CheckCircle2, Send } from 'lucide-react';

const ClassesView = () => (
  <div className="p-6 md:p-8 flex flex-col h-full bg-[#090B0D] overflow-auto custom-scrollbar">
     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
           <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">MIS CLASES</h2>
           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Gestioná tus horarios grupales y asistencia centralizada</p>
        </div>
        <button className="px-5 py-3 bg-green-500 rounded-2xl text-[10px] font-black uppercase text-black shadow-lg shadow-green-500/20 flex items-center gap-2 hover:scale-105 transition-transform">
          <Plus size={16} strokeWidth={3} /> Nueva Clase en Agenda
        </button>
     </div>

     <div className="space-y-12">
        {['LUNES', 'MIÉRCOLES', 'VIERNES'].map((day, i) => (
           <div key={i} className="space-y-4">
              <h3 className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em] ml-4 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> {day}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1, 2].map((_, ci) => (
                    <div key={ci} className="bg-[#0E1113] border border-white/5 rounded-[32px] p-6 group hover:border-white/10 transition-all shadow-xl">
                       <div className="flex justify-between items-start mb-6">
                          <div>
                             <div className="flex items-center gap-2 mb-1">
                                <Clock size={14} className="text-green-500" />
                                <span className="text-lg font-black text-white tabular-nums tracking-tighter">14:00 - 14:45</span>
                             </div>
                             <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Matemática Primaria</p>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-3 mt-8">
                          <button className="py-3 bg-green-500 rounded-2xl text-[10px] font-black uppercase text-black shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                             <CheckCircle2 size={14} strokeWidth={3} /> Asistencia
                          </button>
                          <button className="py-3 bg-[#090B0D] border border-white/5 rounded-2xl text-[10px] font-black uppercase text-zinc-400 flex items-center justify-center gap-2">
                             <Send size={14} /> Notificar
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        ))}
     </div>
  </div>
);

export default ClassesView;
