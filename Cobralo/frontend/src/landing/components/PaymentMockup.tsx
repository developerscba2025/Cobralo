import { motion } from 'framer-motion';
import { CreditCard, Check, ShieldCheck, ArrowRight } from 'lucide-react';

const PaymentMockup = () => {
  return (
    <div className="w-full h-full bg-[#111418] flex items-center justify-center p-6 sm:p-10 overflow-hidden font-sans select-none">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }}
        className="w-full max-w-sm rounded-[32px] bg-[#171A1D] border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden relative"
      >
        {/* Header Decor */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent opacity-50" />
        
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center">
                <CreditCard size={16} className="text-[#22c55e]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Generar Cobro</span>
            </div>
            <div className="flex items-center gap-1 opacity-40">
               <div className="w-1 h-1 rounded-full bg-white" />
               <div className="w-1 h-1 rounded-full bg-white" />
               <div className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>

          <div className="space-y-6">
            {/* Input Alumno */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Alumno / Cliente</label>
              <div className="h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center px-4">
                <span className="text-sm font-bold text-white">Lucas Ferrero</span>
              </div>
            </div>

            {/* Input Monto */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Monto a Cobrar</label>
              <div className="h-14 rounded-2xl bg-[#0E1113] border border-[#22c55e]/30 flex items-center justify-between px-4 group">
                <div className="flex items-center gap-2">
                   <span className="text-lg font-black text-[#22c55e]">$</span>
                   <span className="text-2xl font-black text-white tracking-tight">12.500</span>
                </div>
                <div className="px-2 py-1 rounded-md bg-[#22c55e]/10 text-[8px] font-black text-[#22c55e] border border-[#22c55e]/20 uppercase tracking-widest">ARS</div>
              </div>
            </div>

            {/* Action Button */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 rounded-2xl bg-[#22c55e] text-[#090B0D] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-[0_12px_24px_rgba(34,197,94,0.3)] mt-2"
            >
              Crear Link de Pago
              <ArrowRight size={14} />
            </motion.button>
          </div>

          {/* Secure Footer */}
          <div className="mt-8 flex items-center justify-center gap-4 opacity-30">
             <div className="flex items-center gap-1.5">
                <ShieldCheck size={10} />
                <span className="text-[8px] font-black uppercase tracking-widest">Encriptación SSL</span>
             </div>
             <div className="w-1 h-1 rounded-full bg-zinc-600" />
             <div className="flex items-center gap-1.5">
                <Check size={10} />
                <span className="text-[8px] font-black uppercase tracking-widest">vía Mercado Pago</span>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative elements behind */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #22c55e 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
};

export default PaymentMockup;
