import React from 'react';
import { Lock } from 'lucide-react';

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
    setActiveTab: (id: any) => void;
    setIsNavOpen: (v: boolean) => void;
    isPro: boolean;
}

const SettingsNav: React.FC<SettingsNavProps> = ({
    categories,
    activeTab,
    setActiveTab,
    setIsNavOpen,
    isPro,
}) => {
    const handleTabClick = (tab: Tab) => {
        if (tab.isAction && tab.onClick) {
            tab.onClick();
        } else {
            setActiveTab(tab.id);
            if (window.innerWidth < 1024) setIsNavOpen(false);
        }
    };

    return (
        <div className="w-full pb-10">
            {/* Header */}
            <div className="mb-8 px-1">
                <h1 className="text-2xl lg:text-3xl font-black text-zinc-900 dark:text-emerald-50 tracking-tighter uppercase">
                    Ajustes
                </h1>
                <p className="text-zinc-400 font-bold text-[11px] tracking-wide mt-1">
                    Gestioná tu cuenta y tu negocio.
                </p>
            </div>

            <div className="space-y-5">
                {categories.map((cat, catIdx) => {
                    const isPlanSection = cat.id === 'plan';

                    // ── MI PLAN: tratamiento especial destacado ──
                    if (isPlanSection) {
                        const tab = cat.tabs[0];
                        const isActive = activeTab === tab.id;
                        return (
                            <div key={cat.id}>
                                <button
                                    onClick={() => handleTabClick(tab)}
                                    className={`w-full flex items-center gap-3.5 p-4 rounded-2xl transition-all text-left group relative border ${
                                        isActive
                                            ? 'bg-primary-main border-primary-main shadow-lg shadow-primary-main/20'
                                            : isPro
                                                ? 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-700/60 hover:border-primary-main/40'
                                                : 'bg-gradient-to-br from-primary-main/5 to-emerald-400/10 dark:from-emerald-500/10 dark:to-emerald-400/5 border-primary-main/20 hover:border-primary-main/50 hover:shadow-md hover:shadow-primary-main/10'
                                    }`}
                                >
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                        isActive
                                            ? 'bg-white/20 text-white'
                                            : 'bg-primary-main/10 dark:bg-emerald-500/15 text-primary-main'
                                    }`}>
                                        <tab.icon size={18} />
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[13px] font-extrabold tracking-tight ${
                                                isActive ? 'text-white' : 'text-zinc-700 dark:text-zinc-200'
                                            }`}>
                                                {tab.label}
                                            </span>
                                            {isPro ? (
                                                <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                                                    isActive ? 'bg-white/20 text-white' : 'bg-primary-main/10 text-primary-main'
                                                }`}>
                                                    ACTIVO
                                                </span>
                                            ) : (
                                                <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                                                    isActive ? 'bg-white/20 text-white' : 'bg-primary-main/10 text-primary-main'
                                                }`}>
                                                    MEJORÁ
                                                </span>
                                            )}
                                        </div>
                                        {tab.description && (
                                            <span className={`block text-[11px] font-medium mt-0.5 ${
                                                isActive ? 'text-white/70' : 'text-zinc-400 dark:text-zinc-500'
                                            }`}>
                                                {tab.description}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            </div>
                        );
                    }

                    // ── CATEGORÍAS NORMALES ──
                    return (
                        <div key={cat.id}>
                            {/* Category Header */}
                            <div className="flex items-center gap-2.5 mb-3 px-1">
                                <div className="w-7 h-7 rounded-lg bg-primary-main/10 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <cat.icon size={14} className="text-primary-main" />
                                </div>
                                <span className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.15em]">
                                    {cat.label}
                                </span>
                            </div>

                            {/* Tab cards */}
                            <div className="rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60 overflow-hidden">
                                {cat.tabs.map((tab, tabIdx) => {
                                    const isActive = activeTab === tab.id && !tab.isAction;
                                    const isLast = tabIdx === cat.tabs.length - 1;
                                    const needsPro = !isPro && (tab.id === 'academy' || tab.id === 'ratings');
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleTabClick(tab)}
                                            className={`w-full flex items-center gap-3.5 px-4 py-3.5 transition-all text-left group relative ${
                                                isActive
                                                    ? 'bg-primary-main/[0.08] dark:bg-emerald-500/10'
                                                    : 'hover:bg-zinc-100/80 dark:hover:bg-zinc-800/40'
                                            } ${!isLast ? 'border-b border-zinc-100 dark:border-zinc-800/50' : ''}`}
                                        >
                                            {/* Active indicator bar */}
                                            {isActive && (
                                                <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary-main" />
                                            )}

                                            {/* Icon */}
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                                isActive
                                                    ? 'bg-primary-main text-white shadow-md shadow-primary-main/20'
                                                    : 'bg-white dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 group-hover:text-primary-main border border-zinc-100 dark:border-zinc-700/60'
                                            }`}>
                                                <tab.icon size={16} />
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[13px] font-extrabold tracking-tight truncate ${
                                                        isActive ? 'text-primary-main dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300'
                                                    }`}>
                                                        {tab.label}
                                                    </span>
                                                    {needsPro && (
                                                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-primary-main/10 dark:bg-emerald-500/15 text-[8px] font-black text-primary-main dark:text-emerald-400 uppercase tracking-tighter shrink-0">
                                                            <Lock size={7} />
                                                            <span>PRO</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {tab.description && (
                                                    <span className={`block text-[11px] font-medium mt-0.5 truncate ${
                                                        isActive ? 'text-primary-main/60 dark:text-emerald-400/50' : 'text-zinc-400 dark:text-zinc-500'
                                                    }`}>
                                                        {tab.description}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Lock for PRO */}
                                            {needsPro && !tab.isAction && (
                                                <Lock size={13} className="text-primary-main/50 dark:text-emerald-400/60 shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SettingsNav;
