import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Attendance, Student } from '../services/api';
import { X, Check, XCircle, Calendar as CalendarIcon } from 'lucide-react';
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
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <CalendarIcon className="text-violet-500" />
                                Asistencia
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {student.name}
                            </p>
                            <div className="mt-2">
                                {student.status === 'paid' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 text-green-800 dark:bg-green-600/20 dark:text-green-300 text-xs font-bold border border-green-200 dark:border-green-600/30">
                                        <Check size={12} strokeWidth={3} />
                                        Cuota al día
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-500/30 animate-pulse">
                                        <XCircle size={12} strokeWidth={3} />
                                        Debe Cuota: ${Number(student.amount).toLocaleString('es-AR')}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Stats / Actions */}
                    <div className="p-6">
                        {student.planType === 'PACK' && (
                            <div className="mb-6 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-500/20 rounded-xl flex justify-between items-center">
                                <div>
                                    <span className="text-sm text-violet-600 dark:text-violet-300 font-medium">Créditos Restantes</span>
                                    <div className="text-3xl font-bold text-violet-700 dark:text-violet-200">
                                        {student.credits || 0}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Plan: Pack</span>
                                    {/* Maybe show total purchased? */}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button
                                onClick={() => handleMark('PRESENT')}
                                disabled={marking || (student.planType === 'PACK' && (student.credits || 0) <= 0)}
                                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-green-100 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-800 dark:text-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <div className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-900 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Check size={24} />
                                </div>
                                <span className="font-bold">Presente</span>
                                {student.planType === 'PACK' && <span className="text-xs text-green-700/70 mt-1">-1 Crédito</span>}
                            </button>

                            <button
                                onClick={() => handleMark('ABSENT')}
                                disabled={marking}
                                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <div className="w-10 h-10 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <XCircle size={24} />
                                </div>
                                <span className="font-bold">Ausente</span>
                            </button>
                        </div>

                        {/* History List */}
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Historial Reciente</h3>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl overflow-hidden max-h-48 overflow-y-auto border border-slate-100 dark:border-slate-700">
                            {loading ? (
                                <div className="p-4 text-center text-slate-500 text-sm">Cargando...</div>
                            ) : history.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">No hay registros aún</div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {history.map((record) => (
                                        <div key={record.id} className="p-3 flex items-center justify-between text-sm">
                                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                                                {new Date(record.date).toLocaleDateString('es-AR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold
                                                ${record.status === 'PRESENT'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
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
