import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface PremiumSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
    icon?: React.ReactNode;
}

const PremiumSelect: React.FC<PremiumSelectProps> = ({
    value,
    onChange,
    options,
    placeholder = 'Seleccionar...',
    className = '',
    icon
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 bg-surface dark:bg-bg-soft border border-border-main rounded-xl transition-all active:scale-[0.98] select-none ${isOpen ? 'ring-2 ring-primary-main/20 border-primary-main/50' : ''}`}
            >
                {icon}
                <span className="text-[11px] font-black uppercase tracking-widest text-text-main whitespace-nowrap">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown 
                    size={14} 
                    className={`text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full left-0 mt-2 min-w-full bg-surface dark:bg-bg-soft border border-border-main rounded-2xl shadow-2xl z-50 overflow-hidden py-1.5"
                    >
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors text-left ${
                                        value === option.value 
                                        ? 'bg-primary-main/10 text-primary-main' 
                                        : 'text-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-main'
                                    }`}
                                >
                                    <span>{option.label}</span>
                                    {value === option.value && <Check size={12} className="shrink-0" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PremiumSelect;
