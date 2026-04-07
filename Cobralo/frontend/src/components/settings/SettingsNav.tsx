import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Lock } from 'lucide-react';

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
    // Start all categories open by default
    const [openCategories, setOpenCategories] = useState<Set<string>>(
        new Set(categories.map(c => c.id))
    );

    const toggleCategory = (id: string) => {
        setOpenCategories(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleTabClick = (tab: Tab) => {
        if (tab.isAction && tab.onClick) {
            tab.onClick();
        } else {
            setActiveTab(tab.id);
            if (window.innerWidth < 1024) setIsNavOpen(false);
        }
    };

    return (
        <div className="space-y-1 w-full">
            {/* Header */}
            <div className="mb-8 px-2">
                <h1 className="text-3xl font-black text-zinc-900 dark:text-emerald-50 tracking-tighter uppercase">
                    Ajustes
                </h1>
                <p className="text-zinc-500 font-bold text-[10px] tracking-widest uppercase opacity-60 mt-1">
                    Gestioná tu cuenta y academia.
                </p>
            </div>

            {/* Accordion categories */}
            {categories.map(cat => {
                const isOpen = openCategories.has(cat.id);
                return (
                    <div key={cat.id} className="mb-1">
                        {/* Category header — clickable to expand/collapse */}
                        <button
                            onClick={() => toggleCategory(cat.id)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl group transition-all"
                        >
                            <div className="flex items-center gap-2.5">
                                <cat.icon
                                    size={13}
                                    className="text-primary-main opacity-70"
                                />
                                <span className="text-[10px] font-extrabold text-zinc-400 dark:text-emerald-500/60 uppercase tracking-[0.2em]">
                                    {cat.label}
                                </span>
                            </div>
                            <motion.div
                                animate={{ rotate: isOpen ? 0 : -90 }}
                                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                            >
                                <ChevronDown size={13} className="text-zinc-400 dark:text-zinc-600" />
                            </motion.div>
                        </button>

                        {/* Tabs inside category */}
                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    key={cat.id + '-content'}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div className="flex flex-col gap-0.5 pl-2 pb-2 pt-0.5">
                                        {cat.tabs.map(tab => {
                                            const isActive = activeTab === tab.id && !tab.isAction;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => handleTabClick(tab)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left group border ${
                                                        isActive
                                                            ? 'bg-primary-main text-white border-transparent shadow-md'
                                                            : 'border-transparent text-zinc-500 dark:text-zinc-400'
                                                    }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                                        isActive
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-bg-app text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                                                    }`}>
                                                        <tab.icon size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-left">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`block text-[12px] font-bold uppercase tracking-tight truncate ${
                                                                isActive ? 'text-white' : ''
                                                            }`}>
                                                                {tab.label}
                                                            </span>
                                                            {!isPro && (tab.id === 'academy' || tab.id === 'ratings') && (
                                                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary-main/10 border border-primary-main/20 text-[8px] font-black text-primary-main uppercase tracking-tighter">
                                                                    <Lock size={8} />
                                                                    <span>PRO</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {tab.description && (
                                                            <span className={`block text-[10px] font-bold mt-0.5 truncate ${
                                                                isActive ? 'text-white/60' : 'text-zinc-400 opacity-70'
                                                            }`}>
                                                                {tab.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {tab.isAction ? (
                                                        <ChevronRight size={14} className="opacity-40 shrink-0" />
                                                    ) : (
                                                        !isPro && (tab.id === 'academy' || tab.id === 'ratings') && (
                                                            <Lock size={12} className="text-primary-main/40 shrink-0" />
                                                        )
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
};

export default SettingsNav;
