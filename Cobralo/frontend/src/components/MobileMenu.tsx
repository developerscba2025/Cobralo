import React from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, Mail, ShieldCheck, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenLegal?: (type: 'terms' | 'privacy') => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onOpenLegal }) => {

    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
                    />

                    {/* Menu Panel */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-y-0 left-0 w-[280px] bg-bg-soft dark:bg-bg-dark z-[101] md:hidden shadow-2xl flex flex-col border-r border-border-main"
                    >
                        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-border-main/50 sticky top-0 bg-bg-soft/90 dark:bg-bg-dark/90 backdrop-blur-md z-10">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-black italic text-primary-main tracking-tighter uppercase">COBRALO</span>
                                    <span className="text-[7px] font-black px-1 py-0.5 bg-primary-main/10 text-primary-main rounded border border-primary-main/20 uppercase tracking-widest">BETA</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2.5 rounded-xl bg-bg-app border border-border-main text-text-muted hover:text-primary-main transition-all active:scale-95"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* User Info */}
                             {user && (
                                <div className="p-4 bg-bg-app/30 border-b border-border-main/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-800 flex items-center justify-center text-white font-bold text-base uppercase shadow-lg shadow-emerald-900/10">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-text-main truncate uppercase tracking-tight text-sm">{user.name}</p>
                                            <p className="text-[9px] font-black text-primary-main uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-primary-main animate-pulse" />
                                                {user?.plan === 'PRO' ? 'PRO' : (user?.plan === 'INITIAL' ? 'BÁSICO' : 'FREE')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Info Box */}
                            <div className="p-4 space-y-3 flex-1">
                                <div className="p-3.5 bg-primary-main/5 border border-primary-main/10 rounded-2xl">
                                    <p className="text-[10px] font-black text-primary-main uppercase tracking-widest mb-1">Centro de Ayuda</p>
                                    <p className="text-[10px] text-text-muted font-bold leading-normal opacity-70">
                                        ¿Tenés dudas o reportes? Nuestro equipo está listo para ayudarte.
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <a 
                                        href="mailto:Support@cobralo.info"
                                        className="w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-primary-main/10 hover:text-primary-main transition-all"
                                        onClick={onClose}
                                    >
                                        <div className="p-1.5 rounded-lg bg-primary-main/10">
                                            <Mail size={16} className="text-primary-main" />
                                        </div>
                                        <span>Soporte Directo</span>
                                    </a>
                                    <button 
                                        onClick={() => { onOpenLegal?.('terms' as any); onClose(); }}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-primary-main/10 hover:text-primary-main transition-all"
                                    >
                                        <div className="p-1.5 rounded-lg bg-bg-app border border-border-main/50">
                                            <ShieldCheck size={16} />
                                        </div>
                                        <span>Legal & Privacidad</span>
                                    </button>
                                </div>
                            </div>

                            {/* System Actions Area */}
                             <div className="p-4 border-t border-border-main/50 space-y-2 bg-bg-app/50 sticky bottom-0 backdrop-blur-md">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={toggleTheme}
                                        className="flex-1 flex items-center justify-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted bg-bg-soft dark:bg-bg-app border border-border-main/50 hover:text-primary-main transition-all active:scale-95"
                                    >
                                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                        <span>{theme === 'dark' ? 'Luz' : 'Noche'}</span>
                                    </button>
                                    <button
                                        onClick={() => { logout(); onClose(); }}
                                        className="p-3 rounded-xl text-red-500 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all active:scale-95 shadow-sm shadow-red-500/5 group"
                                    >
                                        <LogOut size={18} className="group-active:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                                <p className="text-center text-[7px] font-black text-text-muted/30 uppercase tracking-[0.3em] pt-2">
                                    Cobralo v1.0 BETA
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileMenu;
