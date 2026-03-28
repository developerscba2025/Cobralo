import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Users, Settings, Moon, Sun, LogOut, Menu, History, 
  Search, HelpCircle, ExternalLink, Clock
} from 'lucide-react';
import { showToast } from './Toast';
import MobileMenu from './MobileMenu';
import SearchModal from './SearchModal';
import SupportModal from './SupportModal';
import LegalModal from './LegalModal';

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
            : 'text-zinc-500 dark:text-zinc-400 hover:bg-primary-main/10 hover:text-primary-main font-medium';
    };

    const handleOpenLegal = (type: 'terms' | 'privacy') => {
        setLegalType(type);
        setIsLegalOpen(true);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-bg-light dark:bg-bg-dark transition-colors duration-300 font-sans">
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
            <aside className="w-64 bg-white dark:bg-bg-soft border-r border-zinc-100 dark:border-border-emerald p-6 hidden md:flex flex-col relative z-20">
                <div className="mb-10 text-xl font-black italic tracking-tighter uppercase text-primary-main flex items-center group cursor-default">
                    <span>COBRALO</span>
                </div>

                {/* Search trigger */}
                <button
                    onClick={() => setIsSearchOpen(true)}
                    className="mb-8 flex items-center gap-3 p-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-white bg-zinc-50 dark:bg-bg-dark hover:bg-zinc-100 dark:hover:bg-bg-dark rounded-xl transition-all text-sm border border-zinc-100 dark:border-border-emerald group"
                >
                    <Search size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="flex-1 text-left font-medium">Buscar...</span>
                </button>

                <nav className="space-y-2 flex-1">
                    <Link to="/app" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/app')}`}>
                        <PieChart size={20} /> Dashboard
                    </Link>
                    <Link to="/app/students" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/app/students')}`}>
                        <Users size={20} /> Alumnos
                    </Link>
                    <Link to="/app/history" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/app/history')}`}>
                        <History size={20} /> Historial
                    </Link>
                    <Link to="/app/calendar" className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/app/calendar')}`}>
                        <Clock size={20} /> Calendario
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
                                <p className="font-bold text-zinc-900 dark:text-white text-sm truncate leading-tight uppercase tracking-tight">{user?.name}</p>
                                <p className="text-[10px] font-black text-zinc-400 dark:text-emerald-500/60 uppercase tracking-widest flex items-center gap-1.5 mt-0.5 font-accent">
                                    Cobralo {isPro ? 'PRO' : 'FREE'}
                                </p>
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
                                        `${window.location.origin.replace('5173', '5174')}/perfil/${(user as any).bizAlias}` :
                                        `${window.location.origin.replace('5173', '5174')}/perfil/${user?.id}`;
                                      
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
                            className="w-full flex items-center gap-3 p-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all text-sm font-medium"
                        >
                            <HelpCircle size={18} /> Soporte
                        </button>
                    </div>

                    <div className="pt-2 border-t border-emerald-50 dark:border-border-emerald flex items-center justify-between">
                        <button
                            onClick={toggleTheme}
                            className="p-3 text-slate-400 hover:text-white transition-colors"
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
            <main className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-bg-dark overflow-y-auto custom-scrollbar">
                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 z-30 bg-white/90 dark:bg-bg-soft/90 backdrop-blur-md border-b border-zinc-100 dark:border-border-emerald px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-bg-dark transition"
                    >
                        <Menu size={24} className="text-zinc-700 dark:text-white" />
                    </button>
                    <span className="text-lg font-black italic text-primary-main tracking-tighter">COBRALO</span>
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-bg-dark transition text-zinc-500"
                    >
                        <Search size={22} />
                    </button>
                </div>

                <div className="p-6 md:p-10 flex-1">
                    <div className="max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer Legal (Desktop only for now) */}
                <footer className="hidden md:flex items-center justify-center gap-8 py-8 border-t border-zinc-100 dark:border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    <button onClick={() => handleOpenLegal('terms')} className="hover:text-primary-main transition-colors">Términos</button>
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                    <button onClick={() => handleOpenLegal('privacy')} className="hover:text-primary-main transition-colors">Privacidad</button>
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                    <span>© 2026 Cobralo App</span>
                </footer>
            </main>

            <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} onSent={() => showToast.success('Mensaje enviado correctamente')} />
            <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} type={legalType} />
        </div>
    );
};

export default Layout;
