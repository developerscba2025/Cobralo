import { LayoutDashboard, Users2, Calendar, LibraryBig, Bell } from 'lucide-react';

interface BottomNavProps {
  active: string;
  onTabChange: (id: string) => void;
}

const ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { id: 'students', icon: Users2, label: 'Alumnos' },
  { id: 'calendar', icon: Calendar, label: 'Agenda' },
  { id: 'classes', icon: LibraryBig, label: 'Clases' },
  { id: 'notifications', icon: Bell, label: 'Alertas' },
];

const BottomNavMockup = ({ active, onTabChange }: BottomNavProps) => {
  return (
    <div className="flex md:hidden items-center justify-around px-4 py-3 bg-[#0E1113] border-t border-white/5 absolute bottom-0 left-0 right-0 z-50">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`flex flex-col items-center gap-1 transition-all ${
            active === item.id ? 'text-green-500' : 'text-zinc-600'
          }`}
        >
          <item.icon size={20} strokeWidth={active === item.id ? 2.5 : 2} />
          <span className="text-[8px] font-black uppercase tracking-widest leading-none">
            {item.label}
          </span>
          {active === item.id && (
            <div className="w-1 h-1 bg-green-500 rounded-full mt-1 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          )}
        </button>
      ))}
    </div>
  );
};

export default BottomNavMockup;
