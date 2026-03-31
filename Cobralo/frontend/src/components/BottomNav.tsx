import { Link, useLocation } from 'react-router-dom';
import { PieChart, Users, Clock, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
    pendingCount: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ pendingCount }) => {
    const location = useLocation();

    const menuItems = [
        { path: '/app/dashboard', icon: PieChart, label: 'Inicio' },
        { path: '/app/students', icon: Users, label: 'Alumnos' },
        { path: '/app/calendar', icon: Clock, label: 'Agenda' },
        { path: '/app/settings', icon: Settings, label: 'Más' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-border-main/50 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 z-40 md:hidden flex justify-around items-center">
            {menuItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex flex-col items-center gap-0.5 p-2 min-w-[64px] transition-all ${
                        isActive(item.path)
                            ? 'text-primary-main'
                            : 'text-text-muted hover:text-text-main'
                    }`}
                >
                    {/* Active pill indicator */}
                    <div className="relative flex items-center justify-center w-16 h-8">
                        {isActive(item.path) && (
                            <motion.div
                                layoutId="bottomNavPill"
                                className="absolute inset-0 bg-primary-main/10 dark:bg-primary-main/15 rounded-full"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        <item.icon
                            size={20}
                            strokeWidth={isActive(item.path) ? 2.5 : 1.8}
                            className="relative z-10"
                        />
                        {/* Status Badge from Red */}
                        {item.path === '/app/students' && pendingCount > 0 && (
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-[6px] flex items-center justify-center shadow-md shadow-red-500/30 z-20"
                            >
                                {pendingCount > 9 ? '9+' : pendingCount}
                            </motion.div>
                        )}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${
                        isActive(item.path) ? 'opacity-100' : 'opacity-50'
                    }`}>
                        {item.label}
                    </span>
                </Link>
            ))}
        </nav>
    );
};

export default BottomNav;
