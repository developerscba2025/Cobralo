import { CheckCheck, MessageCircle, LibraryBig, Plus, Search, ChevronRight, MoreHorizontal } from 'lucide-react';

const STUDENTS = [
  { n: 'Lucía Fernández', p: '54117822941', s: 'Matemática CBC', t: ['LUN 14:00', 'MIE 14:00'], c: '$15.000', ok: true, init: 'L' },
  { n: 'Tomás Quiroga', p: '54116523091', s: 'Inglés para Adultos', t: ['MAR 18:00'], c: '$12.000', ok: false, init: 'T' },
  { n: 'Valentina Ríos', p: '54113309228', s: 'Piano Individual', t: ['VIE 15:30'], c: '$8.500', ok: true, init: 'V' },
  { n: 'Juan Pérez', p: '54115240638', s: 'Matemática Primaria', t: ['LUN 16:00', 'MIE 14:00', 'VIE 16:00'], c: '$24.000', ok: true, init: 'J' },
  { n: 'Mateo López', p: '54119920112', s: 'Guitarra Eléctrica', t: ['JUE 11:00'], c: '$10.000', ok: false, init: 'M' },
];

const StudentsView = () => (
  <div className="p-4 md:p-8 flex flex-col h-full bg-[#090B0D]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 md:mb-8">
        <div>
           <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter">Gestión de Alumnos</h2>
           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">42 alumnos • 38 cobrados • 4 pendientes</p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full lg:w-auto">
          <button className="px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] md:text-[10px] font-black uppercase text-zinc-400 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"><CheckCheck size={14}/> Seleccionar</button>
          <button className="px-3 py-2 bg-[#128c7e]/20 border border-[#128c7e]/20 rounded-xl text-[9px] md:text-[10px] font-black uppercase text-[#25d366] hover:bg-[#128c7e]/30 transition-colors flex items-center justify-center gap-2"><MessageCircle size={14}/> WhatsApp</button>
          <button className="px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] md:text-[10px] font-black uppercase text-zinc-400 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"><LibraryBig size={14}/> CSV</button>
          <button className="px-3 py-2 bg-green-500 rounded-xl text-[9px] md:text-[10px] font-black uppercase text-black shadow-lg shadow-green-500/20 hover:scale-105 transition-transform flex items-center justify-center gap-2"><Plus size={14} strokeWidth={3} /> Nuevo</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-[#0E1113] p-3 md:p-4 rounded-2xl md:rounded-3xl border border-white/5 items-stretch sm:items-center">
         <div className="flex-1 relative">
           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
           <input type="text" placeholder="Buscar..." className="w-full bg-[#111417] border border-white/5 rounded-xl py-2 pl-9 pr-3 text-[10px] font-black text-zinc-300 focus:outline-none focus:border-green-500/20"/>
         </div>
         <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
            {[
              { l: 'SERVICIO' },
              { l: 'ESTADO' }
            ].map((f, i) => (
              <div key={i} className="px-3 py-2 bg-[#111417] border border-white/5 rounded-xl text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center justify-between gap-2 cursor-pointer hover:border-zinc-700">
                {f.l} <ChevronRight size={10} className="rotate-90 opacity-40" />
              </div>
            ))}
         </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar border border-white/5 rounded-[24px] md:rounded-[28px] bg-[#0E1113]">
        {/* Desktop Table View */}
        <table className="w-full text-left border-collapse hidden md:table">
          <thead className="sticky top-0 bg-[#0E1113] z-20 border-b border-white/5 px-6">
            <tr>
              <th className="px-8 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">ALUMNO <ChevronRight size={10} className="inline rotate-90" /></th>
              <th className="px-8 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">SERVICIO</th>
              <th className="px-8 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">HORARIOS</th>
              <th className="px-8 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">CUOTA</th>
              <th className="px-8 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">ESTADO</th>
              <th className="px-8 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {STUDENTS.map((s, i) => (
              <tr key={i} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-zinc-400 flex items-center justify-center font-black text-[11px] border border-white/5">
                      {s.init}
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-zinc-200">{s.n}</p>
                      <p className="text-[9px] font-bold text-zinc-600">{s.p}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter block">{s.s}</span>
                </td>
                <td className="px-8 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {s.t.map((t, ti) => (
                      <span key={ti} className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-md text-[8px] font-black border border-green-500/10">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-4 font-black text-zinc-200 text-sm">{s.c}</td>
                <td className="px-8 py-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-inner ${
                    s.ok ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-amber-500/10 text-amber-500 border-amber-500/10'
                  }`}>
                    {s.ok ? '✓ COBRADO' : '● PENDIENTE'}
                  </div>
                </td>
                <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-2.5 bg-[#128c7e]/10 text-[#25d366] rounded-xl hover:bg-[#128c7e]/20 transition-all"><MessageCircle size={14}/></button>
                       <button className="p-2.5 bg-white/5 text-zinc-600 rounded-xl hover:text-zinc-300 transition-all"><MoreHorizontal size={14}/></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile Card List View */}
        <div className="flex flex-col md:hidden divide-y divide-white/[0.03]">
           {STUDENTS.map((s, i) => (
             <div key={i} className="p-4 flex flex-col gap-4 bg-white/[0.01]">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-500 flex items-center justify-center font-black text-[12px] border border-white/5">
                        {s.init}
                      </div>
                      <div>
                        <p className="text-[12px] font-black text-white">{s.n}</p>
                        <p className="text-[10px] font-bold text-zinc-600">{s.s}</p>
                      </div>
                   </div>
                   <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shadow-inner ${
                      s.ok ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-amber-500/10 text-amber-500 border-amber-500/10'
                   }`}>
                      {s.ok ? 'COBRADO' : 'PENDIENTE'}
                   </div>
                </div>

                <div className="flex justify-between items-end">
                   <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                         {s.t.map((t, ti) => (
                            <span key={ti} className="px-1.5 py-0.5 bg-zinc-800/50 text-zinc-500 rounded text-[7px] font-black">{t}</span>
                         ))}
                      </div>
                      <p className="text-sm font-black text-zinc-200">{s.c}</p>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-2.5 bg-[#128c7e]/10 text-[#25d366] rounded-xl"><MessageCircle size={14}/></button>
                      <button className="p-2.5 bg-white/5 text-zinc-600 rounded-xl"><MoreHorizontal size={14}/></button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
  </div>
);

export default StudentsView;
