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
                <h1 className="text-3xl lg:text-4xl font-black text-text-main tracking-tight uppercase leading-none">
                    Ajustes
                </h1>
                <p className="text-text-muted font-bold text-[10px] uppercase tracking-widest mt-2 opacity-60">
                    Gestioná tu cuenta y tu negocio.
                </p>
            </div>

            {/* Unified Navigation Container */}
            <div className="rounded-[28px] bg-surface dark:bg-bg-soft border border-border-main overflow-hidden shadow-sm">
                {categories.map((cat, catIdx) => {
                    const isPlanSection = cat.id === 'plan';

                    return (
                        <div key={cat.id}>
                            {/* Section Divider/Header */}
                            {cat.id !== 'plan' && (
                                <div className={`flex items-center gap-2 px-5 pt-5 pb-2 ${catIdx === 0 ? '' : 'border-t border-border-main/50 mt-1'}`}>
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                                        {cat.label}
                                    </span>
                                </div>
                            )}

                            <div className="space-y-0.5 px-2 pb-3">
                                {cat.tabs.map((tab) => {
                                    const isActive = activeTab === tab.id && !tab.isAction;
                                    const needsPro = !isPro && (tab.id === 'academy' || tab.id === 'ratings');

                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleTabClick(tab)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] transition-all text-left group relative ${
                                                isActive
                                                    ? isPlanSection
                                                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 my-1'
                                                        : 'bg-emerald-500/10 dark:bg-emerald-500/10'
                                                    : isPlanSection && !isPro
                                                      ? 'bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 my-1'
                                                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            {/* Icon */}
                                            <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 transition-all ${
                                                isActive
                                                    ? isPlanSection
                                                        ? 'bg-black/10 text-black'
                                                        : 'bg-emerald-500 text-black shadow-sm shadow-emerald-500/20'
                                                    : isPlanSection && !isPro
                                                      ? 'bg-emerald-500/10 text-emerald-500'
                                                      : 'bg-black/5 dark:bg-white/5 text-text-muted group-hover:text-emerald-500'
                                            }`}>
                                                <tab.icon size={14} />
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[12px] font-black tracking-tight truncate uppercase ${
                                                        isActive
                                                          ? isPlanSection
                                                              ? 'text-black'
                                                              : 'text-emerald-500'
                                                          : 'text-text-main'
                                                    }`}>
                                                        {tab.label}
                                                    </span>
                                                    {isPlanSection && (
                                                        <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${
                                                            isActive ? 'bg-black/10 text-black' : 'bg-emerald-500/10 text-emerald-500'
                                                        }`}>
                                                            {isPro ? 'ACTIVO' : 'MEJORAR'}
                                                        </span>
                                                    )}
                                                    {needsPro && !isPlanSection && (
                                                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-[7px] font-black text-emerald-500 uppercase tracking-widest shrink-0">
                                                            <Lock size={7} />
                                                            <span>PRO</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {tab.description && (
                                                    <span className={`block text-[10px] font-bold mt-0.5 truncate tracking-wide opacity-60 ${
                                                        isActive
                                                          ? isPlanSection ? 'text-black/70' : 'text-emerald-500/60'
                                                          : 'text-text-muted'
                                                    }`}>
                                                        {tab.description}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Lock */}
                                            {needsPro && !tab.isAction && (
                                                <Lock size={12} className="text-emerald-500/50 shrink-0" />
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
