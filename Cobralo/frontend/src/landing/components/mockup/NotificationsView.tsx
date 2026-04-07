import { Bell } from 'lucide-react';

const NotificationsView = () => (
   <div className="flex flex-1 flex-col h-full bg-[#090B0D] p-6 md:p-8">
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0E1113] border border-white/5 rounded-[40px] shadow-2xl relative overflow-hidden">
         <div className="w-20 h-20 rounded-[28px] bg-green-500/10 text-green-500 flex items-center justify-center mb-10 border border-green-500/10 shadow-[0_20px_50px_rgba(34,197,94,0.1)]">
            <Bell size={36} />
         </div>
         <h3 className="text-2xl font-black text-white tracking-[0.05em] uppercase mb-3">NO HAY NINGUNA NOTIFICACIÓN</h3>
         <p className="text-sm font-bold text-zinc-500 max-w-sm text-center leading-relaxed">Te avisaremos cuando ocurra algo importante en tu academia.</p>
      </div>
   </div>
);

export default NotificationsView;
