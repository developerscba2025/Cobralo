import { User, LibraryBig, DollarSign, MessageCircle } from 'lucide-react';

const SettingsView = () => (
  <div className="flex flex-col md:flex-row flex-1 h-full overflow-hidden bg-[#090B0D]">
     {/* Sidebar - Hidden on mobile, visible on desktop */}
     <div className="hidden md:flex w-64 border-r border-white/5 p-6 flex-col gap-8 flex-shrink-0">
        <div>
           <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">AJUSTES</h2>
           <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Gestioná tu cuenta y academia</p>
        </div>

        <nav className="space-y-6">
           <div>
              <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                 <User size={10} /> MI PERFIL
              </p>
              <div className="space-y-1">
                 <div className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase hover:text-white cursor-pointer">DATOS PERSONALES</div>
                 <div className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase hover:text-white cursor-pointer">SEGURIDAD</div>
              </div>
           </div>
           <div>
              <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                 <LibraryBig size={10} /> MI ACADEMIA
              </p>
              <div className="space-y-1">
                 <div className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase hover:text-white cursor-pointer">MI MARCA</div>
                 <div className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase hover:text-white cursor-pointer">SERVICIOS</div>
                 <div className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase hover:text-white cursor-pointer">TESTIMONIOS</div>
              </div>
           </div>
           <div>
              <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                 <DollarSign size={10} /> GESTIÓN
              </p>
              <div className="space-y-1">
                 <div className="px-4 py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl text-[10px] font-black text-green-500 uppercase">PAGOS Y MENSAJES</div>
                 <div className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase hover:text-white cursor-pointer">PLAN</div>
              </div>
           </div>
        </nav>
     </div>

     {/* Mobile Header - Only visible on mobile */}
     <div className="md:hidden p-4 border-b border-white/5 bg-[#090B0D]">
        <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">AJUSTES</h2>
        <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Configuración Pro</p>
     </div>

     {/* Main Content Area */}
     <div className="flex-1 p-4 md:p-8 overflow-auto custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-6 md:space-y-10">
           <div>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3 md:gap-4">
                 <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/10"><MessageCircle size={18} className="md:w-[22px] md:h-[22px]" /></div>
                 AUTOMATIZACIÓN Y PAGOS
              </h3>
              <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2 md:ml-14">Simplifica tu gestión y cobros</p>
           </div>

           <div className="space-y-4 md:space-y-6">
              {/* Recordatorios */}
              <div className="bg-[#0E1113] border border-white/5 rounded-[24px] md:rounded-[32px] p-5 md:p-8 shadow-2xl">
                 <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div>
                       <h4 className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.2em]">RECORDATORIOS AUTOMÁTICOS</h4>
                       <p className="text-[8px] md:text-[9px] text-zinc-600 font-bold uppercase mt-1">Email y WhatsApp</p>
                    </div>
                    <div className="w-10 h-5 md:w-12 md:h-6 bg-green-500 rounded-full relative p-1">
                       <div className="absolute right-1 top-1 w-3 h-3 md:w-4 md:h-4 bg-black rounded-full" />
                    </div>
                 </div>

                 <div className="relative group">
                    <div className="absolute -top-2.5 left-4 md:left-6 px-2 md:px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-[7px] md:text-[8px] font-black text-green-500 uppercase z-10">PLANTILLA WHATSAPP</div>
                    <div className="w-full bg-[#090B0D] border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-8 text-[11px] md:text-sm font-bold text-zinc-400 min-h-[100px] md:min-h-[140px] shadow-inner leading-relaxed">
                       Hola <span className="text-green-500">{`{alumno}`}</span>, te recordamos el pago de <span className="text-green-500">{`{servicio}`}</span> por <span className="text-green-500">{`{monto}`}</span>.
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-1.5 md:gap-2 mt-4 md:mt-6">
                    {['ALUMNO', 'MONTO', 'SERVICIO'].map(tag => (
                       <span key={tag} className="px-2 py-1 md:px-3 md:py-1.5 bg-[#090B0D] border border-white/5 rounded-lg md:rounded-xl text-[7px] md:text-[8px] font-black text-zinc-600 uppercase">
                          {`{${tag.toLowerCase()}}`}
                       </span>
                    ))}
                 </div>
              </div>

              {/* Aviso Clase - Simplified for mobile mockup */}
              <div className="bg-[#0E1113] border border-white/5 rounded-[24px] md:rounded-[32px] p-5 md:p-8 shadow-2xl opacity-60">
                 <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div>
                       <h4 className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.2em]">AVISO PREVIO</h4>
                       <p className="text-[8px] md:text-[9px] text-zinc-600 font-bold uppercase mt-1">2 horas antes</p>
                    </div>
                    <div className="w-10 h-5 md:w-12 md:h-6 bg-zinc-800 rounded-full relative p-1">
                       <div className="absolute left-1 top-1 w-3 h-3 md:w-4 md:h-4 bg-zinc-600 rounded-full" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
     </div>
  </div>
);

export default SettingsView;
