import { 
  LayoutDashboard, Users2, Calendar, LibraryBig, Bell, Search, 
  ExternalLink, Sun, LogOut, Banknote 
} from 'lucide-react';

interface SidebarProps {
  active: string;
  onTabChange: (id: string) => void;
  plan?: 'PRO' | 'BASIC';
}

// Special handling for Settings icon to avoid conflict with the component name
import { Settings as LucideSettings } from 'lucide-react';
const SettingsIcon = LucideSettings;

const SIDEBAR_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'students', icon: Users2, label: 'Alumnos' },
  { id: 'payments', icon: Banknote, label: 'Cobros' },
  { id: 'calendar', icon: Calendar, label: 'Calendario' },
  { id: 'classes', icon: LibraryBig, label: 'Clases' },
  { id: 'settings', icon: SettingsIcon, label: 'Ajustes' },
];

const MiniSidebar = ({ active, onTabChange, plan = 'PRO' }: SidebarProps) => (
  <div className="w-[240px] flex-shrink-0 hidden md:flex flex-col p-6 border-r relative z-10"
    style={{ background: '#090B0D', borderColor: 'rgba(255,255,255,0.03)' }}>
    
    {/* Logo Area */}
    <div className="flex items-center justify-between mb-8 px-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black italic text-[12px] shadow-lg shadow-green-500/20"
          style={{ background: '#22c55e', color: '#090B0D' }}>C</div>
        <div className="flex items-center gap-2">
           <span className="font-black italic tracking-tighter text-lg" style={{ color: '#fafafa' }}>COBRALO</span>
           <span className="text-[8px] font-black px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded border border-green-500/20">BETA</span>
        </div>
      </div>
      <div className="text-zinc-700 hover:text-zinc-300 transition-colors cursor-pointer">
        <Bell size={18} />
      </div>
    </div>

    {/* Search Box */}
    <div className="px-2 mb-8">
       <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
          <input 
            type="text" 
            placeholder="Buscar alumnos..." 
            readOnly
            className="w-full bg-[#111417] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-[10px] font-black text-zinc-500 focus:outline-none focus:border-green-500/20 transition-all placeholder:text-zinc-800 shadow-inner" 
          />
       </div>
    </div>

    <nav className="space-y-2 flex-1">
      {SIDEBAR_ITEMS.map((item) => (
        <div key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`flex items-center gap-4 px-5 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all relative overflow-hidden group cursor-pointer ${
            item.id === active ? 'bg-[#22c55e] text-black shadow-lg shadow-green-500/10' : 'text-zinc-600 hover:text-zinc-300'
          }`}
        >
          <item.icon size={18} className={item.id === active ? 'text-black' : 'group-hover:text-zinc-300'} />
          {item.label}
        </div>
      ))}
    </nav>
    
    <div className="mt-auto pt-8 space-y-6">
       {/* Support Box */}
       <div className="px-2">
          <div className="p-5 rounded-[24px] bg-green-500/5 border border-green-500/10 space-y-4">
             <div>
                <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] mb-1">SOPORTE COBRALO</p>
                <p className="text-[9px] font-medium text-zinc-500 leading-relaxed">
                   Si ves un error o algo no funciona, escribinos un mensaje para ayudarte.
                </p>
             </div>
             <div className="w-full py-2.5 bg-green-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl text-center shadow-lg shadow-green-500/10 cursor-pointer hover:bg-white transition-colors">
                Contactar Soporte
             </div>
          </div>
       </div>

       {/* User Info */}
       <div className="px-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-[#0E1113] border border-white/5 flex items-center justify-center text-[12px] font-black text-green-500">U</div>
             <div className="min-w-0">
                <p className="text-[11px] font-black text-white truncate uppercase tracking-tighter">{plan === 'PRO' ? 'USUARIO PRO' : 'USUARIO BÁSICO'}</p>
                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{plan === 'PRO' ? '+ PRO' : '+ FREE'}</p>
             </div>
          </div>
          <LogOut size={18} className="text-zinc-800 hover:text-red-500 cursor-pointer transition-colors" />
       </div>

       <div className="px-2 flex items-center justify-between border-t border-white/5 pt-4 pb-2">
          <Sun size={18} className="text-zinc-800 hover:text-zinc-300 cursor-pointer" />
          <div className="flex items-center gap-2 text-zinc-800 text-[9px] font-black uppercase tracking-widest hover:text-green-500 cursor-pointer transition-colors group">
             ENLACE PÚBLICO <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
       </div>
    </div>
  </div>
);

export default MiniSidebar;
