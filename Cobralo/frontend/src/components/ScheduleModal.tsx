import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Clock, Calendar, AlertCircle, Loader2, Check } from 'lucide-react';
import { api } from '../services/api';
import type { ClassSchedule } from '../services/api';
import { showToast } from './Toast';

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: number;
    studentName: string;
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const ScheduleModal = ({ isOpen, onClose, studentId, studentName }: ScheduleModalProps) => {
    const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
    const [loading, setLoading] = useState(false);

    // New schedule form
    const [newDay, setNewDay] = useState(1); // Lunes default
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [isRecurring, setIsRecurring] = useState(true);
    const [useMakeupClass, setUseMakeupClass] = useState(false);
    const [studentData, setStudentData] = useState<any>(null);
    const [newStart, setNewStart] = useState('14:00');
    const [duration] = useState(60);

    const loadSchedules = async () => {
        if (!studentId) return;
        setLoading(true);
        try {
            const data = await api.getStudentSchedules(studentId);
            setSchedules(data);
            
            // Also fetch student data to see makeup classes
            const students = await api.getStudents();
            const current = students.find(s => s.id === studentId);
            setStudentData(current);
            if (current && (current.makeup_classes || 0) > 0) {
                setUseMakeupClass(true);
            }
        } catch (error) {
            console.error('Error loading schedules:', error);
            showToast.error('Error al cargar horarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && studentId) {
            loadSchedules();
        }
    }, [isOpen, studentId]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Calculate end time
            const [hours, mins] = newStart.split(':').map(Number);
            const endDate = new Date();
            endDate.setHours(hours, mins + duration);
            const newEnd = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

            await api.createSchedule({
                studentId,
                dayOfWeek: isRecurring ? Number(newDay) : new Date(newDate).getDay(),
                startTime: newStart,
                endTime: newEnd,
                isRecurring,
                date: isRecurring ? undefined : newDate
            });

            // If it's a one-off and we used a makeup class, update student
            if (!isRecurring && useMakeupClass && studentData && (studentData.makeup_classes || 0) > 0) {
                await api.updateStudent(studentId, {
                    makeup_classes: (studentData.makeup_classes || 0) - 1
                });
                showToast.success('Se descontó 1 clase de recuperación');
            }

            showToast.success(isRecurring ? 'Horario agregado' : 'Clase puntual agendada');
            loadSchedules();
        } catch (error) {
            showToast.error('Error al crear horario (posible conflicto)');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.deleteSchedule(id);
            showToast.success('Horario eliminado');
            setSchedules(schedules.filter(s => s.id !== id));
        } catch {
            showToast.error('Error al eliminar');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="card-premium w-full max-w-lg relative overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border-white/10"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-8 border-b border-zinc-100 dark:border-border-emerald flex justify-between items-start bg-zinc-50/50 dark:bg-bg-soft/50">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="label-premium bg-primary-main/10 text-primary-main px-3 py-0.5 rounded-full">Cronograma Escolar</span>
                            </div>
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                                <Clock className="text-primary-main" size={24} />
                                Horarios
                            </h2>
                            <p className="text-zinc-500 dark:text-emerald-500/60 text-sm font-accent mt-1">
                                {studentName}
                            </p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 text-zinc-400 hover:text-primary-main hover:bg-zinc-100 dark:hover:bg-bg-dark rounded-xl transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                        {/* Add form */}
                        <form onSubmit={handleAdd} className="p-6 rounded-[24px] bg-primary-main/[0.03] dark:bg-primary-main/[0.05] border border-primary-main/10 mb-8 relative group overflow-hidden">
                            <div className="absolute -right-4 -top-4 text-primary-main/5 group-hover:scale-110 transition-transform duration-700">
                                <Calendar size={80} />
                            </div>
                            
                            <h3 className="text-[10px] font-black text-primary-main mb-4 uppercase tracking-[0.2em]">Nuevo Horario</h3>
                            
                            <div className="bg-zinc-100 dark:bg-white/5 rounded-xl p-1 flex gap-1 mb-4">
                                <button type="button" onClick={() => setIsRecurring(true)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isRecurring ? 'bg-white dark:bg-bg-soft text-primary-main shadow-sm' : 'text-text-muted'}`}>Semanales</button>
                                <button type="button" onClick={() => setIsRecurring(false)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!isRecurring ? 'bg-white dark:bg-bg-soft text-primary-main shadow-sm' : 'text-text-muted'}`}>Una sola vez</button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-[10px] label-premium opacity-50 ml-1 block mb-1.5">{isRecurring ? 'Día de la semana' : 'Fecha específica'}</label>
                                    {isRecurring ? (
                                        <select
                                            value={newDay}
                                            onChange={e => setNewDay(Number(e.target.value))}
                                            className="w-full p-3 rounded-xl border border-zinc-100 dark:border-border-emerald text-xs font-bold bg-white dark:bg-bg-dark text-zinc-700 dark:text-emerald-50 focus:ring-2 focus:ring-primary-main/20 outline-none transition-all dark:[color-scheme:dark]"
                                        >
                                            {DAYS.map((day, i) => (
                                                <option key={i} value={i}>{day}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="date"
                                            value={newDate}
                                            onChange={e => setNewDate(e.target.value)}
                                            className="w-full p-3 rounded-xl border border-zinc-100 dark:border-border-emerald text-xs font-bold bg-white dark:bg-bg-dark text-zinc-700 dark:text-emerald-50 focus:ring-2 focus:ring-primary-main/20 outline-none transition-all dark:[color-scheme:dark]"
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] label-premium opacity-50 ml-1 block mb-1.5">Hora de inicio</label>
                                    <input
                                        type="time"
                                        value={newStart}
                                        onChange={e => setNewStart(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-zinc-100 dark:border-border-emerald text-xs font-bold bg-white dark:bg-bg-dark text-zinc-700 dark:text-emerald-50 focus:ring-2 focus:ring-primary-main/20 outline-none transition-all dark:[color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            {!isRecurring && studentData && studentData.makeup_classes > 0 && (
                                <button 
                                    type="button"
                                    onClick={() => setUseMakeupClass(!useMakeupClass)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border mb-4 transition-all ${useMakeupClass ? 'bg-primary-main/10 border-primary-main text-primary-main' : 'border-zinc-100 dark:border-border-emerald text-text-muted'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Check size={14} className={useMakeupClass ? 'opacity-100' : 'opacity-20'} />
                                        <span className="text-[10px] font-bold">Usar 1 clase de recuperación (le quedan {studentData.makeup_classes})</span>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Canjear</span>
                                </button>
                            )}
                            
                            <div className="flex justify-end">
                                <button type="submit" className="btn btn-primary text-xs !py-2.5 shadow-lg shadow-primary-main/20 hover:scale-[1.02] active:scale-[0.98]">
                                    <Plus size={16} /> Agregar Horario
                                </button>
                            </div>
                        </form>

                        {/* List */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] label-premium opacity-50 tracking-[0.2em]">Horarios Asignados</h3>
                            <span className="text-[10px] font-bold text-zinc-400">{schedules.length} clases</span>
                        </div>

                        <div className="space-y-3">
                            {loading ? (
                                <div className="p-12 flex flex-col items-center gap-3">
                                    <Loader2 className="animate-spin text-primary-main" size={24} />
                                    <span className="text-[10px] label-premium opacity-40">Cargando horarios...</span>
                                </div>
                            ) : schedules.length === 0 ? (
                                <div className="card-sub p-12 text-center border-dashed border-zinc-200 dark:border-border-emerald/40">
                                    <AlertCircle className="mx-auto mb-2 text-zinc-300 dark:text-emerald-500/20" size={32} />
                                    <p className="text-[10px] label-premium opacity-30 italic">No hay horarios asignados</p>
                                </div>
                            ) : (
                                schedules.map(schedule => (
                                    <div key={schedule.id} className="flex items-center justify-between p-4 bg-white dark:bg-bg-soft border border-zinc-100 dark:border-border-emerald rounded-[20px] shadow-sm hover:border-primary-main/30 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-bg-dark flex items-center justify-center text-primary-main font-black text-[10px] uppercase border border-zinc-100 dark:border-border-emerald group-hover:bg-primary-main/10 transition-colors">
                                                {DAYS[schedule.dayOfWeek].substring(0, 3)}
                                            </div>
                                            <div>
                                                <p className="font-black text-zinc-800 dark:text-emerald-50 text-sm">
                                                    {schedule.startTime} - {schedule.endTime}
                                                </p>
                                                <p className="text-[10px] label-premium opacity-50 mt-0.5">
                                                    {schedule.isRecurring ? `Todos los ${DAYS[schedule.dayOfWeek]}s` : `Solo el ${new Date(schedule.date + 'T12:00:00Z').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}`}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(schedule.id)}
                                            className="p-2.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ScheduleModal;
