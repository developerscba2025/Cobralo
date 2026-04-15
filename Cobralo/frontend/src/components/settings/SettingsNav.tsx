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
            <div className="mb-10 px-1">
                <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 dark:text-emerald-50 tracking-tighter uppercase italic leading-none">
                    Ajustes
                </h1>
                <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 opacity-60">
                    Gestioná tu cuenta y tu negocio.
                </p>
            </div>

            {/* Unified Navigation Container */}
            <div className="rounded-[32px] bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60 overflow-hidden shadow-sm shadow-black/5">
                {categories.map((cat, catIdx) => {
                    const isPlanSection = cat.id === 'plan';

                    return (
                        <div key={cat.id}>
                            {/* Section Divider/Header (Internal) */}
                            {cat.id !== 'plan' && (
                                <div className={`flex items-center gap-2 px-5 pt-6 pb-2 ${catIdx === 0 ? '' : 'border-t border-zinc-100/50 dark:border-zinc-800/50 mt-1'}`}>
                                    <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                                        {cat.label}
                                    </span>
                                </div>
                            )}

                            <div className="space-y-0.5 px-2 pb-4">
                                {cat.tabs.map((tab) => {
                                    const isActive = activeTab === tab.id && !tab.isAction;
                                    const needsPro = !isPro && (tab.id === 'academy' || tab.id === 'ratings');
                                    
                                    // Special styling for Plan Section if it's the only tab
                                    const isSpecialPlan = isPlanSection;

                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleTabClick(tab)}
                                            className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all text-left group relative ${
                                                isActive
                                                    ? isSpecialPlan 
                                                        ? 'bg-primary-main text-white shadow-lg shadow-primary-main/20 my-1'
                                                        : 'bg-primary-main/[0.08] dark:bg-emerald-500/10'
                                                    : isSpecialPlan && !isPro
                                                      ? 'bg-gradient-to-br from-primary-main/10 to-transparent border border-primary-main/20 hover:border-primary-main/40 my-1'
                                                      : 'hover:bg-zinc-100/80 dark:hover:bg-zinc-800/40'
                                            }`}
                                        >
                                            {/* Icon */}
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                                isActive
                                                    ? isSpecialPlan
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-primary-main text-white shadow-md shadow-primary-main/20'
                                                    : isSpecialPlan && !isPro
                                                      ? 'bg-primary-main/10 text-primary-main'
                                                      : 'bg-white dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 group-hover:text-primary-main border border-zinc-100 dark:border-zinc-700/60'
                                            }`}>
                                                <tab.icon size={16} />
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[13px] md:text-[12px] font-bold md:font-black tracking-tight truncate ${
                                                        isActive 
                                                          ? isSpecialPlan 
                                                              ? 'text-white' 
                                                              : 'text-primary-main dark:text-emerald-400' 
                                                          : 'text-zinc-700 dark:text-zinc-300'
                                                    } ${!isSpecialPlan ? 'normal-case' : 'uppercase italic'}`}>
                                                        {tab.label}
                                                    </span>
                                                    {isSpecialPlan && (
                                                        <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter ${
                                                            isActive ? 'bg-white/20 text-white' : 'bg-primary-main/10 text-primary-main'
                                                        }`}>
                                                            {isPro ? 'ACTIVO' : 'MEJORÁ'}
                                                        </span>
                                                    )}
                                                    {needsPro && !isSpecialPlan && (
                                                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-primary-main/10 dark:bg-emerald-500/15 text-[7px] font-black text-primary-main dark:text-emerald-400 uppercase tracking-tighter shrink-0">
                                                            <Lock size={7} />
                                                            <span>PRO</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {tab.description && (
                                                    <span className={`block text-[10px] md:text-[11px] font-medium md:font-bold mt-0.5 truncate tracking-wide opacity-60 ${
                                                        isActive 
                                                          ? isSpecialPlan ? 'text-white/70' : 'text-primary-main/60 dark:text-emerald-400/50' 
                                                          : 'text-zinc-400 dark:text-zinc-500'
                                                    } ${!isSpecialPlan ? 'normal-case' : 'uppercase'}`}>
                                                        {tab.description}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Right Lock for and Arrows */}
                                            {needsPro && !tab.isAction && (
                                                <Lock size={12} className="text-primary-main/50 dark:text-emerald-400/60 shrink-0" />
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
