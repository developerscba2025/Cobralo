import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PieChart, Users, Settings, History, LogOut, HelpCircle, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSupport?: () => void;
    onOpenLegal?: (type: 'terms' | 'privacy') => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onOpenSupport, onOpenLegal }) => {
    const location = useLocation();
    const { logout, user } = useAuth();

    const isActive = (path: string) => {
        return location.pathname === path
            ? 'bg-green-700 text-white shadow-lg'
            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800';
    };

    const menuItems = [
        { path: '/app', icon: PieChart, label: 'Dashboard' },
        { path: '/app/students', icon: Users, label: 'Alumnos' },
        { path: '/app/history', icon: History, label: 'Historial' },
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
                        className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 z-50 md:hidden shadow-2xl flex flex-col"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-xl font-black italic text-green-700">COBRALO</span>
                                <button
                                    onClick={onClose}
                                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* User Info */}
                            {user && (
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-green-700 flex items-center justify-center text-white font-bold text-lg uppercase shadow-lg shadow-green-700/20">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Cobralo App</p>
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
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/30 dark:bg-slate-900/30">
                                <button 
                                    onClick={() => { onOpenSupport?.(); onClose(); }}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <HelpCircle size={20} /> Soporte
                                </button>
                                <button 
                                    onClick={() => { onOpenLegal?.('terms'); onClose(); }}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
