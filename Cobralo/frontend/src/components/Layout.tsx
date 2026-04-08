import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Moon, Sun, LogOut, Menu, 
  Search, ExternalLink,
  LayoutDashboard, Calendar, Users2, LibraryBig,
  RefreshCw, Bell, Lock, Banknote
} from 'lucide-react';
import { showToast } from './Toast';
import MobileMenu from './MobileMenu';
import SearchModal from './SearchModal';
import BottomNav from './BottomNav';
import { api } from '../services/api';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { logout, user, isPro } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);
    
    // Pull to refresh state
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [startY, setStartY] = useState(0);
    const PULL_THRESHOLD = 80;

    // Fetch pending students count
    useEffect(() => {
        if (!user) return;
        const fetchPending = async () => {
            try {
                const data = await api.getStudents();
                if (Array.isArray(data)) {
                    setPendingCount(data.filter((s:any) => s.status === 'pending').length);
                }
            } catch (error) { /* silent */ }
        };
        fetchPending();
    }, [location.pathname, user]);

    // Poll unread notifications every 60 seconds
    useEffect(() => {
        if (!user) return;
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const token = localStorage.getItem('token');
        const fetchUnread = async () => {
            try {
                const res = await fetch(`${API_URL}/notifications/unread-count`, { 
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {} 
                });
                if (res.ok) {
                    const data = await res.json();
                    setUnreadNotifCount(data.count ?? 0);
                }
            } catch { /* silent */ }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 60000);
        return () => clearInterval(interval);
    }, [user]);

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
        
        // Visual feedback then reload or re-fetch
        setTimeout(() => {
            window.location.reload();
        }, 800);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-bg-app transition-colors duration-500 font-sans pb-safe">
            {/* Search Modal */}
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            <MobileMenu 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
                onOpenSupport={() => navigate('/app/settings?tab=support')}
                onOpenLegal={() => navigate('/app/settings?tab=legal')}
            />

            {/* Sidebar - Desktop */}
            <aside className="w-56 2xl:w-64 bg-surface/80 backdrop-blur-xl border-r border-border-main hidden md:flex flex-col relative z-30 transition-all duration-500 select-none shadow-xl shadow-black/5">
                <div className="p-5 flex flex-col h-full">
                    <div className="mb-10 flex items-center justify-between">
                        <div className="flex items-center gap-3 group cursor-pointer transition-all">
                            <div className="w-8 h-8 rounded-xl bg-primary-main flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary-main/20">
                                <span className="font-black italic text-sm">C</span>
                            </div>
                            <span className="text-xl font-black italic tracking-tighter uppercase text-text-main group-hover:text-primary-main transition-colors">
                                COBRALO
                            </span>
                        </div>

                        {/* Notification Bell next to logo */}
                        <Link
                            to="/app/notifications"
                            className={`p-2 rounded-xl transition-all relative touch-target ${
                                location.pathname === '/app/notifications' 
                                ? 'bg-primary-main/10 text-primary-main' 
                                : 'text-text-muted hover:bg-bg-app hover:text-text-main'
                            }`}
                            title="Notificaciones"
                        >
                            <Bell size={20} className={location.pathname === '/app/notifications' ? 'fill-primary-main/20' : ''} />
                            {unreadNotifCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Search trigger */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="mb-8 flex items-center gap-3 p-3 px-4 text-text-muted hover:text-text-main bg-bg-app/50 rounded-2xl transition-all text-xs border border-border-main/50 group w-full"
                    >
                        <Search size={18} className="group-hover:scale-110 transition-transform shrink-0" />
                        <span className="flex-1 text-left font-bold opacity-60">Buscar alumnos...</span>
                    </button>

                    <nav className="space-y-1.5 flex-1">
                        {[
                            { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                            { to: '/app/students', icon: Users2, label: 'Alumnos' },
                            { to: '/app/payments', icon: Banknote, label: 'Cobros' },
                            { to: '/app/calendar', icon: Calendar, label: 'Calendario' },
                            { to: '/app/classes', icon: LibraryBig, label: 'Clases' },
                            { to: '/app/settings', icon: Settings, label: 'Ajustes' },
                        ].map((item) => {
                            const active = location.pathname === item.to;
                            return (
                                <Link 
                                    key={item.to}
                                    to={item.to} 
                                    className={`relative flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 group z-10 ${
                                        active 
                                        ? 'text-white font-bold scale-[1.02]' 
                                        : 'text-text-muted hover:bg-primary-main/5 hover:text-primary-main font-semibold'
                                    }`}
                                >
                                    {/* Active Background Pill */}
                                    {active && (
                                        <motion.div 
                                            layoutId="activeTabPill"
                                            className="absolute inset-0 bg-primary-main shadow-lg shadow-primary-main/20 rounded-2xl -z-10"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    
                                    <item.icon size={20} className={`shrink-0 transition-transform relative z-20 ${active ? '' : 'group-hover:scale-110'}`} /> 
                                    <span className="tracking-tight relative z-20">{item.label}</span>
                                </Link>
                            );
                        })}

                    </nav>

                    {/* User Info & Actions */}
                    <div className="pt-6 border-t border-border-main/50 space-y-4 px-1">
                        {user && (
                            <div className="flex items-center gap-3 mb-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-800 flex items-center justify-center text-white font-bold text-sm shadow-xl shadow-emerald-900/10 uppercase shrink-0 transition-transform group-hover:scale-105 active:scale-95">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-text-main text-sm truncate leading-tight uppercase tracking-tight">{user?.name}</p>
                                    <p className="text-[9px] font-black text-primary-main uppercase tracking-widest mt-1 font-accent flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-primary-main animate-pulse" />
                                        {user?.plan === 'PRO' ? 'PRO' : (user?.plan === 'INITIAL' ? 'BÁSICO' : 'FREE')}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                                <button 
                                    onClick={() => {
                                        if (!isPro) {
                                            showToast.error('Actualizá a Pro para habilitar tu Enlace Público');
                                            return;
                                        }
                                        const profileId = (user as any)?.bizAlias || user?.id;
                                        if (profileId) {
                                          const profileUrl = `${window.location.origin}/profile/${profileId}`;
                                          navigator.clipboard.writeText(profileUrl);
                                          showToast.success('¡Link de perfil público copiado!');
                                        } else {
                                          showToast.error('Cargando perfil... reintenta en un momento.');
                                        }
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isPro ? 'text-text-muted hover:bg-primary-main/10 hover:text-primary-main' : 'text-zinc-500/50 bg-zinc-100/50 dark:bg-zinc-800/30 cursor-not-allowed'} group`}
                                >
                                    <ExternalLink size={18} className={`${isPro ? 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5' : ''} transition-transform shrink-0`} /> 
                                    <span className="flex-1 text-left">Enlace Público</span>
                                    {!isPro && <Lock size={14} className="text-primary-main" />}
                                </button>
                        </div>

                        <div className="pt-4 border-t border-border-main/50 flex items-center justify-between">
                            <button
                                onClick={toggleTheme}
                                className="p-2.5 rounded-xl text-text-muted hover:bg-bg-app hover:text-primary-main transition-all active:scale-95"
                                title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button
                                onClick={logout}
                                className="p-2.5 rounded-xl text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-95"
                                title="Cerrar Sesión"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main 
                className="flex-1 flex flex-col min-h-0 bg-bg-app overflow-y-auto custom-scrollbar transition-colors pb-24 md:pb-0 relative"
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
                        className="rounded-full hover:opacity-80 transition active:scale-95 touch-target"
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
                    <div className="flex items-center gap-1">
                        <Link
                            to="/app/notifications"
                            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-bg-dark transition text-zinc-500 relative touch-target"
                        >
                            <Bell size={22} />
                            {unreadNotifCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-bg-dark transition text-zinc-500 touch-target"
                        >
                            <Search size={22} />
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-6 md:p-8 lg:p-8 2xl:p-12 flex-1 overflow-x-hidden transition-all duration-300">
                    <div className="w-full">
                        {children}
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
                        <BottomNav pendingCount={pendingCount} unreadNotifCount={unreadNotifCount} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Layout;
