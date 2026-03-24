import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import type { UnifiedSchedule, Student } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, Plus, Trash2, X, AlertCircle, Download } from 'lucide-react';
import { showToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7am to 9pm

const Calendar = () => {
    const [schedules, setSchedules] = useState<UnifiedSchedule[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false,
        id: null
    });

    const [formData, setFormData] = useState({
        studentId: '',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [schedulesData, studentsData] = await Promise.all([
                api.getAllSchedules(),
                api.getStudents()
            ]);
            setSchedules(schedulesData);
            setStudents(studentsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast.error('Error al cargar el calendario');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.studentId) {
            showToast.error('Selecciona un alumno');
            return;
        }

        try {
            const result = await api.createSchedule({
                studentId: Number(formData.studentId),
                dayOfWeek: formData.dayOfWeek,
                startTime: formData.startTime,
                endTime: formData.endTime
            });

            if ((result as any).error) {
                showToast.error((result as any).error);
                return;
            }

            showToast.success('Clase agendada correctamente');
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            showToast.error('Error al agendar la clase');
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        try {
            await api.deleteSchedule(deleteModal.id);
            showToast.success('Clase eliminada');
            fetchData();
        } catch (error) {
            showToast.error('Error al eliminar la clase');
        } finally {
            setDeleteModal({ isOpen: false, id: null });
        }
    };

    const handleExportICS = () => {
        if (schedules.length === 0) {
            showToast.error('No hay clases para exportar');
            return;
        }

        // Basic .ics generator
        let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Cobralo//Calendar//ES\n";

        schedules.forEach(s => {
            const startStr = s.startTime.replace(":", "") + "00";
            const endStr = s.endTime.replace(":", "") + "00";
            const dayMap = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

            icsContent += "BEGIN:VEVENT\n";
            icsContent += `SUMMARY:Clase: ${s.student?.name}\n`;
            icsContent += `DESCRIPTION:Servicio: ${s.student?.service_name || 'General'}\n`;
            icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${dayMap[s.dayOfWeek]}\n`;
            // Note: Setting a dummy date for the recurrence start to a Monday in 2024 to represent the weekly pattern
            icsContent += `DTSTART:20240101T${startStr}\n`;
            icsContent += `DTEND:20240101T${endStr}\n`;
            icsContent += "END:VEVENT\n";
        });

        icsContent += "END:VCALENDAR";

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'horarios_cobralo.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast.success('Archivo .ics generado. Importalo en Google Calendar.');
    };

    const getSchedulesForCell = (dayIndex: number, hour: number) => {
        return schedules.filter(s => {
            const startHour = parseInt(s.startTime.split(':')[0]);
            return s.dayOfWeek === dayIndex && startHour === hour;
        });
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                            Calendario Semanal
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Visualiza y organiza tus clases</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportICS}
                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
                    >
                        <Download size={20} />
                        Sincronizar (Google Calendar)
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-green-600/20 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Plus size={20} />
                        Nueva Clase
                    </button>
                </div>
            </header>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-[32px] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl h-[calc(100vh-200px)] flex flex-col">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full border-collapse table-fixed min-w-[1000px]">
                        <thead className="sticky top-0 z-30 bg-white dark:bg-slate-900 shadow-sm">
                            <tr className="border-b border-slate-200 dark:border-white/5">
                                <th className="p-4 text-left text-slate-400 font-medium border-r border-slate-200 dark:border-white/5 w-24 sticky left-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-40">
                                    Hora
                                </th>
                                {DAYS.map((day, index) => (
                                    <th
                                        key={day}
                                        className={`p-4 text-center font-bold text-slate-700 dark:text-white capitalize
                                            ${index === new Date().getDay() ? 'bg-green-50/50 dark:bg-green-600/10 text-green-700 dark:text-green-400' : 'bg-slate-50/50 dark:bg-slate-900/50'}`}
                                    >
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {HOURS.map((hour) => (
                                <tr key={hour} className="border-b border-slate-200 dark:border-white/5 last:border-0 hover:bg-slate-50/30 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 text-slate-400 text-sm border-r border-slate-200 dark:border-white/5 font-mono sticky left-0 bg-white dark:bg-slate-900/95 backdrop-blur-sm z-20">
                                        {hour}:00
                                    </td>
                                    {DAYS.map((_, dayIndex) => {
                                        const cellSchedules = getSchedulesForCell(dayIndex, hour);
                                        const isToday = dayIndex === new Date().getDay();
                                        return (
                                            <td
                                                key={dayIndex}
                                                className={`p-1 h-[100px] align-top border-r border-slate-100 dark:border-white/5 last:border-r-0 transition-colors
                                                    ${isToday ? 'bg-green-50/20 dark:bg-green-600/5' : ''}`}
                                            >
                                                <div className="flex flex-col gap-1 h-full w-full">
                                                    {cellSchedules.map((s) => (
                                                        <motion.div
                                                            key={s.id}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="bg-white dark:bg-slate-800 border-l-4 border-green-600 shadow-sm p-2 rounded-r-lg group cursor-default hover:shadow-md hover:translate-x-1 transition-all"
                                                        >
                                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                                <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                                                    {s.student?.name}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setDeleteModal({ isOpen: true, id: s.id });
                                                                    }}
                                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-red-400 hover:text-red-500 rounded transition-all"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                                                <Clock size={10} />
                                                                {s.startTime} - {s.endTime}
                                                            </div>
                                                            <div className="text-[10px] text-green-700 dark:text-green-400 mt-1 font-bold truncate">
                                                                {s.student?.service_name || 'General'}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend / Info */}
            <div className="mt-6 flex flex-wrap gap-6 text-slate-500 dark:text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    <span>Clases Horario Fijo</span>
                </div>
                <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-green-600" />
                    <span>Los choques de horario son prevenidos automáticamente.</span>
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] p-8 shadow-2xl border border-slate-100 dark:border-white/10"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                            >
                                <X size={24} />
                            </button>

                            <div className="mb-8">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Nueva Clase</h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-2">Asigna un nuevo horario a un alumno</p>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 ml-1">Alumno</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <select
                                            required
                                            value={formData.studentId}
                                            onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-green-600 transition-all appearance-none"
                                        >
                                            <option value="" className="dark:bg-slate-900">Seleccionar alumno...</option>
                                            {students.map(s => (
                                                <option key={s.id} value={s.id} className="dark:bg-slate-900">{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 ml-1">Día</label>
                                        <select
                                            value={formData.dayOfWeek}
                                            onChange={e => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                                            className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-green-600 transition-all"
                                        >
                                            {DAYS.map((day, i) => (
                                                <option key={i} value={i} className="dark:bg-slate-900">{day}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 ml-1">Horario</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="time"
                                                value={formData.startTime}
                                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                                className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-green-600 transition-all"
                                            />
                                            <span className="text-slate-400 font-bold">a</span>
                                            <input
                                                type="time"
                                                value={formData.endTime}
                                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                                className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-green-600 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-green-700 hover:bg-green-800 text-white font-black py-5 rounded-2xl shadow-xl shadow-green-600/30 transition-all active:scale-[0.98] mt-4"
                                >
                                    AGENDAR CLASE
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Eliminar Clase"
                message="¿Estás seguro de eliminar este horario? No se puede deshacer."
                confirmText="Eliminar Horario"
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ isOpen: false, id: null })}
                variant="danger"
            />
        </Layout>
    );
};

export default Calendar;
