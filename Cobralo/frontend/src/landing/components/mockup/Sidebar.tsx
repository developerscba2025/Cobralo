import { 
  LayoutDashboard, Users2, Calendar, LibraryBig, Bell, Search, 
  ExternalLink, Sun, LogOut 
} from 'lucide-react';

interface SidebarProps {
  active: string;
  onTabChange: (id: string) => void;
}

// Special handling for Settings icon to avoid conflict with the component name
import { Settings as LucideSettings } from 'lucide-react';
const SettingsIcon = LucideSettings;

const SIDEBAR_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'students', icon: Users2, label: 'Alumnos' },
  { id: 'calendar', icon: Calendar, label: 'Calendario' },
  { id: 'classes', icon: LibraryBig, label: 'Clases' },
  { id: 'settings', icon: SettingsIcon, label: 'Ajustes' },
];

const MiniSidebar = ({ active, onTabChange }: SidebarProps) => (
  <div className="w-[220px] flex-shrink-0 hidden md:flex flex-col p-5 border-r relative z-10"
    style={{ background: '#090B0D', borderColor: 'rgba(255,255,255,0.03)' }}>
    
    <div className="flex items-center justify-between mb-8 px-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black italic text-[12px] shadow-lg shadow-green-500/20"
          style={{ background: '#22c55e', color: '#090B0D' }}>C</div>
        <span className="font-black italic tracking-tighter text-base" style={{ color: '#fafafa' }}>COBRALO</span>
      </div>
      <div className="relative cursor-pointer group" onClick={() => onTabChange('notifications')}>
        <div className={`p-2 rounded-xl transition-all ${active === 'notifications' ? 'bg-green-500/10 text-green-500' : 'text-zinc-700 hover:text-zinc-300'}`}>
          <Bell size={18} />
        </div>
        <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#090B0D]" />
      </div>
    </div>

    <div className="px-2 mb-8">
       <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            readOnly
            className="w-full bg-[#111417] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-[10px] font-black text-zinc-500 focus:outline-none focus:border-green-500/20 transition-all placeholder:text-zinc-800" 
          />
       </div>
    </div>

    <nav className="space-y-2 flex-1">
      {SIDEBAR_ITEMS.map((item) => (
        <div key={item.id}
          onClick={() => onTabChange(item.id)}
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all relative overflow-hidden group cursor-pointer"
          style={item.id === active
            ? { background: '#22c55e', color: '#000' }
            : { color: '#52525b' }}>
          <item.icon size={18} className={item.id === active ? 'text-black' : 'group-hover:text-zinc-300'} />
          {item.label}
        </div>
      ))}
    </nav>
    
    <div className="mt-auto space-y-6">
       <div className="px-2">
          <div className="flex items-center gap-4 p-4 rounded-[28px] bg-[#111417] border border-white/5">
             <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-[12px] font-black text-green-500 border border-green-500/20">U</div>
             <div className="min-w-0">
                <p className="text-[11px] font-black text-white truncate">USUARIO PRO</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                   <p className="text-[9px] font-black text-green-500 uppercase tracking-widest leading-none">Activo</p>
                </div>
             </div>
          </div>
       </div>

       <div className="px-2 space-y-2 pb-2">
          <div className="flex items-center gap-4 px-4 py-3 rounded-2xl border border-white/5 bg-[#111417]/50 text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer group">
             <ExternalLink size={16} className="group-hover:text-green-500 transition-colors" />
             <span className="text-[9px] font-black uppercase tracking-[0.2em]">ENLACE PÚBLICO</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 mt-4">
             <Sun size={18} className="text-zinc-800 hover:text-zinc-300 cursor-pointer transition-colors" />
             <LogOut size={18} className="text-zinc-800 hover:text-red-500 cursor-pointer transition-colors" />
          </div>
       </div>
    </div>
  </div>
);

export default MiniSidebar;
