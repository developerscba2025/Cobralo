import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import type { UnifiedSchedule, Student } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Plus, Trash2, X, AlertCircle, Download } from 'lucide-react';
import { showToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { ProFeature } from '../components/ProGuard';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7am to 9pm

const Calendar = () => {
    const { user } = useAuth();
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
        if (user?.plan !== 'PRO') {
            showToast.error('La sincronización con Google Calendar es una función exclusiva de Cobralo PRO');
            return;
        }
        if (schedules.length === 0) {
            showToast.error('No hay clases para exportar');
            return;
        }

        const calendarUrl = `http://localhost:3000/api/calendar-feed/feed/${user?.calendarToken}`;
        
        // Copy subscription URL to clipboard
        navigator.clipboard.writeText(calendarUrl);
        showToast.success('¡URL de suscripción copiada! Pegala en "Añadir por URL" en Google Calendar.');

        // Also trigger the manual download as fallback
        let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Cobralo//Calendar//ES\n";
        schedules.forEach(s => {
            const startStr = s.startTime.replace(":", "") + "00";
            const endStr = s.endTime.replace(":", "") + "00";
            const dayMap = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
            icsContent += "BEGIN:VEVENT\n";
            icsContent += `SUMMARY:Clase: ${s.student?.name}\n`;
            icsContent += `DESCRIPTION:Servicio: ${s.student?.service_name || 'General'}\n`;
            icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${dayMap[s.dayOfWeek]}\n`;
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
    };

    const getSchedulesForCell = (dayIndex: number, hour: number) => {
        return schedules.filter(s => {
            const startHour = parseInt(s.startTime.split(':')[0]);
            return s.dayOfWeek === dayIndex && startHour === hour;
        });
    };

    const getWeekDates = () => {
        const now = new Date();
        const currentDay = now.getDay(); // 0 is Sunday
        const diff = now.getDate() - currentDay;
        
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now);
            d.setDate(diff + i);
            return {
                name: DAYS[i],
                short: DAYS[i].substring(0, 3),
                date: d.getDate(),
                isToday: i === currentDay
            };
        });
    };

    const weekDates = getWeekDates();
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const showTimeLine = currentHour >= 7 && currentHour <= 21;
    const timeLinePosition = ((currentHour - 7) * 100) + (currentMinutes * 100 / 60);

    if (isLoading || !user) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-text-main flex items-center gap-3 tracking-tighter uppercase italic">
                            AGENDA SEMANAL
                        </h1>
                        <p className="text-text-muted mt-1 font-medium tracking-tight">Gestiona tus horarios con precisión pro</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {user?.plan === 'PRO' || user?.plan === 'INITIAL' ? (
                        <button
                            onClick={handleExportICS}
                            className="flex items-center gap-2 px-6 py-3 bg-surface border border-border-main text-text-main rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-bg-app transition-all active:scale-95 shadow-sm"
                        >
                            <Download size={20} />
                            Sincronizar
                        </button>
                    ) : (
                        <ProFeature featureName="Sincronización con Google Calendar" inline>
                            <button
                                className="flex items-center gap-2 px-6 py-3 bg-surface border border-border-main text-text-muted rounded-2xl font-black uppercase tracking-widest text-[10px] opacity-40 cursor-not-allowed"
                            >
                                <Download size={20} />
                                Sincronizar
                            </button>
                        </ProFeature>
                    )}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary-main hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-glow transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Plus size={20} />
                        Nueva Clase
                    </button>
                </div>
            </header>

            {/* Calendar Grid */}
            <div className="bg-surface backdrop-blur-xl rounded-[40px] border border-border-main overflow-hidden shadow-2xl h-[calc(100vh-220px)] flex flex-col relative">
                <div className="overflow-auto flex-1 custom-scrollbar relative">
                    <table className="w-full border-collapse table-fixed min-w-[1000px] relative">
                        <thead className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md">
                            <tr className="border-b border-border-main">
                                <th className="p-6 text-left text-text-muted font-black uppercase tracking-widest text-[10px] border-r border-border-main w-28 sticky left-0 bg-surface z-50">
                                    HORA
                                </th>
                                {weekDates.map((d, index) => (
                                    <th
                                        key={index}
                                        className={`p-4 text-center border-r border-border-main/30 last:border-0
                                            ${d.isToday ? 'bg-primary-main/5' : ''}`}
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${d.isToday ? 'text-primary-main' : 'text-text-muted'}`}>{d.short}</span>
                                            <span className={`text-xl font-black ${d.isToday ? 'text-primary-main' : 'text-text-main'}`}>{d.date}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="relative">
                            {/* Current Time Line Overlay */}
                            {showTimeLine && (
                                <div 
                                    className="absolute left-28 right-0 z-30 pointer-events-none flex items-center"
                                    style={{ top: `${timeLinePosition + 86}px` }} // Adjusting for header height
                                >
                                    <div className="w-2 h-2 rounded-full bg-primary-main shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                    <div className="flex-1 h-[2px] bg-gradient-to-r from-primary-main to-transparent opacity-50" />
                                </div>
                            )}

                            {HOURS.map((hour) => (
                                <tr key={hour} className="border-b border-border-main/30 last:border-0 hover:bg-primary-main/[0.01] transition-colors h-[100px]">
                                    <td className="p-4 text-text-muted text-[11px] font-black border-r border-border-main w-28 sticky left-0 bg-surface z-20 flex flex-col justify-start">
                                        {hour > 12 ? `${hour-12}PM` : `${hour}AM`}
                                    </td>
                                    {weekDates.map((d, dayIndex) => {
                                        const cellSchedules = getSchedulesForCell(dayIndex, hour);
                                        return (
                                            <td
                                                key={dayIndex}
                                                className={`p-1 align-top border-r border-border-main/20 last:border-r-0 relative
                                                    ${d.isToday ? 'bg-primary-main/[0.01] dark:bg-primary-main/[0.02]' : ''}`}
                                            >
                                                <div className="flex flex-col gap-1 h-full w-full">
                                                    {cellSchedules.map((s) => (
                                                        <motion.div
                                                            key={s.id}
                                                            initial={{ opacity: 0, x: -5 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="bg-primary-main/10 dark:bg-primary-main/15 border-l-4 border-primary-main shadow-sm p-3 rounded-xl group cursor-default hover:bg-primary-main/20 transition-all"
                                                        >
                                                            <div className="flex items-center justify-between gap-1 mb-1 relative z-10">
                                                                <span className="text-[10px] font-black text-primary-main uppercase tracking-widest opacity-80">
                                                                    {s.startTime}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setDeleteModal({ isOpen: true, id: s.id });
                                                                    }}
                                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                            <div className="text-sm font-bold text-text-main leading-tight truncate">
                                                                {s.student?.name}
                                                            </div>
                                                            <div className="text-[9px] text-text-muted mt-0.5 font-bold uppercase tracking-tighter truncate opacity-70">
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
            <div className="mt-6 flex flex-wrap gap-6 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary-main"></div>
                    <span>Clases Horario Fijo</span>
                </div>
                <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-primary-main" />
                    <span className="tracking-tight">Los choques de horario son prevenidos automáticamente.</span>
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
                            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-bg-soft w-full max-w-lg rounded-[40px] p-8 shadow-2xl border border-zinc-100 dark:border-border-emerald"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute right-6 top-6 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition"
                            >
                                <X size={24} />
                            </button>

                            <div className="mb-8">
                                <h2 className="text-3xl font-black text-text-main">Nueva Clase</h2>
                                <p className="text-text-muted mt-2 font-medium tracking-tight">Asigna un nuevo horario a un alumno</p>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-2">Alumno</label>
                                    <div className="relative">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={20} />
                                        <select
                                            required
                                            value={formData.studentId}
                                            onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                                            className="w-full pl-14 pr-6 py-5 bg-surface border border-border-main rounded-3xl text-text-main outline-none focus:ring-2 focus:ring-primary-main/20 transition-all appearance-none font-bold shadow-inner"
                                        >
                                            <option value="" className="dark:bg-bg-dark">Seleccionar alumno...</option>
                                            {students.map(s => (
                                                <option key={s.id} value={s.id} className="dark:bg-bg-dark">{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-2">Día</label>
                                        <select
                                            value={formData.dayOfWeek}
                                            onChange={e => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                                            className="w-full p-5 bg-surface border border-border-main rounded-3xl text-text-main outline-none focus:ring-2 focus:ring-primary-main/20 transition-all font-bold appearance-none shadow-inner"
                                        >
                                            {DAYS.map((day, i) => (
                                                <option key={i} value={i} className="dark:bg-bg-dark">{day}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-2">Horario</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="time"
                                                value={formData.startTime}
                                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                                className="w-full p-5 bg-surface border border-border-main rounded-3xl text-text-main outline-none focus:ring-2 focus:ring-primary-main/20 transition-all font-bold shadow-inner"
                                            />
                                            <span className="text-zinc-300 font-bold">a</span>
                                            <input
                                                type="time"
                                                value={formData.endTime}
                                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                                className="w-full p-5 bg-surface border border-border-main rounded-3xl text-text-main outline-none focus:ring-2 focus:ring-primary-main/20 transition-all font-bold shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary-main hover:bg-green-600 text-white font-black uppercase tracking-widest text-xs py-5 rounded-3xl shadow-xl shadow-primary-glow transition-all active:scale-[0.98] mt-4"
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
