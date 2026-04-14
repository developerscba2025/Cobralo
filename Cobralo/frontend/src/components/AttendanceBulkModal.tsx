import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Loader2, CheckCircle2, Clock, XCircle, Calendar, Users, Zap } from 'lucide-react';
import { api } from '../services/api';
import type { UnifiedSchedule } from '../services/api';
import { showToast } from './Toast';

interface AttendanceBulkModalProps {
    isOpen: boolean;
    onClose: () => void;
    schedule: UnifiedSchedule | null;
    onSuccess: () => void;
    attendanceDate?: string;
}

const AttendanceBulkModal = ({ isOpen, onClose, schedule, onSuccess, attendanceDate }: AttendanceBulkModalProps) => {
    const [attRecords, setAttRecords] = useState<Record<number, 'PRESENT' | 'ABSENT' | 'CANCELLED' | 'HOLIDAY'>>({});
    const [isSaving, setIsSaving] = useState(false);

    if (!schedule) return null;

    const participants = schedule.students || (schedule.student ? [schedule.student] : []);

    const setStatus = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'CANCELLED' | 'HOLIDAY') => {
        setAttRecords(prev => ({ ...prev, [studentId]: status }));
    };

    const markAll = (status: 'PRESENT' | 'ABSENT' | 'CANCELLED' | 'HOLIDAY') => {
        const newRecords: Record<number, 'PRESENT' | 'ABSENT' | 'CANCELLED' | 'HOLIDAY'> = {};
        participants.forEach(p => {
            newRecords[p.id] = status;
        });
        setAttRecords(newRecords);
    };

    const handleSave = async () => {
        const records = participants.map(p => ({
            studentId: p.id,
            status: attRecords[p.id] || 'PRESENT'
        }));

        setIsSaving(true);
        try {
            await api.recordBulkAttendance({
                scheduleId: schedule.id,
                records,
                date: attendanceDate
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

    const statuses = [
        { id: 'PRESENT', label: 'Presente', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', activeBg: 'bg-emerald-500', short: 'P' },
        { id: 'CANCELLED', label: 'Con Aviso', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', activeBg: 'bg-amber-500', short: 'C.A' },
        { id: 'ABSENT', label: 'Falta', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', activeBg: 'bg-red-500', short: 'F' },
        { id: 'HOLIDAY', label: 'Feriado', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10', activeBg: 'bg-blue-500', short: 'FER' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className="relative bg-surface dark:bg-bg-soft w-full max-w-2xl rounded-[48px] p-6 sm:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.4)] border border-white/10 overflow-hidden"
                    >
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-main/5 blur-[100px] -z-10" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 blur-[100px] -z-10" />

                        <button
                            onClick={onClose}
                            className="absolute right-8 top-8 p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl text-text-muted hover:text-text-main transition-all active:scale-90"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-10 text-center sm:text-left">
                            <h2 className="text-3xl sm:text-4xl font-black text-text-main tracking-tighter uppercase italic flex flex-wrap items-center gap-3">
                                <Zap className="text-primary-main fill-primary-main/20" size={32} />
                                Control de Asistencia
                            </h2>
                            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-border-main/50 rounded-xl text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    <Clock size={12} className="text-primary-main" />
                                    {schedule.startTime} — {schedule.endTime}
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-border-main/50 rounded-xl text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    <Users size={12} className="text-primary-main" />
                                    {participants.length} alumnos
                                </div>
                            </div>
                        </div>

                        {/* Bulk Actions Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
                            {statuses.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => markAll(s.id as any)}
                                    className={`group relative flex flex-col items-center gap-2 p-4 rounded-3xl border border-border-main/50 bg-black/5 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all active:scale-[0.97]`}
                                >
                                    <s.icon size={20} className={`${s.color} transition-transform group-hover:scale-110`} />
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest group-hover:text-text-main transition-colors">
                                        Todos {s.short}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Students List */}
                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar pr-1">
                            {participants.map(student => {
                                const currentStatus = attRecords[student.id] || 'PRESENT';
                                
                                return (
                                    <div 
                                        key={student.id}
                                        className="relative group p-4 sm:p-5 rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row items-center gap-4 hover:bg-white shadow-sm dark:shadow-none"
                                    >
                                        <div className="flex-1 min-w-0 pr-2 text-center sm:text-left">
                                            <div className="font-black text-sm text-text-main truncate group-hover:text-zinc-900 transition-colors uppercase tracking-tight">
                                                {student.name}
                                            </div>
                                            <div className="text-[10px] font-bold uppercase text-text-muted tracking-widest opacity-60 truncate group-hover:text-zinc-600">
                                                {student.service_name || 'Servicio General'}
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-1.5 bg-black/5 dark:bg-black/20 p-1.5 rounded-[2rem] shrink-0 border border-white/5">
                                            {statuses.map(s => {
                                                const active = currentStatus === s.id;
                                                return (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => setStatus(student.id, s.id as any)}
                                                        className={`relative h-10 px-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                                            active 
                                                            ? `${s.activeBg} text-white shadow-lg` 
                                                            : 'text-text-muted hover:text-text-main hover:bg-white dark:hover:bg-white/5'
                                                        }`}
                                                        title={s.label}
                                                    >
                                                        {active ? (
                                                            <motion.div
                                                                layoutId={`active-${student.id}`}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <s.icon size={16} strokeWidth={3} />
                                                                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">{s.short}</span>
                                                            </motion.div>
                                                        ) : (
                                                            <s.icon size={16} className="opacity-40 group-hover:opacity-100" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer Section */}
                        <div className="mt-10 space-y-6">
                            <div className="flex items-center gap-4 p-5 bg-primary-main/5 rounded-[2rem] border border-primary-main/10 border-dashed animate-in fade-in duration-1000">
                                <AlertCircle size={22} className="text-primary-main shrink-0" />
                                <p className="text-[10px] font-bold text-text-muted leading-relaxed uppercase tracking-tight">
                                    <span className="text-primary-main font-black">PRO TIP:</span> Presente descuenta créditos. Con Aviso suma recupero. Feriado no descuenta nada.
                                </p>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full relative group h-16 bg-primary-main hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.3em] text-xs rounded-full shadow-2xl shadow-primary-main/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {isSaving ? (
                                    <><Loader2 className="animate-spin" size={20} /> Guardando asistencias...</>
                                ) : (
                                    <>
                                        <span>GUARDAR ASISTENCIAS</span>
                                        <div className="absolute right-6 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    </>
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
