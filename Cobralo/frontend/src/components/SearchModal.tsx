import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Calendar, Settings, Home, ArrowRight } from 'lucide-react';
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
    { type: 'page', title: 'Dashboard', path: '/', icon: <Home size={18} /> },
    { type: 'page', title: 'Alumnos', path: '/students', icon: <Users size={18} /> },
    { type: 'page', title: 'Historial', path: '/history', icon: <Calendar size={18} /> },
    { type: 'page', title: 'Calendario', path: '/calendar', icon: <Calendar size={18} /> },
    { type: 'page', title: 'Configuración', path: '/settings', icon: <Settings size={18} /> },
];

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
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
        try {
            const data = await api.getStudents();
            setStudents(data);
        } catch (error) {
            console.error('Error loading students:', error);
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
                subtitle: s.service_name || 'Sin servicio',
                path: '/students',
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
                    className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-start justify-center z-50 pt-24 p-4 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-700">
                            <Search size={20} className="text-slate-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Buscar alumnos, páginas..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1 bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
                            />
                            <kbd className="hidden sm:inline-block px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 rounded">
                                ESC
                            </kbd>
                        </div>

                        {/* Results */}
                        <div className="max-h-80 overflow-y-auto p-2">
                            {results.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    No se encontraron resultados
                                </div>
                            ) : (
                                results.map((result, index) => (
                                    <button
                                        key={`${result.type}-${result.id || result.title}`}
                                        onClick={() => handleSelect(result)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${index === selectedIndex
                                            ? 'bg-green-50 dark:bg-green-600/10 text-green-700 dark:text-green-400'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${index === selectedIndex
                                            ? 'bg-green-100 dark:bg-green-600/20'
                                            : 'bg-slate-100 dark:bg-slate-700'
                                            }`}>
                                            {result.icon}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium">{result.title}</p>
                                            {result.subtitle && (
                                                <p className="text-xs text-slate-400">{result.subtitle}</p>
                                            )}
                                        </div>
                                        <ArrowRight size={16} className="text-slate-300" />
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Footer hint */}
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-center gap-4 text-xs text-slate-400">
                            <span><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">↑↓</kbd> navegar</span>
                            <span><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">Enter</kbd> seleccionar</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchModal;
