import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, AlertCircle, Loader2, MessageCircle, CheckCircle2, Calendar } from 'lucide-react';
import { api, type UnifiedSchedule, type Student } from '../services/api';
import { showToast } from './Toast';

interface EmergencyNoticeModalProps {
    isOpen: boolean;
    onClose: () => void;
    todaysSchedules: UnifiedSchedule[];
    allStudents: Student[];
    isPro: boolean;
    onSuccess?: () => void;
}

const EmergencyNoticeModal: React.FC<EmergencyNoticeModalProps> = ({ 
    isOpen, 
    onClose, 
    todaysSchedules, 
    allStudents,
    isPro,
    onSuccess 
}) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState(todayStr);
    const [reason, setReason] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [markingComplete, setMarkingComplete] = useState(false);

    // Calculate students affected in the range
    const affectedStudents = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const studentsMap = new Map<number, { id: number, name: string, phone: string, service: string, days: Set<string> }>();

        // Days of week affected in range (0 = Sunday, 6 = Saturday)
        const daysInRange = new Set<number>();
        const temp = new Date(start);
        while (temp <= end) {
            daysInRange.add(temp.getDay());
            temp.setDate(temp.getDate() + 1);
            if (daysInRange.size >= 7) break; // Optimization if range > 1 week
        }

        allStudents.forEach(student => {
            const studentSchedules = student.schedules || [];
            studentSchedules.forEach(sched => {
                if (daysInRange.has(sched.dayOfWeek)) {
                    const existing = studentsMap.get(student.id);
                    if (existing) {
                        existing.days.add(sched.dayName || '');
                    } else {
                        studentsMap.set(student.id, {
                            id: student.id,
                            name: student.name,
                            phone: student.phone,
                            service: student.service_name || 'Servicio General',
                            days: new Set([sched.dayName || ''])
                        });
                    }
                }
            });
        });

        return Array.from(studentsMap.values());
    }, [startDate, endDate, allStudents]);

    const displayStudents = isPro ? affectedStudents : affectedStudents.slice(0, 3);
    const hasMore = affectedStudents.length > 3 && !isPro;

    // Generate Return Date string
    const returnDateStr = useMemo(() => {
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        return nextDay.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    }, [endDate]);

    // Build personalized message
    const buildMessage = (name: string) => {
        const isRange = startDate !== endDate;
        let baseMsg = `¡Hola ${name.split(' ')[0]}! Te escribo para avisarte que `;
        
        if (isRange) {
            baseMsg += `no estaré dando clases desde el ${new Date(startDate).toLocaleDateString('es-AR')} hasta el ${new Date(endDate).toLocaleDateString('es-AR')}. `;
        } else {
            baseMsg += `hoy no podré dar la clase. `;
        }

        if (reason.trim()) {
            baseMsg += `Motivo: ${reason}. `;
        }

        baseMsg += `Estaré retomando el día ${returnDateStr}. Mil disculpas, coordinamos luego la recuperación. ¡Saludos!`;
        return baseMsg;
    };

    const handleMarkAllCancelled = async () => {
        if (!isPro) return;
        setIsSaving(true);
        try {
            // This is complex for a range. We'll mark today's if in range, 
            // but marking future attendance depends on your backend supporting future records.
            // For now, we prioritize marking TODAY's attendance correctly.
            const todayISO = new Date().toISOString().split('T')[0];
            if (startDate <= todayISO && endDate >= todayISO) {
                for (const schedule of todaysSchedules) {
                    const participants = schedule.students || (schedule.student ? [schedule.student] : []);
                    await api.recordBulkAttendance({
                        scheduleId: schedule.id,
                        records: participants.map(p => ({ studentId: p.id, status: 'CANCELLED' }))
                    });
                }
                showToast.success('Asistencias de hoy marcadas como canceladas');
            } else {
                showToast.success('Avisos generados para el rango seleccionado');
            }
            setMarkingComplete(true);
            onSuccess?.();
        } catch (error) {
            console.error('Error marking all as cancelled:', error);
            showToast.error('Error al actualizar las asistencias');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white dark:bg-bg-soft w-full max-w-lg rounded-[40px] p-8 shadow-2xl border border-zinc-100 dark:border-border-main overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <button onClick={onClose} className="absolute right-6 top-6 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition">
                        <X size={24} />
                    </button>

                    <div className="mb-6">
                        <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase italic flex items-center gap-3">
                            <AlertTriangle className="text-amber-500" size={32} />
                            Desconexión
                        </h2>
                        <p className="text-text-muted mt-1 font-medium tracking-tight">
                            {affectedStudents.length} alumnos afectados en el período.
                        </p>
                    </div>

                    {/* Date Selection */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-1">Desde</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-border-main rounded-2xl px-4 py-3 text-xs font-bold text-text-main focus:outline-none focus:ring-2 focus:ring-primary-main/30 [color-scheme:dark]"
                                />
                                <Calendar size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-1">Hasta</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-border-main rounded-2xl px-4 py-3 text-xs font-bold text-text-main focus:outline-none focus:ring-2 focus:ring-primary-main/30 [color-scheme:dark]"
                                />
                                <Calendar size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Reason Editor */}
                    <div className="mb-6 space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Motivo / Personalización</label>
                        <textarea 
                            value={reason}
                            placeholder="Ej: Estoy con gripe, viaje familiar, trámite personal..."
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 border border-border-main rounded-2xl p-4 text-xs font-bold text-text-main focus:outline-none focus:ring-2 focus:ring-primary-main/30 min-h-[60px] resize-none"
                        />
                    </div>

                    {/* Pro Action: Mark as Cancelled */}
                    {isPro && (
                        <button
                            onClick={handleMarkAllCancelled}
                            disabled={isSaving || markingComplete}
                            className={`w-full mb-6 py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all ${
                                markingComplete 
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                    : 'bg-primary-main text-white shadow-xl shadow-primary-glow hover:scale-[1.02] active:scale-95'
                            }`}
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : markingComplete ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {isSaving ? 'PROCESANDO...' : markingComplete ? 'ASISTENCIA DE HOY CARGADA' : 'MARCAR HOY COMO CANCELADO (PRO)'}
                        </button>
                    )}

                    {/* Student List */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 mb-4 min-h-[150px]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 mb-2">Enviar avisos vía WhatsApp</p>
                        {displayStudents.length === 0 ? (
                            <div className="py-10 text-center opacity-40">
                                <p className="text-xs font-bold text-text-muted uppercase italic">Nadie tiene clases en este período.</p>
                            </div>
                        ) : (
                            displayStudents.map(student => (
                                <div key={student.id} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/[0.03] border border-border-main rounded-3xl">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-black text-text-main truncate">{student.name}</p>
                                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest truncate">
                                            {student.service} • {Array.from(student.days).join(', ')}
                                        </p>
                                    </div>
                                    <a 
                                        href={`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(buildMessage(student.name))}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <MessageCircle size={18} />
                                    </a>
                                </div>
                            ))
                        )}

                        {hasMore && (
                            <div className="p-6 text-center border-2 border-dashed border-border-main rounded-[32px] bg-bg-app/50">
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider leading-relaxed">
                                    Tenés {affectedStudents.length - 3} alumnos más afectados.<br/>
                                    <span className="text-primary-main">Pasá a PRO</span> para avisarles a todos en un clic.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="text-[9px] font-bold text-text-muted text-center uppercase tracking-widest opacity-60">
                        Cada link abrirá WhatsApp con el mensaje personalizado y la fecha de retorno: <span className="text-text-main font-black underline">{returnDateStr}</span>.
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EmergencyNoticeModal;
