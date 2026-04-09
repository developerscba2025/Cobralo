import { DollarSign, Clock, CheckCircle2, Filter, Download, Zap } from 'lucide-react';

interface PaymentsViewProps {
  plan?: 'PRO' | 'BASIC';
}

const PaymentsView = ({ plan = 'PRO' }: PaymentsViewProps) => (
  <div className="p-4 md:p-10 space-y-8 overflow-auto h-full custom-scrollbar" style={{ background: '#090B0D' }}>
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">COBROS</h2>
        <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Gestión de ingresos y pendientes.</p>
      </div>
      <div className="px-6 py-4 bg-green-500/10 border border-green-500/20 rounded-[28px] flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-green-500 flex items-center justify-center text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          <DollarSign size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black text-green-500 uppercase tracking-widest leading-none mb-1">Total del mes</p>
          <p className="text-2xl font-black text-white tracking-tight leading-none">$ 248.500</p>
        </div>
      </div>
    </div>

    {/* Tabs Mockup */}
    <div className="flex gap-2 p-1.5 bg-[#111417] border border-white/5 rounded-2xl w-fit">
      <div className="px-6 py-3 bg-green-500 text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/20">Pendientes</div>
      <div className="px-6 py-3 text-zinc-600 font-black text-[10px] uppercase tracking-widest">Historial</div>
    </div>

    {/* Content */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { name: 'Martín S.', service: 'PIANO INDIVIDUAL', amount: '18.000', day: '10' },
        { name: 'Grupo Avanzado', service: 'INGLÉS PARA ADULTOS', amount: '24.500', day: '05' },
      ].map((p, i) => (
        <div key={i} className="p-6 bg-[#111417] border border-white/5 rounded-[32px] group hover:border-green-500/20 transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 font-black text-lg group-hover:bg-green-500 group-hover:text-black transition-all">
                {p.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-black text-white text-base tracking-tight">{p.name}</h4>
                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-0.5">{p.service}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Deuda</p>
              <p className="text-xl font-black text-white">$ {p.amount}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-5 border-t border-white/[0.03]">
            <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              <Clock size={14} className="text-green-500" />
              Vence el {p.day}
            </div>
            <div className="flex gap-2">
                {plan === 'PRO' && (
                    <div className="px-5 py-2.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.05)]">
                        <Zap size={12} fill="currentColor" /> Link
                    </div>
                )}
                <div className="px-5 py-2.5 bg-green-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/10">Registrar</div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Bottom Table placeholder */}
    <div className="bg-[#111417] border border-white/5 rounded-[32px] overflow-hidden">
        <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">RECIENTES</h4>
            <div className="flex gap-2">
                <div className="p-2 rounded-xl bg-zinc-900 text-zinc-500 border border-white/5"><Filter size={14}/></div>
                {plan === 'PRO' && (
                    <div className="p-2 rounded-xl bg-zinc-900 text-zinc-500 border border-white/5"><Download size={14}/></div>
                )}
            </div>
        </div>
        <div className="p-4 space-y-2">
            {[1, 2, 3].map(item => (
                <div key={item} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5 group">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] font-black text-zinc-500">
                          {item}
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Cobro registrado</p>
                            <p className="text-[10px] font-bold text-zinc-600">Hoy • 14:32 HS</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <p className="text-[11px] font-black text-green-500">$ 12.000</p>
                        <CheckCircle2 size={16} className="text-green-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            ))}
        </div>
    </div>
  </div>
);

export default PaymentsView;
