import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { PieChart, Users, Settings, Moon, Sun, LogOut, Menu, History, Calendar, Search, DollarSign } from 'lucide-react';
import MobileMenu from './MobileMenu';
import SearchModal from './SearchModal';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { logout, user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Global keyboard shortcut Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const isActive = (path: string) => {
        return location.pathname === path
            ? 'bg-green-700 text-white shadow-lg font-bold'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium';
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-bg-dark transition-colors duration-300">
            {/* Search Modal */}
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Mobile Menu */}
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            {/* Sidebar - Desktop */}
            <aside className="w-64 bg-slate-900 dark:bg-bg-soft text-white p-6 hidden md:flex flex-col border-r border-slate-800">
                <div className="mb-10 text-xl font-black italic tracking-tighter uppercase text-green-400 flex items-center gap-2">
                    <span>COBRALO</span>
                </div>

                {/* Search trigger */}
                <button
                    onClick={() => setIsSearchOpen(true)}
                    className="mb-6 flex items-center gap-3 p-3 text-slate-500 hover:text-slate-300 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all text-sm"
                >
                    <Search size={18} />
                    <span className="flex-1 text-left">Buscar...</span>
                    <kbd className="px-2 py-0.5 text-[10px] bg-slate-700 rounded">⌘K</kbd>
                </button>

                <nav className="space-y-2 flex-1">
                    <Link to="/" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/')}`}>
                        <PieChart size={20} /> Dashboard
                    </Link>
                    <Link to="/students" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/students')}`}>
                        <Users size={20} /> Alumnos
                    </Link>
                    <Link to="/calendar" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/calendar')}`}>
                        <Calendar size={20} /> Calendario
                    </Link>
                    <Link to="/history" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/history')}`}>
                        <History size={20} /> Historial
                    </Link>
                    <Link to="/receipts" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/receipts')}`}>
                        <DollarSign size={20} /> Recibos
                    </Link>
                    <Link to="/settings" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/settings')}`}>
                        <Settings size={20} /> Configuración
                    </Link>
                </nav>

                {/* User Info */}
                {user && (
                    <div className="border-t border-slate-800 pt-4 pb-2 mb-2">
                        <div className="flex items-center gap-3 px-2">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                {user.isPro && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-slate-900 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <p className="font-semibold text-white text-sm truncate">{user.name}</p>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${
                                        user.isPro 
                                        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' 
                                        : 'bg-slate-700 text-slate-400 border border-slate-600'
                                    }`}>
                                        {user.plan}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="border-t border-slate-800 pt-4 space-y-2">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all font-medium"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                    </button>

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all font-medium"
                    >
                        <LogOut size={20} /> Salir
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 z-30 bg-white/80 dark:bg-bg-dark/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                        <Menu size={24} className="text-slate-700 dark:text-white" />
                    </button>
                    <span className="text-lg font-black italic text-green-700">COBRALO</span>
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                        <Search size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-6 md:p-10">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
