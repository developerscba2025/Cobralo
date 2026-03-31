import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PieChart, Users, Settings, LogOut, HelpCircle, ShieldCheck, Clock, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSupport?: () => void;
    onOpenLegal?: (type: 'terms' | 'privacy') => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onOpenSupport, onOpenLegal }) => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const isActive = (path: string) => {
        return location.pathname === path
            ? 'bg-primary-main text-white shadow-lg'
            : 'text-text-main hover:bg-primary-main/10 hover:text-primary-main';
    };

    const menuItems = [
        { path: '/app/dashboard', icon: PieChart, label: 'Dashboard' },
        { path: '/app/students', icon: Users, label: 'Alumnos' },
        { path: '/app/calendar', icon: Clock, label: 'Calendario' },
        { path: '/app/settings', icon: Settings, label: 'Configuración' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    />

                    {/* Menu Panel */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-y-0 left-0 w-72 bg-bg-soft-app z-50 md:hidden shadow-2xl flex flex-col"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-border-emerald">
                                <span className="text-xl font-black italic text-primary-main">COBRALO</span>
                                <button
                                    onClick={onClose}
                                    className="p-3 rounded-2xl bg-bg-app text-text-muted hover:text-primary-main transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* User Info */}
                             {user && (
                                <div className="p-6 border-b border-border-emerald bg-bg-app/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-main flex items-center justify-center text-white font-bold text-lg uppercase shadow-lg shadow-primary-glow">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-text-main truncate uppercase tracking-tight">{user.name}</p>
                                            <p className="text-[9px] font-black text-primary-light/80 uppercase tracking-widest mt-0.5">
                                                {user?.plan === 'PRO' ? 'PLAN PRO' : (user?.plan === 'INITIAL' ? 'PLAN BÁSICO' : 'PLAN FREE')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation */}
                            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        className={`flex items-center justify-between p-4 rounded-2xl transition-all ${isActive(item.path)}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <item.icon size={22} className={location.pathname === item.path ? 'text-white' : 'text-slate-400'} />
                                            <span className="font-black uppercase tracking-widest text-[10px]">{item.label}</span>
                                        </div>
                                    </Link>
                                ))}
                            </nav>

                            {/* Footer Area */}
                             <div className="p-4 border-t border-border-emerald space-y-2 bg-bg-app/30">
                                {/* Theme Toggle */}
                                <button 
                                    onClick={toggleTheme}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-primary-main/10 hover:text-primary-main transition-all"
                                >
                                    <motion.div
                                        key={theme}
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                    </motion.div>
                                    {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                                </button>

                                <button 
                                    onClick={() => { onOpenSupport?.(); onClose(); }}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-primary-main/10 hover:text-primary-main"
                                >
                                    <HelpCircle size={20} /> Soporte
                                </button>
                                <button 
                                    onClick={() => { onOpenLegal?.('terms'); onClose(); }}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-primary-main/10 hover:text-primary-main"
                                >
                                    <ShieldCheck size={20} /> Legal
                                </button>
                                <button
                                    onClick={() => { logout(); onClose(); }}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm"
                                >
                                    <LogOut size={20} /> Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileMenu;
