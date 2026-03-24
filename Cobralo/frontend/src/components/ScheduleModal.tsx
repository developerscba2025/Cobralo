import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Clock } from 'lucide-react';
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
    const [newStart, setNewStart] = useState('14:00');
    const [duration] = useState(60);

    const loadSchedules = async () => {
        if (!studentId) return;
        setLoading(true);
        try {
            const data = await api.getStudentSchedules(studentId);
            setSchedules(data);
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
                dayOfWeek: Number(newDay),
                startTime: newStart,
                endTime: newEnd
            });
            showToast.success('Horario agregado');
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                        <div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <Clock className="text-green-600" size={24} />
                                Horarios
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {studentName}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition text-slate-500 dark:text-slate-400">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto flex-1">
                        {/* Add form */}
                        <form onSubmit={handleAdd} className="bg-green-50 dark:bg-green-600/10 p-4 rounded-2xl mb-6">
                            <h3 className="text-sm font-bold text-green-900 dark:text-green-200 mb-3 uppercase tracking-wider">Nuevo Horario</h3>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 ml-1 block mb-1">Día</label>
                                    <select
                                        value={newDay}
                                        onChange={e => setNewDay(Number(e.target.value))}
                                        className="w-full p-2 rounded-xl border-none text-sm font-medium bg-white dark:bg-slate-900 dark:text-white"
                                    >
                                        {DAYS.map((day, i) => (
                                            <option key={i} value={i}>{day}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 ml-1 block mb-1">Hora inicio</label>
                                    <input
                                        type="time"
                                        value={newStart}
                                        onChange={e => setNewStart(e.target.value)}
                                        className="w-full p-2 rounded-xl border-none text-sm font-bold bg-white dark:bg-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1 transition">
                                    <Plus size={16} /> Agregar
                                </button>
                            </div>
                        </form>

                        {/* List */}
                        <div className="space-y-3">
                            {loading ? (
                                <div className="text-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-700 mx-auto"></div></div>
                            ) : schedules.length === 0 ? (
                                <p className="text-center text-slate-400 py-4 text-sm">No hay horarios asignados</p>
                            ) : (
                                schedules.map(schedule => (
                                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                                {DAYS[schedule.dayOfWeek].substring(0, 3)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white text-sm">
                                                    {schedule.startTime} - {schedule.endTime}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {DAYS[schedule.dayOfWeek]}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(schedule.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                                        >
                                            <Trash2 size={16} />
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
