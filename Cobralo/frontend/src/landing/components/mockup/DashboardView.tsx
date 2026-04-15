import { Calendar, Users2, ArrowRight, Filter, Plus, Check, Clock, TrendingUp, ChevronRight, DollarSign, Zap, Activity, MessageCircle } from 'lucide-react';
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
                <p className="text-6xl md:text-7xl font-black text-white tracking-tighter">$152.000</p>
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
                <p className="text-7xl font-black text-white tracking-tighter">8</p>
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
                <p className="text-7xl font-black text-green-500 tracking-tighter">85%</p>
                <p className="text-[11px] text-zinc-600 font-black uppercase mt-3 tracking-widest">Eficiencia de Cobro</p>
             </div>
             <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500/20">
                <div className="h-full bg-green-500 w-[85%] shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
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
                        { name: 'Valentina R.', service: 'Servicio Pack 8', amount: '$25.000', ok: true },
                        { name: 'Santiago G.', service: 'Clase Grupal', amount: '$15.000', ok: true },
                        { name: 'Milagros L.', service: 'Sesión Única', amount: '$8.500', ok: true }
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
      
           {/* 2. Pro Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase italic">
              BUEN DÍA, USUARIO <span className="animate-bounce inline-block" style={{ animationDuration: '3s' }}>🌅</span>
            </h1>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] opacity-80 leading-none">
              Hoy tenés 7 clases y $45.000 por cobrar.
            </p>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none">
            3 GESTIONES PENDIENTES
          </span>
        </div>
      </div>

      {/* 3. Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        
        {/* Ingresos (Large) */}
        <div className="col-span-2 p-5 lg:p-6 flex flex-col justify-between h-[160px] md:h-[180px]" style={{ ...bentoBase, background: 'linear-gradient(165deg, #121518 0%, #090B0D 100%)' }}>
          <div className="flex justify-between items-start">
             <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-xl text-[8px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
               <TrendingUp size={10} /> +22.8% VS MES PASADO
             </div>
             <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-600">
               <DollarSign size={16} />
             </div>
          </div>
          <div className="mt-4">
            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-0.5 italic leading-none">Ingresos Cobrados</p>
            <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">$ 845.000</p>
            <p className="text-[9px] text-zinc-600 font-bold mt-2 uppercase tracking-wider leading-none">
              <span className="text-amber-500 font-black">$45.000 POR COBRAR.</span>
            </p>
          </div>
        </div>

        {/* Clases Hoy */}
        <div className="p-5 lg:p-6 flex flex-col justify-between h-[160px] md:h-[180px]" style={bentoBase}>
          <div className="flex justify-between items-start">
             <h3 className="text-[9px] font-black text-white uppercase tracking-[0.2em]">CLASES HOY</h3>
             <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 border border-violet-500/10"><Calendar size={16} /></div>
          </div>
          <div className="mt-4">
             <p className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">7</p>
             <p className="text-[10px] text-zinc-600 font-black uppercase mt-2 tracking-[0.1em] leading-none">5h 30m de enseñanza</p>
          </div>
        </div>

        {/* Alumnos Count */}
        <div className="p-5 lg:p-6 flex flex-col justify-between h-[160px] md:h-[180px]" style={bentoBase}>
          <div className="flex justify-between items-start">
             <h3 className="text-[9px] font-black text-white uppercase tracking-[0.2em]">ALUMNOS</h3>
             <div className="w-8 h-8 rounded-xl bg-zinc-800/50 border border-white/5 flex items-center justify-center text-zinc-600"><Users2 size={16} /></div>
          </div>
          <div className="mt-4">
             <p className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">89</p>
             <p className="text-[10px] text-zinc-600 font-black uppercase mt-2 tracking-[0.1em] leading-none">Alumnos Activos</p>
          </div>
        </div>

        {/* Agenda Hoy */}
        <div className="col-span-2 p-5 md:p-6" style={bentoBase}>
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-[9px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
               AGENDA SEMANAL <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
             </h3>
             <ArrowRight size={14} className="text-zinc-800" />
          </div>
          <div className="space-y-3">
            {[
              { time: '14:00', name: 'Valentina R.', type: 'Nivel Inicial', c: '#22c55e', ok: true },
              { time: '15:30', name: 'Santiago G.', type: 'Grupo Avanzado', c: '#3b82f6', ok: false },
              { time: '18:00', name: 'Facundo García', type: 'Clase Mensual', c: '#f59e0b', ok: true }
            ].map((item, i) => (
               <div key={i} className="flex gap-4 items-center">
                  <p className="text-[10px] font-black text-zinc-700 w-10 tabular-nums">{item.time}</p>
                  <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-[20px] p-3 flex items-center justify-between border-l-4" style={{ borderLeftColor: item.c }}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-[9px] font-black text-zinc-500 shrink-0">{item.name.charAt(0)}</div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-black text-zinc-100 truncate">{item.name}</p>
                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest truncate">{item.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                       {!item.ok && <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg"><DollarSign size={12}/></div>}
                       <div className="p-1.5 bg-violet-500/10 text-violet-500 rounded-lg"><Activity size={12}/></div>
                       <div className="p-1.5 bg-primary-main/10 text-primary-main rounded-lg"><MessageCircle size={12}/></div>
                    </div>
                  </div>
               </div>
            ))}
          </div>
        </div>

        {/* Recordatorios */}
        <div className="col-span-2 p-5 md:p-6" style={bentoBase}>
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-[9px] font-black text-white uppercase tracking-[0.3em]">RECORDATORIOS</h3>
             <Filter size={16} className="text-zinc-800" />
          </div>
          <div className="space-y-2.5">
             {[
               { t: 'Preparar material para la clase semanal', done: false },
               { t: 'Revisar pagos de Mercado Pago', done: true },
               { t: 'Actualizar planilla de alumnos', done: false }
             ].map((rem, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border ${rem.done ? 'bg-green-500/5 border-green-500/10 opacity-60' : 'bg-white/[0.01] border-zinc-900'}`}>
                   <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${rem.done ? 'bg-green-500 border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'border-zinc-800'}`}>
                      {rem.done && <Check size={12} className="text-black stroke-[4]" />}
                   </div>
                   <p className={`text-[12px] font-black transition-all ${rem.done ? 'text-green-500/60 line-through' : 'text-zinc-500'}`}>{rem.t}</p>
                </div>
             ))}
          </div>
        </div>

        {/* CHART (Mock) */}
        <div className="col-span-2 p-5 md:p-6" style={bentoBase}>
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[9px] font-black text-white uppercase tracking-[0.3em]">INGRESOS MENSUALES</h3>
              <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500"><TrendingUp size={12} /></div>
           </div>
           <div className="h-32 flex items-end justify-between gap-2 px-1">
              {[40, 65, 45, 90, 55, 80, 70].map((h, i) => (
                <div key={i} className="flex-1 bg-green-500/20 rounded-t-md relative group transition-all hover:bg-green-500/40" style={{ height: `${h}%` }}>
                  {i === 3 && <div className="absolute inset-0 bg-green-500 rounded-t-md shadow-[0_0_20px_rgba(34,197,94,0.4)]" />}
                </div>
              ))}
           </div>
        </div>

        {/* METRICS / DISTRIBUTION (Mock) */}
        <div className="col-span-2 p-5 md:p-6" style={bentoBase}>
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[9px] font-black text-white uppercase tracking-[0.3em]">DISTRIBUCIÓN POR SERVICIO</h3>
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><Activity size={12} /></div>
           </div>
           <div className="space-y-3">
              {[
                { n: 'Clase Individual', c: 12, color: '#22c55e' },
                { n: 'Grupo Avanzado', c: 8, color: '#3b82f6' },
                { n: 'Membresía PRO', c: 5, color: '#f59e0b' }
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest truncate max-w-[80px]">{s.n}</span>
                    <span className="text-[8px] font-black text-white">{s.c} al.</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ backgroundColor: s.color, width: `${(s.c / 12) * 100}%` }} />
                  </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardView;
