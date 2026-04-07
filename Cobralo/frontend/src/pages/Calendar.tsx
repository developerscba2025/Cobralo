import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../services/api';
import type { UnifiedSchedule, Student } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, AlertCircle, Download, Calendar as CalendarIcon, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { showToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';

import EmptyState from '../components/EmptyState';
import AttendanceBulkModal from '../components/AttendanceBulkModal';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7am to 9pm

const Calendar = () => {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState<UnifiedSchedule[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [attendanceModal, setAttendanceModal] = useState<{ isOpen: boolean; schedule: UnifiedSchedule | null }>({
        isOpen: false,
        schedule: null
    });
    const [selectedMobileDay, setSelectedMobileDay] = useState(new Date().getDay());
    const [baseDate, setBaseDate] = useState(new Date());
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false,
        id: null
    });
    const [syncDropdown, setSyncDropdown] = useState(false);
    const syncDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (syncDropdownRef.current && !syncDropdownRef.current.contains(e.target as Node)) {
                setSyncDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [formData, setFormData] = useState<{
        studentIds: number[];
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        date: string;
        isRecurring: boolean;
    }>({
        studentIds: [],
        dayOfWeek: new Date().getDay(),
        startTime: '09:00',
        endTime: '10:00',
        date: (() => {
            const d = new Date();
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        })(),
        isRecurring: true
    });

    const location = useLocation();

    useEffect(() => {
        fetchData();
        if (location.state?.openModal) {
            setIsModalOpen(true);
            // Clear state after reading it to avoid re-opening on manual refresh
            window.history.replaceState({}, document.title);
        }
    }, []);

    const hasScrolled = useRef(false);
    useEffect(() => {
        if (!isLoading && schedules.length > 0 && !hasScrolled.current) {
            const earliestHour = Math.min(...schedules.map(s => parseInt(s.startTime.split(':')[0], 10)));
            // Try to show one hour before the first class for context, min 7am
            const targetHour = Math.max(7, earliestHour - 1);
            
            setTimeout(() => {
                const element = document.getElementById(`hour-row-${targetHour}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    hasScrolled.current = true;
                }
            }, 300);
        }
    }, [isLoading, schedules]);

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
        if (formData.studentIds.length === 0) {
            showToast.error('Selecciona al menos un alumno');
            return;
        }

        try {
            const result = await api.createSchedule({
                studentIds: formData.studentIds,
                dayOfWeek: formData.dayOfWeek,
                startTime: formData.startTime,
                endTime: formData.endTime,
                date: formData.isRecurring ? undefined : formData.date,
                isRecurring: formData.isRecurring
            });

            if ((result as any).error) {
                showToast.error((result as any).error);
                return;
            }

            if ((result as any).conflicts && (result as any).conflicts.length > 0) {
                const names = (result as any).conflicts.map((c: any) => c.student?.name || 'Otro alumno').join(', ');
                showToast.error(`${names} ya están en ese horario`);
            } else {
                showToast.success('Clase agendada correctamente');
            }
            
            setIsModalOpen(false);
            setFormData(prev => ({ ...prev, studentIds: [] }));
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

    const handleExportCSV = () => {
        if (schedules.length === 0) {
            showToast.error('No hay clases para exportar');
            return;
        }

        // Sort schedules by day and then by time for a more organized Excel
        const sortedSchedules = [...schedules].sort((a, b) => {
            if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
            return a.startTime.localeCompare(b.startTime);
        });

        // CSV BOM for Excel UTF-8
        let csvContent = "\uFEFF";
        
        // --- PRETTY HEADER ---
        csvContent += `COBRALO - REPORTE DE AGENDA SEMANAL,,,\n`;
        csvContent += `Generado el: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')},,,\n`;
        csvContent += `\n`; // Spacer
        
        // --- COLUMN HEADERS ---
        csvContent += "DÍA,HORARIO INICIO,HORARIO FIN,ALUMNO(S),SERVICIO/CATEGORÍA\n";
        
        sortedSchedules.forEach(s => {
            const dayName = DAYS[s.dayOfWeek].toUpperCase();
            const studentName = s.students && s.students.length > 1 
                ? `${s.students[0].name} +${s.students.length - 1}` 
                : (s.students?.[0]?.name || s.student?.name || 'Clase Grupal');
            const serviceName = s.students && s.students.length > 1 
                ? `GRUPO: ${s.students.length} ALUMNOS` 
                : (s.students?.[0]?.service_name || s.student?.service_name || 'GENERAL');

            // Sanitize values
            const row = [
                dayName,
                s.startTime,
                s.endTime,
                `"${studentName}"`,
                `"${serviceName}"`
            ].join(',');
            
            csvContent += row + "\n";
        });

        // --- FOOTER SUMMARY ---
        csvContent += `\n`;
        csvContent += `TOTAL DE CLASES SEMANALES: ${sortedSchedules.length},,,\n`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `agenda_cobralo_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast.success('Excel generado y organizado');
    };

    const handleSyncGoogle = () => {
        if (user?.plan !== 'PRO') {
            showToast.error('La sincronización con calendarios es una función exclusiva de Cobralo PRO');
            setSyncDropdown(false);
            return;
        }
        const feedPath = `/api/calendar-feed/feed/${user?.calendarToken}`;
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost) {
            showToast.error('En modo local, copíalo manualmente desde Ajustes > iCal.');
            navigator.clipboard.writeText(`${window.location.origin}${feedPath}`);
            setSyncDropdown(false);
            return;
        }
        const publicFeedUrl = `${window.location.origin}${feedPath}`;
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(publicFeedUrl)}`;
        showToast.success('Redirigiendo a Google Calendar...');
        navigator.clipboard.writeText(publicFeedUrl);
        window.open(googleCalendarUrl, '_blank');
        setSyncDropdown(false);
    };

    const handleSyncApple = () => {
        if (user?.plan !== 'PRO') {
            showToast.error('La sincronización con calendarios es una función exclusiva de Cobralo PRO');
            setSyncDropdown(false);
            return;
        }
        const feedPath = `/api/calendar-feed/feed/${user?.calendarToken}`;
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost) {
            showToast.error('En modo local, copíalo manualmente desde Ajustes > iCal.');
            navigator.clipboard.writeText(`${window.location.origin}${feedPath}`);
            setSyncDropdown(false);
            return;
        }
        const publicFeedUrl = `${window.location.origin}${feedPath}`;
        const webcalUrl = publicFeedUrl.replace(/^https?:\/\//, 'webcal://');
        showToast.success('¡Abriendo Apple/iCloud Calendar!');
        navigator.clipboard.writeText(publicFeedUrl);
        window.location.href = webcalUrl;
        setSyncDropdown(false);
    };

    const handleExportICS = () => {
        if (user?.plan !== 'PRO') {
            showToast.error('La sincronización con calendarios es una función exclusiva de Cobralo PRO');
            return;
        }

        const feedPath = `/api/calendar-feed/feed/${user?.calendarToken}`;
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (isLocalhost) {
            showToast.error('En modo local, copíalo manualmente desde Ajustes > iCal.');
            navigator.clipboard.writeText(`${window.location.origin}${feedPath}`);
            return;
        }

        const ua = navigator.userAgent;
        const isApple = /iPhone|iPad|iPod|Macintosh/i.test(ua) && !(/Windows/i.test(ua));

        if (isApple) {
            handleSyncApple();
        } else {
            // Android/Samsung: direct Google redirect
            // Windows: show dropdown with both options
            const isWindows = /Windows/i.test(ua);
            if (isWindows) {
                setSyncDropdown(prev => !prev);
            } else {
                handleSyncGoogle();
            }
        }
    };

    const getSchedulesForCell = (dayIndex: number, hour: number, dateStr: string) => {
        return schedules.filter(s => {
            const startHour = parseInt(s.startTime.split(':')[0]);
            const matchesDay = (s.isRecurring && s.dayOfWeek === dayIndex) || (!s.isRecurring && s.date === dateStr);
            return matchesDay && startHour === hour;
        });
    };

    const getWeekDates = () => {
        const todayStr = new Date().toDateString();
        
        // Show a rolling 7-day window starting from 1 day before baseDate
        const startDate = new Date(baseDate);
        startDate.setDate(startDate.getDate() - 1);
        
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const dayOfWeek = d.getDay();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            
            return {
                name: DAYS[dayOfWeek],
                short: DAYS[dayOfWeek].substring(0, 3),
                date: d.getDate(),
                isToday: d.toDateString() === todayStr,
                dayOfWeek: dayOfWeek,
                dateStr: `${year}-${month}-${day}`
            };
        });
    };

    const handlePrevWeek = () => {
        setBaseDate(prev => {
            const next = new Date(prev);
            next.setDate(prev.getDate() - 7);
            return next;
        });
    };

    const handleNextWeek = () => {
        setBaseDate(prev => {
            const next = new Date(prev);
            next.setDate(prev.getDate() + 7);
            return next;
        });
    };

    const handleToday = () => {
        setBaseDate(new Date());
    };

    const weekDates = getWeekDates();
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const showTimeLine = currentHour >= 7 && currentHour <= 21;
    const timeLinePosition = ((currentHour - 7) * 100) + (currentMinutes * 100 / 60);

    const getMonthShort = (dateStr: string) => {
        const monthNum = parseInt(dateStr.split('-')[1], 10);
        return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][monthNum - 1];
    };
    
    const startM = getMonthShort(weekDates[0].dateStr);
    const endM = getMonthShort(weekDates[6].dateStr);
    const weekLabel = startM === endM 
        ? `${weekDates[0].date} al ${weekDates[6].date} ${endM}` 
        : `${weekDates[0].date} ${startM} al ${weekDates[6].date} ${endM}`;

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
            <div className="flex flex-col gap-4">
                <header className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-text-main flex items-center gap-3 tracking-tighter uppercase italic">
                                AGENDA SEMANAL
                            </h1>
                            <p className="text-text-muted mt-1 font-medium tracking-tight">Gestiona tus horarios con precisión pro</p>
                        </div>
                    </div>
                    {/* Navigation Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-center bg-surface border border-border-main rounded-2xl p-1 shadow-sm w-full sm:w-auto gap-2 sm:gap-0">
                        <div className="flex items-center">
                            <button onClick={handlePrevWeek} className="p-2 hover:bg-bg-app rounded-xl transition text-text-main group" title="Semana Anterior">
                                <ChevronLeft size={20} className="group-active:-translate-x-1 transition-transform" />
                            </button>
                            <div className="min-w-[140px] text-center px-2 flex flex-col justify-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-main">{weekLabel}</span>
                            </div>
                            <button onClick={handleNextWeek} className="p-2 hover:bg-bg-app rounded-xl transition text-text-main group" title="Semana Siguiente">
                                <ChevronRight size={20} className="group-active:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <button onClick={handleToday} className="sm:ml-2 px-4 py-2 hover:bg-bg-app rounded-xl transition text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-primary-main">
                            Hoy
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportCSV}
                            className={`hidden md:flex items-center gap-2 px-6 py-3 bg-surface border border-border-main rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all touch-target text-text-main hover:bg-bg-app active:scale-95 shadow-sm`}
                        >
                            <Download size={18} className="text-primary-main" />
                            Excel (CSV)
                        </button>

                        {/* Sync button with dropdown for Windows */}
                        <div className="relative hidden md:block" ref={syncDropdownRef}>
                            <button
                                onClick={handleExportICS}
                                className={`flex items-center gap-2 px-6 py-3 bg-surface border border-border-main rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all touch-target ${
                                    user?.plan === 'PRO' 
                                    ? 'text-text-main hover:bg-bg-app active:scale-95 shadow-sm' 
                                    : 'text-zinc-500 hover:bg-bg-app hover:text-text-main'
                                }`}
                            >
                                <CalendarIcon size={18} />
                                Sincronizar
                                {user?.plan !== 'PRO' && <Lock size={14} className="text-primary-main ml-1" />}
                            </button>

                            {/* Windows dropdown */}
                            <AnimatePresence>
                                {syncDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border-main rounded-2xl shadow-2xl z-50 overflow-hidden"
                                    >
                                        <div className="p-2 space-y-1">
                                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-3 py-2">Elegí tu calendario</p>
                                            <button
                                                onClick={handleSyncGoogle}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary-main/5 transition-all text-left group"
                                            >
                                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                                    <CalendarIcon size={16} className="text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-text-main uppercase tracking-tight">Google Calendar</p>
                                                    <p className="text-[9px] text-zinc-400 font-bold">Abre en el navegador</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={handleSyncApple}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary-main/5 transition-all text-left group"
                                            >
                                                <div className="w-8 h-8 rounded-xl bg-zinc-500/10 flex items-center justify-center shrink-0">
                                                    <CalendarIcon size={16} className="text-zinc-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-text-main uppercase tracking-tight">Apple / iCloud</p>
                                                    <p className="text-[9px] text-zinc-400 font-bold">Requiere iCloud para Windows</p>
                                                </div>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="hidden md:flex bg-primary-main hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-glow transition-all items-center gap-2 active:scale-95 touch-target"
                        >
                            <Plus size={20} />
                            Nueva Clase
                        </button>
                    </div>
                </header>

            {/* Calendar Grid (Desktop) */}
            <div className="hidden md:flex bg-surface backdrop-blur-xl rounded-[30px] border border-border-main overflow-hidden shadow-2xl flex-1 min-h-0 flex-col relative w-full" style={{height: 'calc(100vh - 220px)'}}>
                <div className="overflow-auto flex-1 custom-scrollbar relative">
                    <table className="w-full border-collapse table-fixed relative">
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
                                <tr key={hour} id={`hour-row-${hour}`} className="border-b border-border-main/30 last:border-0 hover:bg-primary-main/[0.01] transition-colors h-[100px]">
                                    <td className="p-4 text-text-muted text-[11px] font-black border-r border-border-main w-28 sticky left-0 bg-surface z-20 flex flex-col justify-start">
                                        {hour > 12 ? `${hour-12}PM` : `${hour}AM`}
                                    </td>
                                    {weekDates.map((d, dayIndex) => {
                                        const cellSchedules = getSchedulesForCell(d.dayOfWeek, hour, d.dateStr);
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
                                                            onClick={() => setAttendanceModal({ isOpen: true, schedule: s })}
                                                            className="bg-primary-main/10 dark:bg-primary-main/15 border-l-4 border-primary-main shadow-sm p-3 rounded-xl group cursor-pointer hover:bg-primary-main/20 transition-all"
                                                        >
                                                            <div className="flex items-center justify-between gap-1 mb-1 relative z-10">
                                                                <span className="text-[10px] font-black text-primary-main uppercase tracking-widest opacity-80 flex items-center gap-1">
                                                                    {s.startTime}
                                                                    {!s.isRecurring && <CalendarIcon size={10} className="text-primary-main/60" />}
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
                                                                {s.students && s.students.length > 1 
                                                                    ? `${s.students[0].name} +${s.students.length - 1}` 
                                                                    : (s.students?.[0]?.name || s.student?.name || 'Clase Grupal')}
                                                            </div>
                                                            <div className="text-[9px] text-text-muted mt-0.5 font-bold uppercase tracking-tighter truncate opacity-70">
                                                                {s.students && s.students.length > 1 ? `${s.students.length} alumnos` : (s.students?.[0]?.service_name || s.student?.service_name || 'General')}
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

            {/* Calendar Mobile View */}
            <div className="md:hidden flex flex-col min-h-[500px]">
                {/* Day Selector Pills */}
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-6 -mx-4 px-4 sticky top-0 z-20 bg-bg-app/90 backdrop-blur-md pt-2 snap-x snap-mandatory">
                    {weekDates.map((d, _) => (
                        <button
                            key={d.dayOfWeek}
                            onClick={() => setSelectedMobileDay(d.dayOfWeek)}
                            className={`snap-center flex flex-col items-center justify-center min-w-[72px] h-[86px] rounded-[24px] p-3 transition-all ${
                                selectedMobileDay === d.dayOfWeek
                                    ? 'bg-primary-main text-white shadow-lg shadow-primary-glow border border-primary-light/30'
                                    : d.isToday
                                        ? 'bg-primary-main/10 text-primary-main border border-primary-main/20'
                                        : 'bg-surface border border-border-main text-text-muted hover:border-primary-main/30'
                            }`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-90">{d.short}</span>
                            <span className={`text-2xl font-black mt-1 leading-none ${selectedMobileDay === d.dayOfWeek ? 'text-white' : 'text-text-main'}`}>
                                {d.date}
                            </span>
                            {d.isToday && selectedMobileDay !== d.dayOfWeek && <div className="w-1 h-1 rounded-full bg-primary-main mt-1.5" />}
                        </button>
                    ))}
                </div>

                {/* Mobile Schedule List */}
                <div className="flex-1 space-y-4">
                    {(() => {
                        const selectedDateObj = weekDates.find(d => d.dayOfWeek === selectedMobileDay);
                        const daySchedules = schedules.filter(s => 
                            (s.isRecurring && s.dayOfWeek === selectedMobileDay) || 
                            (!s.isRecurring && s.date === selectedDateObj?.dateStr)
                        ).sort((a,b) => a.startTime.localeCompare(b.startTime));
                        if (daySchedules.length === 0) {
                            return (
                                <EmptyState
                                    icon={CalendarIcon}
                                    title="Día Libre"
                                    description="No tienes clases agendadas para este día."
                                    actionLabel="Nueva Clase"
                                    onAction={() => {
                                        const selectedDateObj = weekDates.find(d => d.dayOfWeek === selectedMobileDay);
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            dayOfWeek: selectedMobileDay,
                                            date: selectedDateObj?.dateStr || prev.date
                                        }));
                                        setIsModalOpen(true);
                                    }}
                                />
                            );
                        }
                        return daySchedules.map((s, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={s.id} 
                                className="card-premium p-5 flex gap-5 items-center bg-surface"
                            >
                                <div className="flex flex-col items-center justify-center min-w-[50px]">
                                    <div className="font-black text-primary-main text-lg leading-none">{s.startTime.split(':')[0]}</div>
                                    <div className="text-[10px] font-black uppercase text-text-muted mt-0.5">{s.startTime.split(':')[1]}</div>
                                    {!s.isRecurring && <CalendarIcon size={12} className="text-primary-main mt-1 opacity-50" />}
                                </div>
                                
                                <div className="w-px h-10 bg-border-main/50"></div>

                                <div 
                                    className="flex-1 min-w-0"
                                    onClick={() => setAttendanceModal({ isOpen: true, schedule: s })}
                                >
                                    <h4 className="text-base font-bold text-text-main truncate leading-tight">
                                        {s.students && s.students.length > 1 
                                            ? `${s.students[0].name} +${s.students.length - 1}` 
                                            : (s.students?.[0]?.name || s.student?.name || 'Clase Grupal')}
                                    </h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1 opacity-80 truncate">
                                        {s.students && s.students.length > 1 ? `${s.students.length} alumnos` : (s.students?.[0]?.service_name || s.student?.service_name || 'General')}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest bg-bg-app px-2 py-1 rounded-md">
                                        a {s.endTime}
                                    </span>
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: true, id: s.id })}
                                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ));
                    })()}
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

            {/* Mobile FAB - Sync */}
            {user?.plan === 'PRO' && (
                <button
                    onClick={handleExportICS}
                    className="lg:hidden fixed bottom-[90px] right-20 w-14 h-14 bg-surface border border-border-main text-text-main rounded-full flex items-center justify-center shadow-lg z-40 active:scale-95 transition-transform"
                    title="Sincronizar con Calendario"
                >
                    <CalendarIcon size={22} className="text-primary-main" />
                </button>
            )}

            {/* Mobile FAB - Nueva Clase */}
            <button
                onClick={() => {
                    const selectedDateObj = weekDates.find(d => d.dayOfWeek === selectedMobileDay);
                    setFormData(prev => ({ 
                        ...prev, 
                        dayOfWeek: selectedMobileDay,
                        date: selectedDateObj?.dateStr || prev.date
                    }));
                    setIsModalOpen(true);
                }}
                className="lg:hidden fixed bottom-[90px] right-4 w-14 h-14 bg-primary-main text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-glow z-40 active:scale-95 transition-transform"
            >
                <Plus size={24} strokeWidth={2.5} />
            </button>

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
                            className="relative bg-white dark:bg-bg-soft w-full max-w-lg rounded-[40px] p-4 sm:p-6 md:p-8 shadow-2xl border border-zinc-100 dark:border-border-emerald"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition touch-target"
                            >
                                <X size={24} />
                            </button>

                            <div className="mb-8">
                                <h2 className="text-3xl font-black text-text-main">Nueva Clase</h2>
                                <p className="text-text-muted mt-2 font-medium tracking-tight">Asigna un nuevo horario a un alumno</p>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-2">Alumnos (uno o más)</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto p-4 bg-surface border border-border-main rounded-3xl shadow-inner custom-scrollbar font-bold text-sm">
                                        {students.map(s => (
                                            <label key={s.id} className="flex items-center gap-3 p-2 hover:bg-primary-main/5 rounded-xl cursor-pointer transition-all">
                                                <input 
                                                    type="checkbox"
                                                    checked={formData.studentIds.includes(s.id)}
                                                    onChange={(e) => {
                                                        const ids = e.target.checked 
                                                            ? [...formData.studentIds, s.id]
                                                            : formData.studentIds.filter(id => id !== s.id);
                                                        setFormData({ ...formData, studentIds: ids });
                                                    }}
                                                    className="w-5 h-5 rounded-md accent-primary-main border-border-main"
                                                />
                                                <span className="text-text-main truncate">{s.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-2">Frecuencia</label>
                                        <div className="flex p-1 bg-surface border border-border-main rounded-2xl">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, isRecurring: true })}
                                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.isRecurring ? 'bg-primary-main text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                                            >
                                                Semanal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, isRecurring: false })}
                                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!formData.isRecurring ? 'bg-primary-main text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                                            >
                                                Un solo día
                                            </button>
                                        </div>
                                    </div>

                                    {formData.isRecurring ? (
                                        <div>
                                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-2">Día de la semana</label>
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
                                    ) : (
                                        <div>
                                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-2">Fecha exacta</label>
                                            <input
                                                type="date"
                                                value={formData.date}
                                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full p-5 bg-surface border border-border-main rounded-3xl text-text-main outline-none focus:ring-2 focus:ring-primary-main/20 transition-all font-bold shadow-inner"
                                            />
                                        </div>
                                    )}
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

            <AttendanceBulkModal 
                isOpen={attendanceModal.isOpen}
                onClose={() => setAttendanceModal({ isOpen: false, schedule: null })}
                schedule={attendanceModal.schedule}
                onSuccess={fetchData}
            />
            </div>
        </Layout>
    );
};

export default Calendar;
