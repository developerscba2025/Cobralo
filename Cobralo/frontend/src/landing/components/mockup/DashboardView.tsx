import { Calendar, Users2, ArrowRight, Filter, Plus, Check, Clock, TrendingUp, ChevronRight, DollarSign } from 'lucide-react';
import { bentoBase } from './theme';

interface DashboardViewProps {
  plan?: 'PRO' | 'BASIC';
}

const DashboardView = ({ plan = 'PRO' }: DashboardViewProps) => {
  if (plan === 'BASIC') {
    return (
      <div className="p-4 md:p-10 space-y-10 overflow-auto h-full custom-scrollbar" style={{ background: '#090B0D' }}>
        {/* Basic Header */}
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic">HOLA, USUARIO</h2>
              <span className="text-4xl md:text-5xl animate-bounce" style={{ animationDuration: '3s' }}>👋</span>
           </div>
           <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] opacity-80">Resumen de tu academia hoy</p>
        </div>

        {/* Basic Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {/* Ingresos - Large */}
          <div className="md:col-span-2 p-10 flex flex-col justify-between min-h-[200px]" style={{ ...bentoBase, background: 'linear-gradient(165deg, #121518 0%, #090B0D 100%)' }}>
             <div className="flex justify-between items-start">
                <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.05)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> + MES ACTUAL
                </div>
                <div className="w-12 h-12 rounded-2xl bg-green-500/5 flex items-center justify-center text-green-500 border border-green-500/10 shadow-inner">
                   <DollarSign size={20} />
                </div>
             </div>
             <div className="mt-8">
                <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3 italic">Ingresos (Mes Actual)</p>
                <p className="text-6xl md:text-7xl font-black text-white tracking-tighter">$36.000</p>
             </div>
          </div>

          {/* Alumnos */}
          <div className="p-10 flex flex-col justify-between" style={bentoBase}>
             <div className="flex justify-between items-start">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Alumnos</h3>
                <div className="w-10 h-10 rounded-2xl bg-zinc-800/50 border border-white/5 flex items-center justify-center text-zinc-600">
                   <Users2 size={18} />
                </div>
             </div>
             <div className="mt-6">
                <p className="text-7xl font-black text-white tracking-tighter">2</p>
                <p className="text-[11px] text-zinc-600 font-black uppercase mt-3 tracking-widest">Alumnos Activos</p>
             </div>
          </div>

          {/* Eficiencia */}
          <div className="p-10 flex flex-col justify-between relative overflow-hidden" style={bentoBase}>
             <div className="flex justify-between items-start">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Cobrado</h3>
                <div className="w-10 h-10 rounded-2xl bg-green-500/5 border border-green-500/10 flex items-center justify-center text-green-500">
                   <TrendingUp size={18} />
                </div>
             </div>
             <div className="mt-6">
                <p className="text-7xl font-black text-green-500 tracking-tighter">100%</p>
                <p className="text-[11px] text-zinc-600 font-black uppercase mt-3 tracking-widest">Eficiencia de Cobro</p>
             </div>
             <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500/20">
                <div className="h-full bg-green-500 w-full shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
             </div>
          </div>

          {/* Recent Activity List - Full Width */}
          <div className="md:col-span-4 rounded-[40px] overflow-hidden border border-white/5 bg-[#0E1113] shadow-2xl">
             <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <div className="flex items-center gap-6">
                   <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Actividad Reciente</h3>
                   <div className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> AL DÍA
                   </div>
                </div>
                <div className="text-[10px] font-black text-green-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                   VER TODOS →
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-white/[0.02]">
                         <th className="px-10 py-5 text-[9px] font-black text-zinc-700 uppercase tracking-widest">ALUMNO</th>
                         <th className="px-10 py-5 text-[9px] font-black text-zinc-700 uppercase tracking-widest">SERVICIO</th>
                         <th className="px-10 py-5 text-[9px] font-black text-zinc-700 uppercase tracking-widest">MONTO</th>
                         <th className="px-10 py-5 text-[9px] font-black text-zinc-700 uppercase tracking-widest text-right">ESTADO</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/[0.02]">
                      {[
                        { name: 'pedro', service: 'Ingles', amount: '$36.000', ok: true },
                        { name: 'pamela', service: 'General', amount: '$0', ok: true }
                      ].map((s, i) => (
                        <tr key={i} className="group hover:bg-white/[0.01] transition-all">
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-5">
                                 <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-[11px] font-black text-zinc-600 uppercase">
                                    {s.name.charAt(0)}
                                 </div>
                                 <span className="text-[14px] font-black text-zinc-200 uppercase tracking-tight">{s.name}</span>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <span className="text-[12px] font-bold text-zinc-500">{s.service}</span>
                           </td>
                           <td className="px-10 py-8">
                              <span className="text-[16px] font-black text-white tabular-nums">{s.amount}</span>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-green-500/5 text-green-500 border border-green-500/10 text-[9px] font-black uppercase tracking-widest shadow-inner">
                                 <Check size={12} className="text-green-500"/> COBRADO
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // PRO DASHBOARD
  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-8 overflow-auto custom-scrollbar h-full bg-[#090B0D]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        
        {/* Ingresos (Large Center) */}
        <div className="md:col-span-2 p-8 flex flex-col justify-between" style={{ ...bentoBase, background: 'linear-gradient(165deg, #121518 0%, #090B0D 100%)' }}>
          <div className="flex justify-between items-start">
             <div className="px-4 py-1.5 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-xl text-[10px] font-black text-[#22c55e] uppercase tracking-[0.15em] flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
               <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" /> Registro PRO
             </div>
             <div className="px-4 py-1.5 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-xl text-[10px] font-black text-[#22c55e] uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.1)]">
               +15.4% VS MES PASADO
             </div>
          </div>
          <div className="mt-10">
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-1 italic">Ingresos Cobrados</p>
            <p className="text-5xl md:text-7xl font-black text-white tracking-tighter">$ 248.500</p>
            <p className="text-[10px] md:text-[12px] text-zinc-600 font-bold mt-3 uppercase tracking-wider">
              En tiempo real. <span className="text-amber-500 font-black tracking-widest ml-1">$12.000 PENDIENTES.</span>
            </p>
          </div>
        </div>

        {/* ... Pro Dashboard widgets ... (no changes for now) */}
        <div className="p-8 flex flex-col justify-between" style={bentoBase}>
          <div className="flex justify-between items-start">
             <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">CLASES HOY</h3>
             <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/10"><Calendar size={18} /></div>
          </div>
          <div className="mt-6">
             <p className="text-6xl font-black text-white tracking-tighter">4</p>
             <p className="text-[11px] text-zinc-600 font-black uppercase mt-2 tracking-[0.1em]">3h de enseñanza</p>
          </div>
        </div>

        <div className="p-8 flex flex-col justify-between" style={bentoBase}>
          <div className="flex justify-between items-start">
             <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">ALUMNOS</h3>
             <div className="w-10 h-10 rounded-2xl bg-zinc-800/50 border border-white/5 flex items-center justify-center text-zinc-500"><Users2 size={18} /></div>
          </div>
          <div className="mt-6">
             <p className="text-6xl font-black text-white tracking-tighter">42</p>
             <p className="text-[11px] text-zinc-600 font-black uppercase mt-2 tracking-[0.1em]">Activos</p>
          </div>
        </div>

        <div className="md:col-span-2 p-8" style={bentoBase}>
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
               AGENDA DE HOY <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
             </h3>
             <ArrowRight size={18} className="text-zinc-800 cursor-pointer hover:text-white transition-colors" />
          </div>
          <div className="space-y-4">
            {[
              { time: '14:00', name: 'Martín S.', type: 'Piano Individual', c: '#22c55e' },
              { time: '16:00', name: 'Grupo Avanzado', type: 'Inglés para Adultos', c: '#3b82f6' },
              { time: '18:30', name: 'Lucía Fernández', type: 'Matemática CBC', c: '#f59e0b' }
            ].map((item, i) => (
               <div key={i} className="flex gap-5 items-center group cursor-pointer">
                  <p className="text-[11px] font-black text-zinc-800 w-12 tabular-nums">{item.time}</p>
                  <div className="flex-1 bg-[#111417] border border-white/5 rounded-[24px] p-4 flex items-center justify-between group-hover:bg-[#15191d] group-hover:border-white/10 transition-all border-l-4" style={{ borderLeftColor: item.c }}>
                    <div className="min-w-0">
                       <p className="text-[13px] font-black text-zinc-100 truncate">{item.name}</p>
                       <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">{item.type}</p>
                    </div>
                    <ChevronRight size={16} className="text-zinc-800 group-hover:text-zinc-500 transition-colors" />
                  </div>
               </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 p-8" style={bentoBase}>
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">RECORDATORIOS</h3>
             <Filter size={18} className="text-zinc-800 cursor-pointer hover:text-zinc-400 transition-colors" />
          </div>
          <div className="relative mb-6">
             <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
             <input type="text" placeholder="Nueva tarea..." readOnly className="w-full bg-[#111417] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[11px] font-black text-zinc-500 placeholder:text-zinc-800 focus:outline-none focus:border-green-500/20 transition-all" />
          </div>
          <div className="space-y-3">
             <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.01] border border-zinc-900 group hover:border-zinc-800 transition-all">
                <div className="w-6 h-6 rounded-lg border-2 border-zinc-800 flex items-center justify-center cursor-pointer group-hover:border-[#22c55e] transition-colors" />
                <p className="text-[12px] font-black text-zinc-600 flex-1 group-hover:text-zinc-400 transition-colors">Preparar material para el taller de guitarra</p>
             </div>
             <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#22c55e]/5 border border-[#22c55e]/10 group transition-all">
                <div className="w-6 h-6 rounded-lg border-2 border-[#22c55e] bg-[#22c55e] flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                  <Check size={14} className="text-black stroke-[4]" />
                </div>
                <p className="text-[12px] font-black text-[#22c55e]/60 flex-1 line-through">Revisar pagos de Mercado Pago</p>
             </div>
          </div>
        </div>

        <div className="md:col-span-4 p-8" style={bentoBase}>
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">PRÓXIMOS VENCIMIENTOS</h3>
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]"><Clock size={18} /></div>
           </div>
           <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-xl font-black text-white uppercase tracking-[0.2em]">TODO TRANQUILO</p>
              <p className="text-[11px] font-black text-zinc-700 mt-3 tracking-widest">No hay vencimientos en los próximos 5 días.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
