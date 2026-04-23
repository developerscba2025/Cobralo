import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Calendar, Settings, Home, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Student } from '../services/api';

interface SearchResult {
    type: 'student' | 'page';
    id?: number;
    title: string;
    subtitle?: string;
    path?: string;
    icon: React.ReactNode;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PAGES: SearchResult[] = [
    { type: 'page', title: 'Panel Principal', path: '/app', icon: <Home size={18} /> },
    { type: 'page', title: 'Mis Alumnos', path: '/app/students', icon: <Users size={18} /> },
    { type: 'page', title: 'Historial de Pagos', path: '/app/payments?tab=history', icon: <Calendar size={18} /> },
    { type: 'page', title: 'Calendario Semanal', path: '/app/calendar', icon: <Calendar size={18} /> },
    { type: 'page', title: 'Configuración', path: '/app/settings', icon: <Settings size={18} /> },
];

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            loadStudents();
        } else {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const data = await api.getStudents();
            setStudents(data);
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!query.trim()) {
            setResults(PAGES);
            return;
        }

        const q = query.toLowerCase();

        // Search pages
        const pageResults = PAGES.filter(p =>
            p.title.toLowerCase().includes(q)
        );

        // Search students
        const studentResults: SearchResult[] = students
            .filter(s => s.name.toLowerCase().includes(q))
            .slice(0, 5)
            .map(s => ({
                type: 'student' as const,
                id: s.id,
                title: s.name,
                subtitle: s.service_name || 'Sin servicio activo',
                path: `/app/students?id=${s.id}`,
                icon: <Users size={18} />
            }));

        setResults([...pageResults, ...studentResults]);
        setSelectedIndex(0);
    }, [query, students]);

    const handleSelect = (result: SearchResult) => {
        if (result.path) {
            navigate(result.path);
        }
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(i => Math.min(i + 1, results.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(i => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (results[selectedIndex]) {
                    handleSelect(results[selectedIndex]);
                }
                break;
            case 'Escape':
                onClose();
                break;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 modal-overlay z-[2000] flex items-start justify-center pt-24 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="glass-premium rounded-[32px] w-full max-w-xl overflow-hidden shadow-2xl"
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-4 p-5 border-b border-zinc-100 dark:border-border-emerald bg-zinc-50/30 dark:bg-bg-soft/30">
                            <div className="w-10 h-10 rounded-xl bg-primary-main/10 flex items-center justify-center text-primary-main border border-primary-main/20">
                                <Search size={20} strokeWidth={2.5} />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Buscar herramientas, alumnos, funciones..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1 bg-transparent outline-none text-zinc-900 dark:text-emerald-50 text-sm font-bold placeholder:text-zinc-400 dark:placeholder:text-emerald-500/30"
                            />
                            <div className="flex items-center gap-2">
                                {loading && <Loader2 className="animate-spin text-primary-main" size={16} />}
                                <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-black bg-zinc-100 dark:bg-bg-dark text-zinc-400 dark:text-emerald-500/40 rounded-lg border border-zinc-200 dark:border-border-emerald shadow-sm">
                                    ESC
                                </kbd>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="max-h-[380px] overflow-y-auto p-3 custom-scrollbar">
                            <div className="px-3 py-2">
                                <span className="text-[10px] label-premium opacity-50 uppercase tracking-[0.2em]">Resultados Sugeridos</span>
                            </div>
                            
                            {results.length === 0 ? (
                                <div className="p-12 text-center flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-bg-dark flex items-center justify-center text-zinc-200 dark:text-emerald-500/10 border border-zinc-100 dark:border-border-emerald">
                                        <Search size={32} />
                                    </div>
                                    <p className="text-xs text-zinc-400 dark:text-emerald-500/30 italic">
                                        No se encontraron resultados para "{query}"
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {results.map((result, index) => (
                                        <button
                                            key={`${result.type}-${result.id || result.title}`}
                                            onClick={() => handleSelect(result)}
                                            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 group relative
                                                ${index === selectedIndex
                                                    ? 'bg-primary-main/10 text-primary-main scale-[1.01] shadow-lg shadow-primary-main/5'
                                                    : 'text-zinc-600 dark:text-emerald-500/60 hover:bg-zinc-50 dark:hover:bg-bg-soft hover:text-zinc-900 dark:hover:text-emerald-50'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border
                                                ${index === selectedIndex
                                                    ? 'bg-primary-main text-white border-primary-main scale-110'
                                                    : 'bg-zinc-50 dark:bg-bg-dark text-zinc-400 dark:text-emerald-500/40 border-zinc-100 dark:border-border-emerald group-hover:bg-zinc-100 dark:group-hover:bg-bg-dark group-hover:text-primary-main'
                                                }`}>
                                                {result.icon}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-black dark:text-emerald-50">{result.title}</p>
                                                {result.subtitle && (
                                                    <p className="text-[10px] opacity-60 font-medium group-hover:opacity-100 transition-opacity">
                                                        {result.subtitle}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {index === selectedIndex && (
                                                    <span className="text-[10px] font-black uppercase tracking-wider animate-in fade-in slide-in-from-right-2">Seleccionar</span>
                                                )}
                                                <ArrowRight size={16} className={`transition-all duration-300 ${index === selectedIndex ? 'translate-x-1 opacity-100' : 'opacity-0 -translate-x-2'}`} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer hint */}
                        <div className="p-4 border-t border-zinc-100 dark:border-border-emerald bg-zinc-50/50 dark:bg-bg-soft/50 flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-emerald-500/30">
                            <span className="flex items-center gap-2">
                                <kbd className="px-2 py-1 bg-white dark:bg-bg-dark border border-zinc-200 dark:border-border-emerald rounded-lg shadow-sm text-zinc-600 dark:text-emerald-500/60">↑↓</kbd> 
                                Navegar
                            </span>
                            <span className="flex items-center gap-2">
                                <kbd className="px-2 py-1 bg-white dark:bg-bg-dark border border-zinc-200 dark:border-border-emerald rounded-lg shadow-sm text-zinc-600 dark:text-emerald-500/60">ENTER</kbd> 
                                Seleccionar
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchModal;
