import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import type { UnifiedSchedule } from '../services/api';
import { showToast } from './Toast';

interface AttendanceBulkModalProps {
    isOpen: boolean;
    onClose: () => void;
    schedule: UnifiedSchedule | null;
    onSuccess: () => void;
}

const AttendanceBulkModal = ({ isOpen, onClose, schedule, onSuccess }: AttendanceBulkModalProps) => {
    const [attRecords, setAttRecords] = useState<Record<number, 'PRESENT' | 'ABSENT' | 'CANCELLED'>>({});
    const [isSaving, setIsSaving] = useState(false);

    if (!schedule) return null;

    // The schedule now has 'students' which is an array
    const participants = schedule.students || (schedule.student ? [schedule.student] : []);

    const setStatus = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'CANCELLED') => {
        setAttRecords(prev => ({ ...prev, [studentId]: status }));
    };

    const markAll = (status: 'PRESENT' | 'ABSENT' | 'CANCELLED') => {
        const newRecords: Record<number, 'PRESENT' | 'ABSENT' | 'CANCELLED'> = {};
        participants.forEach(p => {
            newRecords[p.id] = status;
        });
        setAttRecords(newRecords);
    };

    const handleSave = async () => {
        const records = participants.map(p => ({
            studentId: p.id,
            status: attRecords[p.id] || 'PRESENT' // Default to present if not touched
        }));

        setIsSaving(true);
        try {
            await api.recordBulkAttendance({
                scheduleId: schedule.id,
                records
            });
            showToast.success('Asistencias registradas correctamente');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving bulk attendance:', error);
            showToast.error('Error al registrar las asistencias');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white dark:bg-bg-soft w-full max-w-lg rounded-[40px] p-8 shadow-2xl border border-zinc-100 dark:border-border-main overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-6 top-6 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase italic">Control de Asistencia</h2>
                            <p className="text-text-muted mt-2 font-medium tracking-tight">
                                {schedule.startTime} - {schedule.endTime} | {participants.length} alumnos
                            </p>
                        </div>

                        <div className="flex gap-2 mb-6 text-[9px]">
                            <button
                                onClick={() => markAll('PRESENT')}
                                className="flex-1 py-3 bg-primary-main/10 text-primary-main hover:bg-primary-main/20 rounded-2xl font-black uppercase tracking-widest transition-all"
                            >
                                Todas P.
                            </button>
                            <button
                                onClick={() => markAll('CANCELLED')}
                                className="flex-1 py-3 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-2xl font-black uppercase tracking-widest transition-all"
                            >
                                Todas C.A.
                            </button>
                            <button
                                onClick={() => markAll('ABSENT')}
                                className="flex-1 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-2xl font-black uppercase tracking-widest transition-all"
                            >
                                Todas F.
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {participants.map(student => {
                                const status = attRecords[student.id] || 'PRESENT';
                                return (
                                    <div 
                                        key={student.id}
                                        className={`flex items-center justify-between p-4 rounded-3xl border transition-all ${
                                            status === 'PRESENT' 
                                                ? 'bg-primary-main/5 border-primary-main/20' 
                                                : status === 'CANCELLED'
                                                ? 'bg-amber-500/5 border-amber-500/20'
                                                : 'bg-red-500/5 border-red-500/20'
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="font-bold text-text-main truncate">{student.name}</div>
                                            <div className="text-[10px] font-black uppercase text-text-muted tracking-widest opacity-80 truncate">
                                                {student.service_name || 'Servicio General'}
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-1 bg-zinc-100 dark:bg-bg-dark rounded-2xl p-1 shrink-0">
                                            <button
                                                onClick={() => setStatus(student.id, 'PRESENT')}
                                                className={`px-3 py-2 rounded-xl font-black text-[10px] sm:text-xs uppercase transition-all ${
                                                    status === 'PRESENT' ? 'bg-primary-main text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                                                }`}
                                                title="Presente"
                                            >P</button>
                                            <button
                                                onClick={() => setStatus(student.id, 'CANCELLED')}
                                                className={`px-3 py-2 rounded-xl font-black text-[10px] sm:text-xs uppercase transition-all ${
                                                    status === 'CANCELLED' ? 'bg-amber-500 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                                                }`}
                                                title="Con Aviso"
                                            >C.A.</button>
                                            <button
                                                onClick={() => setStatus(student.id, 'ABSENT')}
                                                className={`px-3 py-2 rounded-xl font-black text-[10px] sm:text-xs uppercase transition-all ${
                                                    status === 'ABSENT' ? 'bg-red-500 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                                                }`}
                                                title="Falta Ausente"
                                            >F</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-bg-app rounded-2xl border border-border-main/50">
                                <AlertCircle size={20} className="text-primary-main shrink-0" />
                                <p className="text-[10px] font-bold text-text-muted leading-tight uppercase tracking-tight">
                                    Al marcar Presente, se descuentan créditos de Packs. Al marcar C.A. (Con Aviso), se sumará 1 Clase por Recuperar.
                                </p>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full bg-primary-main hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs py-5 rounded-3xl shadow-xl shadow-primary-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <><Loader2 className="animate-spin" size={20} /> Guardando...</>
                                ) : (
                                    'GUARDAR ASISTENCIAS'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AttendanceBulkModal;
