import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PieChart, Users, Settings, History, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { logout, user } = useAuth();

    const isActive = (path: string) => {
        return location.pathname === path
            ? 'bg-green-700 text-white'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700';
    };

    const menuItems = [
        { path: '/', icon: PieChart, label: 'Dashboard' },
        { path: '/students', icon: Users, label: 'Alumnos' },
        { path: '/history', icon: History, label: 'Historial' },
        { path: '/settings', icon: Settings, label: 'Configuración' },
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
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    />

                    {/* Menu Panel */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 z-50 md:hidden shadow-2xl"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-xl font-black italic text-green-700">COBRALO</span>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    <X size={24} className="text-slate-500" />
                                </button>
                            </div>

                            {/* User Info */}
                            {user && (
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-lg">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">{user.name}</p>
                                            <p className="text-sm text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation */}
                            <nav className="flex-1 p-4 space-y-2">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 p-4 rounded-2xl font-medium transition ${isActive(item.path)}`}
                                    >
                                        <item.icon size={22} />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>

                            {/* Logout */}
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={() => {
                                        logout();
                                        onClose();
                                    }}
                                    className="flex items-center gap-3 p-4 w-full rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium transition"
                                >
                                    <LogOut size={22} />
                                    Cerrar Sesión
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
