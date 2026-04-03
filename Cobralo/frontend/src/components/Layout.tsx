import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Users, Settings, Moon, Sun, LogOut, Menu, 
  Search, HelpCircle, ExternalLink, Clock, BookOpen
} from 'lucide-react';
import { showToast } from './Toast';
import MobileMenu from './MobileMenu';
import SearchModal from './SearchModal';
import SupportModal from './SupportModal';
import LegalModal from './LegalModal';

import BottomNav from './BottomNav';
import { api } from '../services/api';
import { GENTLE_SPRING } from '../utils/motion';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { logout, user, isPro } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [isLegalOpen, setIsLegalOpen] = useState(false);
    const [legalType, setLegalType] = useState<'terms' | 'privacy'>('terms');
    const [pendingCount, setPendingCount] = useState(0);

    // Fetch pending notifications count
    useEffect(() => {
        if (!user) return;
        const fetchPending = async () => {
            try {
                const students = await api.getStudents();
                setPendingCount(students.filter((s:any) => s.status === 'pending').length);
            } catch (error) {
                // Silently fail for navigation badge
            }
        };
        fetchPending();
    }, [location.pathname, user]);

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
            ? 'bg-primary-main text-white shadow-lg shadow-primary-glow font-bold scale-[1.02]'
            : 'text-text-muted hover:bg-primary-main/10 hover:text-primary-main font-medium';
    };

    const handleOpenLegal = (type: 'terms' | 'privacy') => {
        setLegalType(type);
        setIsLegalOpen(true);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-bg-app transition-colors duration-300 font-sans pb-safe">
            {/* Search Modal */}
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Mobile Menu */}
            <MobileMenu 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
                onOpenSupport={() => setIsSupportOpen(true)}
                onOpenLegal={handleOpenLegal}
            />

            {/* Sidebar - Desktop */}
            <aside className="w-64 bg-surface border-r border-border-main p-6 hidden lg:flex flex-col relative z-20 transition-colors">
                <div className="mb-10 text-xl font-black italic tracking-tighter uppercase text-primary-main flex items-center group cursor-default">
                    <span>COBRALO</span>
                </div>

                {/* Search trigger */}
                <button
                    onClick={() => setIsSearchOpen(true)}
                    className="mb-8 flex items-center gap-3 p-3 text-text-muted hover:text-text-main bg-bg-app rounded-xl transition-all text-sm border border-border-emerald group"
                >
                    <Search size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="flex-1 text-left font-medium">Buscar...</span>
                </button>

                <nav className="space-y-2 flex-1">
                    <Link to="/app/dashboard" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/app/dashboard')}`}>
                        <PieChart size={20} /> Dashboard
                    </Link>
                    <Link to="/app/students" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/app/students')}`}>
                        <Users size={20} /> Alumnos
                    </Link>

                    <Link to="/app/calendar" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/app/calendar')}`}>
                        <Clock size={20} /> Calendario
                    </Link>
                    <Link to="/app/classes" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/app/classes')}`}>
                        <BookOpen size={20} /> Clases
                    </Link>
                    <Link to="/app/settings" className={`flex items-center justify-between p-3 rounded-xl transition-all ${isActive('/app/settings')}`}>
                        <div className="flex items-center gap-3">
                            <Settings size={20} /> Configuración
                        </div>
                    </Link>
                </nav>

                {/* User Info & Actions */}
                <div className="border-t border-emerald-50 dark:border-border-emerald pt-6 mt-4 space-y-4">
                    {user && (
                        <div className="flex items-center gap-3 px-1 mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-sm shadow-inner uppercase">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-text-main text-sm truncate leading-tight uppercase tracking-tight">{user?.name}</p>
                                <p className="text-[9px] font-black text-primary-light/80 uppercase tracking-widest flex items-center gap-1.5 mt-0.5 font-accent">
                                    {user?.plan === 'PRO' ? 'PLAN PRO' : (user?.plan === 'INITIAL' ? 'PLAN BÁSICO (PRUEBA)' : 'PLAN FREE')}
                                </p>
                                {user?.plan === 'INITIAL' && user?.subscriptionExpiry && (
                                    <div className="flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md w-fit">
                                        <Clock size={10} className="text-amber-500" />
                                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider">
                                            {Math.ceil((new Date(user.subscriptionExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} días restantes
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        {isPro && (
                            <button 
                                onClick={() => {
                                    const token = (user as any)?.bizAlias || user?.calendarToken;
                                    if (token) {
                                      const profileUrl = (user as any)?.bizAlias ? 
                                        `${window.location.origin}/app/profile/${(user as any).bizAlias}` :
                                        `${window.location.origin}/app/profile/${user?.id}`;
                                      
                                      navigator.clipboard.writeText(profileUrl);
                                      showToast.success('¡Link de perfil público copiado!');
                                    }
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all text-zinc-500 hover:bg-primary-main/10 hover:text-primary-main group"
                            >
                                <ExternalLink size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> 
                                <span>Perfil Público</span>
                            </button>
                        )}
                        <button 
                            onClick={() => setIsSupportOpen(true)}
                            className="w-full flex items-center gap-3 p-3 text-text-muted hover:bg-primary-main/10 hover:text-primary-main rounded-xl transition-all text-sm font-medium"
                        >
                            <HelpCircle size={18} /> Soporte
                        </button>
                    </div>

                    <div className="pt-2 border-t border-emerald-50 dark:border-border-emerald flex items-center justify-between">
                        <button
                            onClick={toggleTheme}
                            className="p-3 text-text-muted hover:text-primary-main transition-colors"
                            title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={logout}
                            className="p-3 text-red-400 hover:text-red-300 transition-colors"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0 bg-bg-app overflow-y-auto custom-scrollbar transition-colors pb-24 lg:pb-0">
                {/* Mobile Header */}
                <div className="lg:hidden sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border-main px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="rounded-full hover:opacity-80 transition active:scale-95"
                    >
                        {user ? (
                            <div className="w-8 h-8 rounded-full bg-primary-main flex items-center justify-center text-white font-black text-xs uppercase shadow-sm">
                                {user.name.charAt(0)}
                            </div>
                        ) : (
                            <div className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-bg-dark transition">
                                <Menu size={24} className="text-zinc-700 dark:text-white" />
                            </div>
                        )}
                    </button>
                    <span className="text-lg font-black italic text-primary-main tracking-tighter">COBRALO</span>
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-bg-dark transition text-zinc-500"
                    >
                        <Search size={22} />
                    </button>
                </div>

                <div className="px-3 py-4 md:p-10 flex-1 overflow-x-hidden">
                    <div className="max-w-[1600px] mx-auto w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ ...GENTLE_SPRING, duration: 0.2 }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

            </main>

            <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} onSent={() => showToast.success('Mensaje enviado correctamente')} />
            <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} type={legalType} />
            <AnimatePresence>
                {!isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="lg:hidden"
                    >
                        <BottomNav pendingCount={pendingCount} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Layout;
