import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { StudentNote } from '../services/api';
import { showToast } from './Toast';
import { Plus, Trash2, StickyNote, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentNotesProps {
    studentId: number;
    studentName: string;
    isOpen: boolean;
    onClose: () => void;
}

const StudentNotes: React.FC<StudentNotesProps> = ({
    studentId,
    studentName,
    isOpen,
    onClose
}) => {
    const [notes, setNotes] = useState<StudentNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (isOpen && studentId) {
            loadNotes();
        }
    }, [isOpen, studentId]);

    const loadNotes = async () => {
        try {
            setLoading(true);
            const data = await api.getNotes(studentId);
            setNotes(data);
        } catch (error) {
            console.error('Error loading notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        try {
            setIsAdding(true);
            await api.createNote({ studentId, content: newNote });
            setNewNote('');
            showToast.success('Nota agregada');
            loadNotes();
        } catch {
            showToast.error('Error al agregar nota');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (noteId: number) => {
        try {
            await api.deleteNote(noteId);
            showToast.success('Nota eliminada');
            loadNotes();
        } catch {
            showToast.error('Error al eliminar');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-end z-50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                    Notas
                                </h2>
                                <p className="text-sm text-slate-500">{studentName}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Add note */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Agregar una nota..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                    className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-green-600"
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={isAdding || !newNote.trim()}
                                    className="p-3 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white rounded-xl transition"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Notes list */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {loading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                                </div>
                            ) : notes.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <StickyNote size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No hay notas para este alumno.</p>
                                </div>
                            ) : (
                                notes.map(note => (
                                    <motion.div
                                        key={note.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group bg-slate-50 dark:bg-slate-900 p-4 rounded-xl relative"
                                    >
                                        <p className="text-slate-700 dark:text-slate-200 pr-8">
                                            {note.content}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-2">
                                            {formatDate(note.createdAt)}
                                        </p>
                                        <button
                                            onClick={() => handleDelete(note.id)}
                                            className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition"
                                        >
                                            <Trash2 size={14} className="text-red-500" />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default StudentNotes;
