import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { SPRING_PHYSICS } from '../../utils/motion';

interface Tab {
    id: string;
    label: string;
    icon: any;
    description?: string;
    isAction?: boolean;
    onClick?: () => void;
}

interface Category {
    id: string;
    label: string;
    icon: any;
    tabs: Tab[];
}

interface SettingsNavProps {
    categories: Category[];
    activeTab: string;
    isCollapsed: boolean;
    setIsCollapsed: (v: boolean) => void;
    setActiveTab: (id: any) => void;
    setIsNavOpen: (v: boolean) => void;
}

const SettingsNav: React.FC<SettingsNavProps> = ({
    categories,
    activeTab,
    isCollapsed,
    setIsCollapsed,
    setActiveTab,
    setIsNavOpen,
}) => {
    return (
        <motion.div
            key="settings-nav"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={SPRING_PHYSICS}
            className={`space-y-6 lg:space-y-8 w-full block transition-all duration-500 relative`}
        >
            {/* Desktop Collapse Trigger */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex absolute -right-4 top-7 w-8 h-8 bg-white/90 dark:bg-bg-soft/90 backdrop-blur-xl border border-zinc-200 dark:border-emerald-500/30 rounded-full shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_30px_-6px_rgba(34,197,94,0.3)] items-center justify-center text-primary-main hover:scale-110 active:scale-95 hover:border-primary-main transition-all z-20 group hover:shadow-primary-glow/60"
            >
                {isCollapsed ? <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />}
            </button>

            {/* Mobile Header */}
            <div className="lg:hidden mb-12 px-4">
                <h1 className="text-4xl font-black text-zinc-900 dark:text-emerald-50 tracking-tighter uppercase mb-2">Configuración</h1>
                <p className="text-zinc-500 font-bold text-sm tracking-wide">Gestioná tu cuenta y academia.</p>
            </div>

            <div className="flex flex-col gap-1">
                <div className={`hidden lg:flex items-center mb-4 lg:mb-6 ${isCollapsed ? 'lg:justify-center lg:w-full' : 'px-4'}`}>
                    <h3 className={`text-[10px] font-extrabold text-zinc-400 dark:text-emerald-500/60 uppercase tracking-[0.2em] animate-in fade-in duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>
                        Navegación
                    </h3>
                </div>

                {categories.map(cat => (
                    <div key={cat.id} className="space-y-1 mb-6">
                        <h4 className={`text-[11px] font-extrabold text-zinc-400/50 dark:text-emerald-500/40 uppercase tracking-[0.2em] px-4 mb-3 ${isCollapsed ? 'lg:hidden' : ''}`}>
                            {cat.label}
                        </h4>

                        <div className="flex flex-col gap-1 bg-white lg:bg-transparent dark:bg-bg-soft lg:dark:bg-transparent rounded-3xl lg:rounded-none overflow-hidden lg:overflow-visible border lg:border-none border-zinc-100 dark:border-white/5">
                            {cat.tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        if (tab.isAction && tab.onClick) {
                                            tab.onClick();
                                        } else {
                                            setActiveTab(tab.id as any);
                                            if (window.innerWidth < 1024) {
                                                setIsNavOpen(false);
                                            }
                                        }
                                    }}
                                    className={`flex items-center justify-between lg:justify-start gap-4 transition-all font-bold uppercase tracking-normal text-[13px] group px-6 py-8 lg:pl-6 lg:pr-10 lg:py-4 lg:rounded-[24px] border-b last:border-b-0 lg:border-none border-zinc-50 dark:border-white/5 w-full ${
                                        isCollapsed ? 'lg:justify-center lg:p-0 lg:w-16 lg:h-16 lg:mx-auto' : ''
                                    } ${
                                        activeTab === tab.id && !isCollapsed
                                            ? 'bg-primary-main/10 text-primary-main lg:bg-primary-main lg:text-white lg:shadow-xl lg:shadow-primary-glow/40'
                                            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 lg:hover:bg-zinc-100 dark:hover:bg-bg-dark lg:dark:hover:bg-bg-soft hover:text-zinc-800 dark:hover:text-emerald-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center lg:bg-transparent lg:w-auto lg:h-auto ${activeTab === tab.id ? (isCollapsed ? 'bg-primary-main text-white' : 'bg-primary-main text-white lg:text-inherit') : 'bg-zinc-50 dark:bg-bg-dark text-zinc-400'}`}>
                                            <tab.icon size={isCollapsed ? 26 : 22} className={`${activeTab === tab.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100 transition-opacity'}`} />
                                        </div>
                                        <div className="flex flex-col items-start lg:block">
                                            <span className={`${isCollapsed ? 'lg:hidden' : 'whitespace-nowrap'} transition-all`}>{tab.label}</span>
                                            <span className="lg:hidden text-[10px] font-bold opacity-40 lowercase tracking-normal flex mt-0.5">{tab.description || 'Configuración'}</span>
                                        </div>
                                    </div>

                                    <div className="lg:hidden text-zinc-300">
                                        <ChevronRight size={14} className="opacity-40" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default SettingsNav;
