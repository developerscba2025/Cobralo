import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Attendance, Student } from '../services/api';
import { X, Check, XCircle, Calendar as CalendarIcon, Loader2, Sparkles, PlusCircle, Plus, Clock } from 'lucide-react';
import { showToast } from './Toast';
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
    const [isAdjusting, setIsAdjusting] = useState(false);

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

    const handleMark = async (status: 'PRESENT' | 'ABSENT' | 'CANCELLED') => {
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
            showToast.error('Error al registrar asistencia');
        } finally {
            setMarking(false);
        }
    };

    const handleQuickAdjustment = async (type: 'EXTRA_CLASS' | 'ADD_CREDITS' | 'MAKEUP_CLASSES', count: number = 1) => {
        setIsAdjusting(true);
        try {
            const updates: Partial<Student> = {};
            if (type === 'EXTRA_CLASS') {
                updates.amount = (Number(student.amount) || 0) + ((Number(student.price_per_hour) || 0) * count);
            } else if (type === 'ADD_CREDITS') {
                updates.credits = (Number(student.credits) || 0) + count;
            } else if (type === 'MAKEUP_CLASSES') {
                updates.makeup_classes = (Number(student.makeup_classes) || 0) + count;
            }

            await api.updateStudent(student.id, updates);
            showToast.success(type === 'EXTRA_CLASS' ? 'Clase extra registrada' : 'Créditos añadidos');
            onUpdate(); // Refresh parent view
        } catch (error) {
            console.error('Error in quick adjustment:', error);
            showToast.error('Error al actualizar');
        } finally {
            setIsAdjusting(false);
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
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
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
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl font-black text-primary-main">
                                            {student.credits || 0}
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleQuickAdjustment('ADD_CREDITS', 1)}
                                                disabled={isAdjusting}
                                                className="p-1.5 bg-primary-main/10 text-primary-main rounded-lg hover:bg-primary-main hover:text-white transition-all shadow-sm active:scale-90"
                                                title="+1 Clase"
                                            >
                                                <Plus size={16} strokeWidth={3} />
                                            </button>
                                            <button 
                                                onClick={() => handleQuickAdjustment('ADD_CREDITS', 4)}
                                                disabled={isAdjusting}
                                                className="px-2 py-1 bg-primary-main text-white text-[10px] font-black rounded-lg hover:bg-green-600 transition-all shadow-md active:scale-90"
                                            >
                                                +4 PACK
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-3 py-1 rounded-full bg-primary-main/10 text-primary-main text-[10px] font-black uppercase tracking-wider">
                                        Plan Pack
                                    </span>
                                </div>
                            </div>
                        )}

                        {student.planType === 'MONTHLY' && (
                            <div className="mb-8 flex justify-between items-center bg-zinc-50 dark:bg-bg-dark/50 p-4 rounded-2xl border border-zinc-100 dark:border-border-emerald/30">
                                <div>
                                    <span className="text-[9px] label-premium opacity-50 block mb-0.5">Cuota {new Date().toLocaleDateString('es-AR', { month: 'long' })}</span>
                                    <p className="font-black text-lg text-text-main leading-none">
                                        $ {Number(student.amount).toLocaleString('es-AR')}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => handleQuickAdjustment('EXTRA_CLASS', 1)}
                                    disabled={isAdjusting}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-main/10 hover:bg-primary-main text-primary-main hover:text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-sm border border-primary-main/10"
                                >
                                    <PlusCircle size={14} />
                                    Clase Extra
                                </button>
                            </div>
                        )}

                        <div className="mb-8 p-6 bg-amber-500/[0.03] dark:bg-amber-500/[0.05] border border-amber-500/10 rounded-[24px] flex justify-between items-center group overflow-hidden relative">
                            <div>
                                <span className="text-[10px] label-premium text-amber-600 block mb-1">Clases por Recuperar</span>
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl font-black text-amber-500">
                                        {student.makeup_classes || 0}
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleQuickAdjustment('MAKEUP_CLASSES', -1)}
                                            disabled={isAdjusting || (student.makeup_classes || 0) <= 0}
                                            className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-30"
                                            title="-1 Recuperada"
                                        >
                                            <X size={16} strokeWidth={3} />
                                        </button>
                                        <button 
                                            onClick={() => handleQuickAdjustment('MAKEUP_CLASSES', 1)}
                                            disabled={isAdjusting}
                                            className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition-all shadow-sm active:scale-90"
                                            title="+1 A recuperar"
                                        >
                                            <Plus size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-wider">
                                    Faltas con Aviso
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-10">
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
                                onClick={() => handleMark('CANCELLED')}
                                disabled={marking}
                                className="flex flex-col items-center justify-center p-3 sm:p-6 rounded-[24px] border-2 border-amber-100 dark:border-amber-900/10 bg-amber-50/50 dark:bg-amber-900/5 hover:bg-amber-100 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-300 transition-all disabled:opacity-30 active:scale-95 group"
                            >
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-200 dark:bg-amber-900 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/10">
                                    <Clock size={24} strokeWidth={3} />
                                </div>
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-center">Con Aviso</span>
                            </button>

                            <button
                                onClick={() => handleMark('ABSENT')}
                                disabled={marking}
                                className="flex flex-col items-center justify-center p-3 sm:p-6 rounded-[24px] border-2 border-red-100 dark:border-red-900/10 bg-red-50/50 dark:bg-red-900/5 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300 transition-all disabled:opacity-30 active:scale-95 group"
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
                                                    : record.status === 'CANCELLED' 
                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-900/40 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/40'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-900/40 group-hover:bg-red-200 dark:group-hover:bg-red-900/40'
                                                }
                                            `}>
                                                {record.status === 'PRESENT' ? 'Presente' : record.status === 'CANCELLED' ? 'Con Aviso' : 'Ausente'}
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
