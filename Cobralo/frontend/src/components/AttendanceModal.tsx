import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Attendance, Student } from '../services/api';
import { X, Check, XCircle, Calendar as CalendarIcon, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AttendanceModalProps {
    student: Student;
    onClose: () => void;
    onUpdate: () => void;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ student, onClose, onUpdate }) => {
    const [history, setHistory] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);

    useEffect(() => {
        loadHistory();
    }, [student.id]);

    const loadHistory = async () => {
        try {
            const data = await api.getAttendanceHistory(student.id);
            setHistory(data);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMark = async (status: 'PRESENT' | 'ABSENT') => {
        setMarking(true);
        try {
            await api.markAttendance({
                studentId: student.id,
                status
            });
            await loadHistory();
            onUpdate(); // Refresh student data (credits)
        } catch (error) {
            console.error('Error marking attendance:', error);
        } finally {
            setMarking(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="card-premium w-full max-w-lg overflow-hidden relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-8 border-b border-zinc-100 dark:border-border-emerald flex justify-between items-start bg-zinc-50/50 dark:bg-bg-soft/50">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="label-premium bg-primary-main/10 text-primary-main px-3 py-0.5 rounded-full">Gestión de Asistencia</span>
                            </div>
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                                <CalendarIcon className="text-primary-main" size={24} />
                                {student.name}
                            </h2>
                            <div className="mt-4">
                                {student.status === 'paid' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-600/20 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-600/30">
                                        <Check size={12} strokeWidth={3} />
                                        Cuota al día
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 text-[10px] font-black uppercase tracking-wider border border-red-200 dark:border-red-500/30 animate-pulse">
                                        <XCircle size={12} strokeWidth={3} />
                                        Deuda Pendiente
                                    </span>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 text-zinc-400 hover:text-primary-main hover:bg-zinc-100 dark:hover:bg-bg-dark rounded-xl transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Stats / Actions */}
                    <div className="p-8">
                        {student.planType === 'PACK' && (
                            <div className="mb-8 p-6 bg-primary-main/[0.03] dark:bg-primary-main/[0.05] border border-primary-main/10 rounded-[24px] flex justify-between items-center group overflow-hidden relative">
                                <Sparkles className="absolute -right-4 -top-4 text-primary-main/10 group-hover:scale-150 transition-transform duration-700" size={80} />
                                <div>
                                    <span className="text-[10px] label-premium opacity-50 block mb-1">Créditos Restantes</span>
                                    <div className="text-4xl font-black text-primary-main">
                                        {student.credits || 0}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-3 py-1 rounded-full bg-primary-main/10 text-primary-main text-[10px] font-black uppercase tracking-wider">
                                        Plan Pack
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <button
                                onClick={() => handleMark('PRESENT')}
                                disabled={marking || (student.planType === 'PACK' && (student.credits || 0) <= 0)}
                                className="flex flex-col items-center justify-center p-6 rounded-[24px] border-2 border-emerald-100 dark:border-emerald-900/10 bg-emerald-50/50 dark:bg-emerald-900/5 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 transition-all disabled:opacity-30 disabled:grayscale group active:scale-95"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-emerald-200 dark:bg-emerald-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:rotate-6 shadow-lg shadow-emerald-500/10">
                                    <Check size={28} strokeWidth={3} />
                                </div>
                                <span className="text-sm font-black uppercase tracking-wider">Presente</span>
                                {student.planType === 'PACK' && <span className="text-[10px] opacity-60 mt-1">-1 Crédito</span>}
                            </button>

                            <button
                                onClick={() => handleMark('ABSENT')}
                                disabled={marking}
                                className="flex flex-col items-center justify-center p-6 rounded-[24px] border-2 border-red-100 dark:border-red-900/10 bg-red-50/50 dark:bg-red-900/5 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300 transition-all disabled:opacity-30 active:scale-95 group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-red-200 dark:bg-red-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:-rotate-6 shadow-lg shadow-red-500/10">
                                    <XCircle size={28} strokeWidth={3} />
                                </div>
                                <span className="text-sm font-black uppercase tracking-wider">Ausente</span>
                            </button>
                        </div>

                        {/* History List */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] label-premium opacity-50">Historial Reciente</h3>
                            {marking && <Loader2 className="animate-spin text-primary-main" size={14} />}
                        </div>

                        <div className="card-sub rounded-[24px] overflow-hidden border-zinc-100 dark:border-border-emerald">
                            {loading ? (
                                <div className="p-12 flex flex-col items-center gap-3">
                                    <Loader2 className="animate-spin text-primary-main" size={24} />
                                    <span className="text-[10px] label-premium opacity-40">Cargando historial...</span>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-[10px] label-premium opacity-30 italic">No hay registros aún</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-100 dark:divide-border-emerald/30 max-h-[220px] overflow-y-auto custom-scrollbar">
                                    {history.map((record) => (
                                        <div key={record.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-bg-dark transition-colors group">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-zinc-700 dark:text-emerald-50">
                                                    {new Date(record.date).toLocaleDateString('es-AR', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 font-mono">
                                                    {new Date(record.date).toLocaleTimeString('es-AR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })} hs
                                                </span>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all
                                                ${record.status === 'PRESENT'
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/40'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-900/40 group-hover:bg-red-200 dark:group-hover:bg-red-900/40'
                                                }
                                            `}>
                                                {record.status === 'PRESENT' ? 'Presente' : 'Ausente'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence >
    );
};

export default AttendanceModal;
