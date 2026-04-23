import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Moon, Sun, LogOut, Menu, 
  Search, ExternalLink,
  LayoutDashboard, Calendar, Users2, LibraryBig,
  RefreshCw, Bell, Lock, Banknote, HelpCircle
} from 'lucide-react';
import { showToast } from './Toast';
import MobileMenu from './MobileMenu';
import SearchModal from './SearchModal';
import BottomNav from './BottomNav';
import { api } from '../services/api';
import Container from './ui/Container';
import Tooltip from './ui/Tooltip';

interface LayoutProps {
    children: React.ReactNode;
    scrollable?: boolean;
    fitted?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, scrollable = true, fitted = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { logout, user, isPro } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    
    // Pull to refresh state
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [startY, setStartY] = useState(0);
    const PULL_THRESHOLD = 80;

    // Fetch pending students count (lightweight — only fetches a number from the backend)
    useEffect(() => {
        if (!user) return;
        const fetchPending = async () => {
            try {
                const count = await api.getPendingCount();
                setPendingCount(count);
            } catch (error) { /* silent */ }
        };
        fetchPending();
    }, [location.pathname, user]);


    // Auto-sync plan status (specifically for admin or upgraded accounts)
    const { updateUser } = useAuth();
    useEffect(() => {
        // Only poll if user exists, has a token, and is not PRO yet
        const token = localStorage.getItem('token');
        if (!user || !token || user.plan === 'PRO') return;
        
        const syncUser = async () => {
            const currentToken = localStorage.getItem('token');
            if (!currentToken) return; // Stop if user logged out mid-interval
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                const res = await fetch(`${API_URL}/auth/me`, { 
                    headers: { 'Authorization': `Bearer ${currentToken}` } 
                });
                if (res.ok) {
                    const freshData = await res.json();
                    if (freshData.plan !== user.plan) {
                        updateUser(freshData);
                    }
                }
            } catch { /* silent */ }
        };
        
        // Sync on mount and every 30 seconds if not PRO yet
        syncUser();
        const interval = setInterval(syncUser, 30000);
        return () => clearInterval(interval);
    }, [user?.plan, user?.id]);

    // Poll unread notifications every 60 seconds

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

    // Pull to refresh handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            setStartY(e.touches[0].pageY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY === 0 || window.scrollY > 0 || isRefreshing) return;
        
        const currentY = e.touches[0].pageY;
        const diff = currentY - startY;
        
        if (diff > 0) {
            // Resistance logic
            const distance = Math.min(diff * 0.4, PULL_THRESHOLD + 20);
            setPullDistance(distance);
        }
    };

    const handleTouchEnd = () => {
        if (pullDistance >= PULL_THRESHOLD) {
            triggerRefresh();
        } else {
            setPullDistance(0);
        }
        setStartY(0);
    };

    const triggerRefresh = () => {
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD);
        
        // Soft reload: navigate to same path resets component state without a white flash
        setTimeout(() => {
            navigate(location.pathname, { replace: true });
            setIsRefreshing(false);
            setPullDistance(0);
        }, 800);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-bg-app transition-colors duration-500 font-sans pb-safe">
            {/* Search Modal */}
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            <MobileMenu 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
                onOpenLegal={() => navigate('/app/settings?tab=legal')}
            />

            {/* Sidebar - Desktop */}
            <aside className="w-56 2xl:w-64 bg-surface/80 backdrop-blur-xl border-r border-border-main hidden md:flex flex-col relative z-30 transition-all duration-500 select-none shadow-xl shadow-black/5 overflow-hidden h-screen">
                <div className="p-4 2xl:p-8 flex flex-col h-full">
                    <div className="mb-6 2xl:mb-10 flex items-center justify-between px-1">
                        <div className="flex items-center gap-2.5 group cursor-pointer transition-all">
                            <div className="relative shrink-0">
                                <div className="w-7 h-7 2xl:w-8 2xl:h-8 rounded-[10px] bg-emerald-500 flex items-center justify-center text-black shadow-lg shadow-emerald-500/20">
                                    <span className="font-black text-xs 2xl:text-sm">C</span>
                                </div>
                                <span className="absolute -bottom-1 -right-2 text-[5px] 2xl:text-[6px] font-black px-1 py-0.5 bg-surface text-text-main rounded-md border border-border-main animate-pulse shadow-sm">BETA</span>
                            </div>
                            <span className="text-sm 2xl:text-base font-black tracking-widest uppercase text-text-main group-hover:text-emerald-500 transition-colors">
                                COBRALO
                            </span>
                        </div>

                        {/* Notification Bell next to logo */}
                        <Tooltip content="Ver Notificaciones" position="right">
                            <Link
                                to="/app/notifications"
                                className={`p-2 rounded-xl transition-all relative touch-target ${
                                    location.pathname === '/app/notifications' 
                                    ? 'bg-emerald-500/10 text-emerald-500' 
                                    : 'text-text-muted hover:bg-bg-app hover:text-text-main'
                                }`}
                            >
                                <Bell size={20} className={location.pathname === '/app/notifications' ? 'fill-emerald-500/20' : ''} />
                            </Link>
                        </Tooltip>
                    </div>

                    {/* Search trigger */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="mb-2 2xl:mb-6 flex items-center gap-3 p-2.5 px-4 text-text-muted hover:text-text-main bg-bg-app/50 rounded-2xl transition-all text-[11px] 2xl:text-xs border border-border-main/50 group w-full"
                    >
                        <Search size={16} className="group-hover:scale-110 transition-transform shrink-0" />
                        <span className="flex-1 text-left font-bold opacity-60">Buscar...</span>
                    </button>

                    <nav className="space-y-1.5 2xl:space-y-2 flex-1 py-4">
                        {[
                            { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                            { to: '/app/students', icon: Users2, label: 'Alumnos' },
                            { to: '/app/payments', icon: Banknote, label: 'Cobros' },
                            { to: '/app/calendar', icon: Calendar, label: 'Calendario' },
                            { to: '/app/classes', icon: LibraryBig, label: 'Grupos' },
                            { to: '/app/settings', icon: Settings, label: 'Ajustes' },
                        ].map((item) => {
                            const active = location.pathname === item.to;
                            return (
                                <motion.div
                                    key={item.to}
                                    whileHover={{ x: active ? 0 : 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative"
                                >
                                    <Link 
                                        to={item.to} 
                                        className={`relative flex items-center gap-3 p-2.5 2xl:p-3 rounded-[14px] transition-all duration-300 group z-10 ${
                                            active 
                                            ? 'text-black font-bold' 
                                            : 'text-text-muted hover:bg-emerald-500/5 hover:text-emerald-500 font-bold'
                                        }`}
                                    >
                                        {/* Active Background Pill */}
                                        {active && (
                                            <motion.div 
                                                layoutId="activeTabPill"
                                                className="absolute inset-0 bg-emerald-500 shadow-lg shadow-emerald-500/20 rounded-[14px] -z-10"
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        
                                        <item.icon size={18} className={`shrink-0 transition-transform relative z-20 ${active ? '' : 'group-hover:scale-110'}`} /> 
                                        <span className="tracking-tight relative z-20 text-xs 2xl:text-sm">{item.label}</span>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </nav>
                    
                    {/* New Support Link - Clean and Responsive */}
                    <div className="pt-2 shrink-0">
                        <Link 
                            to="/app/support" 
                            className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 group ${location.pathname === '/app/support' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'text-text-muted hover:bg-emerald-500/5 hover:text-emerald-500'}`}
                        >
                            <div className={`p-2 rounded-[14px] transition-all ${location.pathname === '/app/support' ? 'bg-emerald-500 text-black' : 'bg-emerald-500/10 text-emerald-500 group-hover:scale-110'}`}>
                                <HelpCircle size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[11px] font-black uppercase tracking-widest leading-none">Soporte</p>
                                {location.pathname !== '/app/support' && <p className="text-[9px] font-bold opacity-50 mt-1 hidden 2xl:block">¿Necesitás ayuda?</p>}
                            </div>
                        </Link>
                    </div>

                    {/* User Info & Actions */}
                    <div className="pt-2 border-t border-border-main/30 space-y-2 px-1">
                        {user && (
                            <div className="flex items-center gap-2 mb-2 group cursor-pointer">
                                <div className="w-8 h-8 2xl:w-9 2xl:h-9 rounded-[14px] bg-emerald-500 flex items-center justify-center text-black font-black text-xs shadow-lg shadow-emerald-500/10 uppercase shrink-0 transition-transform group-hover:scale-105 active:scale-95">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-text-main text-[11px] 2xl:text-xs truncate leading-tight uppercase tracking-tight">{user?.name}</p>
                                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-0.5 font-accent flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                        {user?.plan === 'PRO' ? 'PRO' : (user?.plan === 'INITIAL' ? 'BÁSICO' : 'FREE')}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-0.5">
                                <button 
                                    onClick={() => {
                                        if (!isPro) {
                                            showToast.error('Actualizá a Pro para habilitar tu Enlace Público');
                                            return;
                                        }
                                        const profileId = (user as any)?.bizAlias || user?.id;
                                        if (profileId) {
                                          const profileUrl = `${window.location.origin}/profile/${profileId}`;
                                          
                                          // Open in new tab
                                          window.open(profileUrl, '_blank');
                                          
                                          // Also copy to clipboard for convenience
                                          navigator.clipboard.writeText(profileUrl);
                                          showToast.success('Perfil abierto en nueva pestaña y link copiado.');
                                        } else {
                                          showToast.error('Cargando perfil... reintenta en un momento.');
                                        }
                                    }}
                                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isPro ? 'text-text-muted hover:bg-emerald-500/10 hover:text-emerald-500' : 'text-zinc-500/50 bg-zinc-100/50 dark:bg-zinc-800/30 cursor-not-allowed'} group`}
                                >
                                    <ExternalLink size={16} className={`${isPro ? 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5' : ''} transition-transform shrink-0`} /> 
                                    <span className="flex-1 text-left">Enlace Público</span>
                                    {!isPro && <Lock size={12} className="text-emerald-500" />}
                                </button>
                        </div>

                        <div className="pt-1.5 border-t border-border-main/30 flex items-center justify-between gap-1.5">
                            <Tooltip content={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}>
                                <button
                                    onClick={toggleTheme}
                                    className="p-2.5 rounded-xl text-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-emerald-500 transition-all active:scale-95 border border-transparent hover:border-border-main/20"
                                >
                                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                </button>
                            </Tooltip>
                            <Tooltip content="Salir de la aplicación">
                                <button
                                    onClick={logout}
                                    className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-95 border border-transparent hover:border-red-500/10"
                                >
                                    <LogOut size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden 2xl:block">Salir</span>
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main 
                className="flex-1 flex flex-col min-w-0 h-screen bg-bg-app overflow-hidden relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Pull to refresh indicator */}
                <div 
                    className="absolute top-0 left-0 w-full flex justify-center pointer-events-none z-[100]"
                    style={{ height: pullDistance, opacity: pullDistance / PULL_THRESHOLD }}
                >
                    <div className="mt-4 p-2 bg-white dark:bg-bg-soft rounded-full shadow-lg border border-primary-main/20 flex items-center justify-center">
                        <motion.div
                            animate={isRefreshing ? { rotate: 360 } : { rotate: (pullDistance / PULL_THRESHOLD) * 360 }}
                            transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { type: "spring" }}
                        >
                            <RefreshCw size={20} className="text-primary-main" />
                        </motion.div>
                    </div>
                </div>

                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border-main px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="rounded-[12px] hover:opacity-80 transition active:scale-95 touch-target"
                    >
                        {user ? (
                            <div className="w-8 h-8 rounded-[12px] bg-emerald-500 flex items-center justify-center text-black font-black text-xs uppercase shadow-sm">
                                {user.name.charAt(0)}
                            </div>
                        ) : (
                            <div className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-bg-dark transition">
                                <Menu size={24} className="text-zinc-700 dark:text-white" />
                            </div>
                        )}
                    </button>
                    <span className="text-lg font-black text-emerald-500 tracking-widest uppercase">COBRALO</span>
                    <div className="flex items-center gap-1">
                        <Link
                            to="/app/notifications"
                            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-bg-dark transition text-zinc-500 relative touch-target"
                        >
                            <Bell size={22} />
                        </Link>
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-bg-dark transition text-zinc-500 touch-target"
                        >
                            <Search size={22} />
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-bg-dark transition text-zinc-500 touch-target active:scale-90"
                            title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                        >
                            <motion.div
                                key={theme}
                                initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
                                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            >
                                {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-500" />}
                            </motion.div>
                        </button>
                    </div>
                </div>

                <div className={`flex-1 flex flex-col min-h-0 w-full overflow-hidden`}>
                    <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
                        <div className={`flex-1 flex flex-col min-h-0 ${fitted ? 'p-1.5 sm:p-3 md:p-4 lg:p-6' : (scrollable ? 'overflow-y-auto custom-scrollbar pt-2 pb-24 sm:py-3 md:py-4 lg:py-6' : 'py-2 sm:py-3 md:py-4 lg:py-6')}`}>
                            <Container className={`flex-1 flex flex-col min-h-0 ${fitted ? '!p-0 !max-w-none' : ''}`}>
                                {children}
                            </Container>
                        </div>
                    </div>
                </div>

            </main>

            <AnimatePresence>
                {!isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="md:hidden"
                    >
                        <BottomNav pendingCount={pendingCount} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Layout;
