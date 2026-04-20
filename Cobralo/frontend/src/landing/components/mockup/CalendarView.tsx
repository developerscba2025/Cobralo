import { Send, Plus } from 'lucide-react';

const CalendarView = () => (
  <div className="p-4 md:p-8 flex flex-col h-full bg-[#090B0D]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic">AGENDA SEMANAL</h2>
           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Gestioná tus horarios con precisión pro</p>
        </div>
        <div className="grid grid-cols-2 sm:flex gap-2 w-full md:w-auto">
          <button className="px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase text-zinc-400 flex items-center justify-center gap-2"><Send size={14}/> PDF</button>
          <button className="px-3 py-2 bg-green-500 rounded-xl text-[9px] font-black uppercase text-black shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"><Plus size={14} strokeWidth={3} /> Nueva</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar border border-white/5 rounded-[24px] md:rounded-[32px] bg-[#0E1113]">
         <div className="grid grid-cols-[60px_repeat(7,1fr)] md:grid-cols-[100px_repeat(7,1fr)] min-w-[600px] md:min-w-[1000px] h-full">
            {/* Headers row */}
            <div className="h-12 md:h-14 border-b border-white/5 bg-[#090B0D] sticky top-0 z-30" />
            {['LUN 2', 'MAR 3', 'MIE 4', 'JUE 5', 'VIE 6', 'SAB 7', 'DOM 8'].map((d, i) => (
              <div key={i} className={`h-12 md:h-14 border-b border-l border-white/5 bg-[#090B0D] sticky top-0 z-30 flex items-center justify-center text-[9px] md:text-[10px] font-black flex-col ${i===3 ? 'bg-zinc-800/30' : ''}`}>
                 <span className={i===3 ? 'text-green-500' : 'text-zinc-500'}>{d.split(' ')[0]}</span>
                 <span className={`text-sm md:text-lg leading-tight ${i===3 ? 'text-green-500' : 'text-white'}`}>{d.split(' ')[1]}</span>
              </div>
            ))}

            <div className="contents">
               {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(h => (
                  <div key={h} className="contents">
                    <div className="h-[80px] md:h-[100px] border-b border-white/5 flex items-start justify-center p-2 md:p-4 text-[9px] md:text-[10px] font-black text-zinc-700 bg-[#090B0D] sticky left-0 z-20">
                       {h.toString().padStart(2, '0')}:00
                    </div>
                    {[0,1,2,3,4,5,6].map(d => (
                       <div key={d} className={`h-[80px] md:h-[100px] border-b border-l border-white/5 relative bg-white/[0.005] ${d===3 ? 'bg-zinc-800/10' : ''}`}>
                          {d === 0 && h === 14 && (
                             <div className="absolute inset-x-1 top-0 bottom-0 bg-green-500/20 border-l-2 md:border-l-4 border-green-500 rounded-lg md:rounded-xl p-2 md:p-3 shadow-xl backdrop-blur-sm cursor-pointer hover:bg-green-500/30 transition-all z-10">
                                <p className="text-[10px] md:text-[12px] font-black text-white truncate">Santiago G.</p>
                                <p className="text-[8px] md:text-[9px] font-bold text-green-400 uppercase tracking-tighter mt-0.5">Clase</p>
                             </div>
                          )}
                          {d === 2 && h === 14 && (
                             <div className="absolute inset-x-1 top-0 bottom-0 bg-blue-500/20 border-l-2 md:border-l-4 border-blue-500 rounded-lg md:rounded-xl p-2 md:p-3 shadow-xl backdrop-blur-sm cursor-pointer hover:bg-blue-500/30 transition-all z-10">
                                <p className="text-[10px] md:text-[12px] font-black text-white truncate">Valentina R.</p>
                                <p className="text-[8px] md:text-[9px] font-bold text-blue-400 uppercase tracking-tighter mt-0.5">Sesión</p>
                             </div>
                          )}
                       </div>
                    ))}
                  </div>
               ))}
            </div>
         </div>
      </div>
  </div>
);

export default CalendarView;
