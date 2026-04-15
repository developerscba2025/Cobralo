import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Loader2, CheckCircle2, Clock, XCircle, Calendar, Users, Zap, Check } from 'lucide-react';
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
        { 
            id: 'PRESENT', 
            label: 'Presente', 
            icon: CheckCircle2, 
            color: 'text-emerald-500', 
            bg: 'bg-emerald-500/10', 
            activeBg: 'bg-emerald-500', 
            short: 'P',
            glow: 'shadow-emerald-500/20'
        },
        { 
            id: 'ABSENT', 
            label: 'Ausente', 
            icon: XCircle, 
            color: 'text-red-500', 
            bg: 'bg-red-500/10', 
            activeBg: 'bg-red-500', 
            short: 'A',
            glow: 'shadow-red-500/20'
        },
        { 
            id: 'HOLIDAY', 
            label: 'Sin Clase', 
            icon: Calendar, 
            color: 'text-sky-500', 
            bg: 'bg-sky-500/10', 
            activeBg: 'bg-sky-500', 
            short: 'S.C',
            glow: 'shadow-sky-500/20'
        },
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
                        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className="relative bg-surface/90 dark:bg-bg-soft/90 backdrop-blur-md w-full max-w-xl rounded-[40px] p-6 sm:p-8 shadow-[0_32px_80px_rgba(0,0,0,0.4)] border border-white/10 overflow-hidden"
                    >
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-main/10 blur-[120px] -z-10 group-hover:bg-primary-main/20 transition-colors" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 blur-[120px] -z-10" />

                        <button
                            onClick={onClose}
                            className="absolute right-6 top-6 sm:right-10 sm:top-10 p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl text-text-muted hover:text-text-main transition-all active:scale-90 border border-border-main/20"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-8 sm:mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-main/10 border border-primary-main/20 rounded-full mb-4">
                                <Zap className="text-primary-main" size={14} fill="currentColor" />
                                <span className="text-[10px] font-black text-primary-main uppercase tracking-[0.2em]">Registro Rápido</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-text-main tracking-tighter uppercase italic leading-none block">
                                Control de <span className="text-primary-main">Asistencia</span>
                            </h2>
                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-2 bg-black/5 dark:bg-white/5 border border-border-main/50 rounded-2xl text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    <Clock size={12} className="text-primary-main" />
                                    {schedule.startTime} — {schedule.endTime}
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-black/5 dark:bg-white/5 border border-border-main/50 rounded-2xl text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    <Users size={12} className="text-primary-main" />
                                    {participants.length} alumnos
                                </div>
                            </div>
                        </div>

                        {/* Bulk Actions Section */}
                        <div className="mb-8">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-4 ml-2">Asistencia Masiva</p>
                            <div className="grid grid-cols-3 gap-2.5">
                                {statuses.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => markAll(s.id as any)}
                                        className={`group relative flex items-center gap-3 p-4 rounded-[24px] border border-border-main/50 bg-black/5 dark:bg-white/5 hover:bg-white dark:hover:bg-zinc-800 transition-all active:scale-[0.97] hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-none`}
                                    >
                                        <div className={`p-2 rounded-xl ${s.bg} ${s.color} group-hover:scale-110 transition-transform`}>
                                            <s.icon size={18} />
                                        </div>
                                        <div className="flex flex-col items-start min-w-0">
                                            <span className="text-[10px] font-black text-text-main uppercase tracking-tight truncate">Todos</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${s.color} truncate`}>{s.short}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Students List Container */}
                        <div className="relative">
                            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-surface/90 dark:from-bg-soft/90 to-transparent z-10 pointer-events-none" />
                            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar p-1 pb-10">
                                {participants.map((student, idx) => {
                                    const currentStatus = attRecords[student.id] || 'PRESENT';
                                    
                                    return (
                                            className="relative group p-3 sm:p-4 rounded-[28px] bg-bg-app/30 dark:bg-black/20 border border-border-main/50 hover:border-primary-main/30 transition-all flex items-center gap-4 hover:shadow-lg hover:shadow-primary-main/5"
                                        >
                                            <div className="flex-1 min-w-0 pr-2 w-full sm:w-auto">
                                                <div className="flex items-center gap-3 mb-1 justify-center sm:justify-start">
                                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-600 dark:text-zinc-400 border border-border-main/50">
                                                        {student.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-black text-sm text-text-main truncate uppercase tracking-tight leading-none mb-1">
                                                            {student.name}
                                                        </div>
                                                        <div className="text-[9px] font-bold uppercase text-text-muted tracking-widest opacity-60 truncate">
                                                            {student.service_name || 'Servicio General'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-1.5 bg-black/5 dark:bg-black/40 p-1.5 rounded-[24px] shrink-0 border border-border-main/20">
                                                {statuses.map(s => {
                                                    const active = currentStatus === s.id;
                                                    return (
                                                        <button
                                                            key={s.id}
                                                            onClick={() => setStatus(student.id, s.id as any)}
                                                            className={`relative min-w-[48px] h-10 px-3 rounded-[18px] flex items-center justify-center transition-all duration-300 ${
                                                                active 
                                                                ? `${s.activeBg} text-white shadow-lg ${s.glow}` 
                                                                : 'text-text-muted hover:text-text-main hover:bg-white dark:hover:bg-white/5'
                                                            }`}
                                                            title={s.label}
                                                        >
                                                            {active ? (
                                                                <motion.div
                                                                    layoutId={`active-${student.id}`}
                                                                    initial={{ scale: 0.8 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <Check size={14} strokeWidth={4} />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">{s.short}</span>
                                                                </motion.div>
                                                            ) : (
                                                                <s.icon size={16} className="opacity-40" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface/90 dark:from-bg-soft/90 to-transparent z-10 pointer-events-none" />
                        </div>

                        {/* Footer Section with Legend & Action */}
                        <div className="mt-8 sm:mt-10 space-y-6">
                            {/* Legend / Info Section */}
                            <div className="p-5 sm:p-6 bg-black/5 dark:bg-white/5 rounded-[32px] border border-border-main/50 space-y-4">
                                <div className="flex items-center gap-3">
                                    <AlertCircle size={18} className="text-primary-main" />
                                    <span className="text-[10px] font-black text-text-main uppercase tracking-[0.2em]">Guía de Referencia</span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1.5 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                        <p className="text-[11px] font-black text-emerald-500 uppercase tracking-tight">P — Presente</p>
                                        <p className="text-[9px] font-bold text-text-muted leading-relaxed opacity-80 uppercase tracking-tighter">Asistió a clase. Descuenta 1 crédito.</p>
                                    </div>
                                    
                                    <div className="space-y-1.5 p-3 rounded-2xl bg-red-500/5 border border-red-500/10">
                                        <p className="text-[11px] font-black text-red-500 uppercase tracking-tight">A — Ausente</p>
                                        <p className="text-[9px] font-bold text-text-muted leading-relaxed opacity-80 uppercase tracking-tighter">Falta sin aviso. Descuenta 1 crédito.</p>
                                    </div>
                                    
                                    <div className="space-y-1.5 p-3 rounded-2xl bg-sky-500/5 border border-sky-500/10">
                                        <p className="text-[11px] font-black text-sky-500 uppercase tracking-tight">S.C — Sin Clase</p>
                                        <p className="text-[9px] font-bold text-text-muted leading-relaxed opacity-80 uppercase tracking-tighter">Feriado o cancelación del profe. No descuenta saldo.</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full relative group h-16 bg-primary-main hover:bg-primary-main/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-[24px] shadow-2xl shadow-primary-main/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                {isSaving ? (
                                    <><Loader2 className="animate-spin" size={20} /> Guardando asistencias...</>
                                ) : (
                                    <>
                                        <span>FINALIZAR CONTROL</span>
                                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                            <CheckCircle2 size={16} strokeWidth={3} />
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
