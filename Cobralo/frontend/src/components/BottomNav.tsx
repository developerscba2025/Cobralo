import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users2, 
    Calendar, 
    Settings, 
    Banknote,
    LibraryBig
} from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
    pendingCount: number;
    unreadNotifCount?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ pendingCount }) => {
    const location = useLocation();

    const menuItems = [
        { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/app/students', icon: Users2, label: 'Alumnos' },
        { path: '/app/payments', icon: Banknote, label: 'Cobros' },
        { path: '/app/calendar', icon: Calendar, label: 'Calendario' },
        { path: '/app/classes', icon: LibraryBig, label: 'Grupos' },
        { path: '/app/settings', icon: Settings, label: 'Ajustes' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-border-main/50 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 z-40 md:hidden flex justify-around items-center">
            {menuItems.map((item) => (
                <motion.div
                    key={item.path}
                    whileTap={{ scale: 0.9 }}
                    className="flex-1"
                >
                    <Link
                        to={item.path}
                        className={`relative flex flex-col items-center justify-center gap-0.5 p-1 transition-all ${
                            isActive(item.path)
                                ? 'text-primary-main'
                                : 'text-text-muted hover:text-text-main'
                        }`}
                    >
                        {/* Active pill indicator */}
                        <div className="relative flex items-center justify-center w-18 h-9 mb-0.5">
                            {isActive(item.path) && (
                                <motion.div
                                    layoutId="bottomNavPill"
                                    className="absolute inset-0 bg-primary-main/15 dark:bg-primary-main/20 rounded-2xl"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <item.icon
                                size={22}
                                strokeWidth={isActive(item.path) ? 2.5 : 2}
                                className="relative z-10"
                            />
                            {/* Pending Students Badge */}
                            {item.path === '/app/students' && pendingCount > 0 && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md shadow-red-500/40 z-20"
                                >
                                    {pendingCount > 9 ? '9+' : pendingCount}
                                </motion.div>
                            )}

                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-tighter transition-all ${
                            isActive(item.path) ? 'opacity-100 scale-105 font-black text-primary-main' : 'opacity-60 font-bold'
                        }`}>
                            {item.label}
                        </span>
                    </Link>
                </motion.div>
            ))}
        </nav>
    );
};

export default BottomNav;
