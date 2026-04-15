import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../services/api';
import type { UnifiedSchedule, Student } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, AlertCircle, Download, Calendar as CalendarIcon, Lock, ChevronLeft, ChevronRight, CheckCircle2, Edit2, Search } from 'lucide-react';
import { showToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';

import EmptyState from '../components/EmptyState';
import AttendanceBulkModal from '../components/AttendanceBulkModal';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7am to 9pm

const Calendar = () => {
    const { user } = useAuth();
    const isPro = user?.plan === 'PRO' || user?.plan === 'INITIAL';
    const [schedules, setSchedules] = useState<UnifiedSchedule[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [attendanceModal, setAttendanceModal] = useState<{ isOpen: boolean; schedule: (UnifiedSchedule & { date?: string }) | null }>({
        isOpen: false,
        schedule: null
    });
    const [actionModal, setActionModal] = useState<{ isOpen: boolean; schedule: (UnifiedSchedule & { date?: string }) | null }>({
        isOpen: false,
        schedule: null
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [draggedId, setDraggedId] = useState<number | null>(null);
    const [selectedMobileDay, setSelectedMobileDay] = useState(new Date().getDay());
    const [baseDate, setBaseDate] = useState(new Date());
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false,
        id: null
    });
    const [syncDropdown, setSyncDropdown] = useState(false);
    const syncDropdownRef = useRef<HTMLDivElement>(null);
    const [studentSearchTerm, setStudentSearchTerm] = useState('');

    const [formData, setFormData] = useState<{
        studentIds: number[];
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        date: string;
        isRecurring: boolean;
        capacity?: number;
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
        isRecurring: true,
        capacity: 10
    });

    const location = useLocation();

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

    useEffect(() => {
        fetchData();
        if (location.state?.openModal) {
            setIsModalOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const getWeekDates = () => {
        const todayStr = new Date().toDateString();
        const monday = new Date(baseDate);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);
        
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
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

    const weekDates = getWeekDates();

    const hasScrolled = useRef<string | null>(null);
    useEffect(() => {
        if (!isLoading && schedules.length > 0 && hasScrolled.current !== baseDate.toDateString()) {
            const visibleDays = weekDates.map(d => d.dayOfWeek);
            const weekSchedules = schedules.filter(s => visibleDays.includes(s.dayOfWeek));
            
            if (weekSchedules.length > 0) {
                const earliestHour = Math.min(...weekSchedules.map(s => parseInt(s.startTime.split(':')[0], 10)));
                const targetHour = Math.max(7, earliestHour - 1);
                
                setTimeout(() => {
                    const element = document.getElementById(`hour-row-${targetHour}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        hasScrolled.current = baseDate.toDateString();
                    }
                }, 300);
            }
        }
    }, [isLoading, schedules, baseDate, weekDates]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.studentIds.length === 0) {
            showToast.error('Selecciona al menos un alumno');
            return;
        }

        if (formData.startTime >= formData.endTime) {
            showToast.error('La hora de inicio debe ser anterior a la de fin');
            return;
        }

        try {
            let result;
            if (editingId) {
                result = await api.updateSchedule(editingId, {
                    studentIds: formData.studentIds,
                    dayOfWeek: formData.dayOfWeek,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    date: formData.isRecurring ? undefined : formData.date,
                    isRecurring: formData.isRecurring,
                    capacity: formData.capacity
                });
                showToast.success('Clase actualizada correctamente');
            } else {
                result = await api.createSchedule({
                    studentIds: formData.studentIds,
                    dayOfWeek: formData.dayOfWeek,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    date: formData.isRecurring ? undefined : formData.date,
                    isRecurring: formData.isRecurring,
                    capacity: formData.capacity
                });

                if ((result as any).conflicts && (result as any).conflicts.length > 0) {
                    const names = (result as any).conflicts.map((c: any) => c.student?.name || 'Otro alumno').join(', ');
                    showToast.error(`${names} ya están en ese horario`);
                } else {
                    showToast.success('Clase agendada correctamente');
                }
            }
            
            setIsModalOpen(false);
            setEditingId(null);
            setFormData(prev => ({ ...prev, studentIds: [] }));
            fetchData();
        } catch (error: any) {
            showToast.error(error.message || 'Error al guardar la clase');
        }
    };

    const handleEdit = (schedule: UnifiedSchedule) => {
        setFormData({
            studentIds: schedule.students?.map(s => s.id) || (schedule.student ? [schedule.student.id] : []),
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            date: schedule.date || new Date().toISOString().split('T')[0],
            isRecurring: schedule.isRecurring,
            capacity: schedule.capacity || 10
        });
        setEditingId(schedule.id);
        setIsModalOpen(true);
    };

    const handleDragStart = (e: React.DragEvent, id: number) => {
        setDraggedId(id);
        e.dataTransfer.setData('scheduleId', id.toString());
        // Reduce opacity visually
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.5';
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
        setDraggedId(null);
    };

    const handleDrop = async (e: React.DragEvent, dayOfWeek: number, hour: number) => {
        e.preventDefault();
        const scheduleId = Number(e.dataTransfer.getData('scheduleId'));
        if (!scheduleId) return;

        const schedule = schedules.find(s => s.id === scheduleId);
        if (!schedule) return;

        // Calculate duration to keep it same
        const [startH, startM] = schedule.startTime.split(':').map(Number);
        const [endH, endM] = schedule.endTime.split(':').map(Number);
        const durationMin = (endH * 60 + endM) - (startH * 60 + startM);

        const newStartHour = hour;
        const newStartMinutes = startM; // Keep original minutes offset
        const newStartTime = `${String(newStartHour).padStart(2, '0')}:${String(newStartMinutes).padStart(2, '0')}`;
        
        const totalEndMinutes = (newStartHour * 60 + newStartMinutes) + durationMin;
        const newEndHour = Math.floor(totalEndMinutes / 60);
        const newEndMinutes = totalEndMinutes % 60;
        const newEndTime = `${String(newEndHour).padStart(2, '0')}:${String(newEndMinutes).padStart(2, '0')}`;

        try {
            await api.updateSchedule(scheduleId, {
                dayOfWeek,
                startTime: newStartTime,
                endTime: newEndTime
            });
            showToast.success('Horario actualizado');
            fetchData();
        } catch (error: any) {
            showToast.error(error.message || 'Error al mover el turno');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Required to allow drop
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

        const sortedSchedules = [...schedules].sort((a, b) => {
            if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
            return a.startTime.localeCompare(b.startTime);
        });

        let csvContent = "\uFEFF";
        csvContent += `COBRALO - REPORTE DE AGENDA SEMANAL,,,\n`;
        csvContent += `Generado el: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')},,,\n`;
        csvContent += `\n`;
        csvContent += "DÍA,HORARIO INICIO,HORARIO FIN,ALUMNO(S),SERVICIO/CATEGORÍA\n";
        
        sortedSchedules.forEach(s => {
            const dayName = DAYS[s.dayOfWeek].toUpperCase();
            const studentName = s.students && s.students.length > 1 
                ? `${s.students[0].name} +${s.students.length - 1}` 
                : (s.students?.[0]?.name || s.student?.name || 'Clase Grupal');
            const serviceName = s.students && s.students.length > 1 
                ? `GRUPO: ${s.students.length} ALUMNOS` 
                : (s.students?.[0]?.service_name || s.student?.service_name || 'GENERAL');

            const cleanStudent = studentName.replace(/"/g, '""');
            const cleanService = serviceName.replace(/"/g, '""');

            const row = [
                dayName,
                s.startTime,
                s.endTime,
                `"${cleanStudent}"`,
                `"${cleanService}"`
            ].join(',');
            
            csvContent += row + "\n";
        });

        csvContent += `\nTOTAL DE CLASES SEMANALES: ${sortedSchedules.length},,,\n`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `agenda_cobralo_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast.success('Excel generado');
    };

    const handleSyncGoogle = () => {
        if (user?.plan === 'FREE') {
            showToast.error('Función exclusiva de Cobralo PRO');
            setSyncDropdown(false);
            return;
        }
        const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');
        const feedUrl = `${API_BASE}/api/calendar-feed/feed/${user?.calendarToken}`;
        navigator.clipboard.writeText(feedUrl);
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(feedUrl)}`;
        window.open(googleCalendarUrl, '_blank');
        setSyncDropdown(false);
    };

    const handleSyncApple = () => {
        if (!isPro) {
            showToast.error('Función exclusiva de Cobralo PRO');
            setSyncDropdown(false);
            return;
        }
        const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');
        const feedUrl = `${API_BASE}/api/calendar-feed/feed/${user?.calendarToken}`;
        const webcalUrl = feedUrl.replace(/^https?:\/\//, 'webcal://');
        
        // Copy to clipboard as fallback
        navigator.clipboard.writeText(feedUrl);
        showToast.success('Enlace copiado. Si no se abre tu Calendario, pégalo en la configuración de iCloud.');
        
        // Try to open protocol
        window.location.href = webcalUrl;
        setSyncDropdown(false);
    };

    const handleCopyFeed = () => {
        if (!isPro) {
            showToast.error('Función exclusiva de Cobralo PRO');
            setSyncDropdown(false);
            return;
        }
        const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');
        const feedUrl = `${API_BASE}/api/calendar-feed/feed/${user?.calendarToken}`;
        navigator.clipboard.writeText(feedUrl);
        showToast.success('Enlace de suscripción copiado al portapapeles.');
        setSyncDropdown(false);
    };

    const handleExportICS = () => {
        if (user?.plan === 'FREE') {
            showToast.error('Función exclusiva de Cobralo PRO');
            return;
        }
        const ua = navigator.userAgent;
        const isApple = /iPhone|iPad|iPod|Macintosh/i.test(ua) && !(/Windows/i.test(ua));
        const isAndroid = /Android/i.test(ua);

        if (isApple) {
            handleSyncApple();
        } else if (isAndroid) {
            setSyncDropdown(prev => !prev);
        } else {
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

    const handlePrevWeek = () => { setBaseDate(prev => { const next = new Date(prev); next.setDate(prev.getDate() - 7); return next; }); };
    const handleNextWeek = () => { setBaseDate(prev => { const next = new Date(prev); next.setDate(prev.getDate() + 7); return next; }); };
    const handleToday = () => { setBaseDate(new Date()); };

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
            <Layout fitted>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout fitted scrollable={false}>
            <div className="flex flex-col h-full gap-2 2xl:gap-4 min-h-0">
                <header className="flex-shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-2 md:mb-4 2xl:mb-8">
                    <div className="flex flex-col">
                        <h1 className="text-base md:text-2xl 2xl:text-4xl font-extrabold text-text-main tracking-tight uppercase leading-none flex items-center gap-2">
                            <span className="w-1 h-5 md:w-1.5 md:h-6 bg-primary-main rounded-full" />
                            AGENDA
                        </h1>
                        <p className="text-[8px] md:text-[9px] 2xl:text-xs font-bold text-text-muted uppercase tracking-[0.2em] opacity-40 mt-1 ml-2.5 md:ml-3.5 italic">Inteligencia y precisión</p>
                    </div>
                    
                    <div className="flex items-center bg-surface/50 backdrop-blur-sm border border-border-main rounded-2xl p-0.5 shadow-sm h-10 md:h-12">
                        <div className="flex items-center">
                            <button onClick={handlePrevWeek} className="p-1.5 md:p-2 hover:bg-bg-app rounded-xl transition text-text-main group">
                                <ChevronLeft size={16} className="md:size-[18px] group-active:-translate-x-1 transition-transform" />
                            </button>
                            <div className="min-w-[120px] md:min-w-[150px] text-center px-0.5">
                                <span className="text-[9px] md:text-[10px] 2xl:text-[11px] font-black uppercase tracking-widest text-text-main/80">{weekLabel}</span>
                            </div>
                            <button onClick={handleNextWeek} className="p-1.5 md:p-2 hover:bg-bg-app rounded-xl transition text-text-main group">
                                <ChevronRight size={16} className="md:size-[18px] group-active:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="w-[1px] h-3 md:h-4 bg-border-main mx-1" />
                        <button onClick={handleToday} className="px-3 md:px-4 py-1.5 md:py-2 hover:bg-bg-app rounded-xl transition text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-primary-main">
                            Hoy
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2 h-12">
                        <button onClick={handleExportCSV} className="hidden md:flex items-center gap-2 px-5 py-3 bg-surface/50 border border-border-main rounded-2xl font-black uppercase tracking-widest text-[9px] text-text-main/70 hover:text-text-main hover:bg-bg-app transition-all shadow-sm">
                            <Download size={14} className="text-primary-main" />
                            Excel
                        </button>
                        <div className="relative hidden md:block" ref={syncDropdownRef}>
                            <button onClick={handleExportICS} className={`flex items-center gap-2 px-5 py-3 bg-surface/50 border border-border-main rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all ${user?.plan === 'FREE' ? 'text-zinc-500' : 'text-text-main/70 hover:text-text-main hover:bg-bg-app'}`}>
                                <CalendarIcon size={14} />
                                Sincronizar
                                {user?.plan === 'FREE' && <Lock size={12} className="text-primary-main ml-1" />}
                            </button>
                            <AnimatePresence>
                                {syncDropdown && (
                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border-main rounded-2xl shadow-2xl z-50 overflow-hidden">
                                        <div className="p-2 space-y-1">
                                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-3 py-2">Elegí tu calendario</p>
                                            <button onClick={handleSyncGoogle} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary-main/5 transition-all text-left">
                                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0"><CalendarIcon size={16} className="text-blue-500" /></div>
                                                <div><p className="text-[11px] font-black text-text-main uppercase tracking-tight">Google Calendar</p></div>
                                            </button>
                                            <button onClick={handleSyncApple} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary-main/5 transition-all text-left">
                                                <div className="w-8 h-8 rounded-xl bg-zinc-500/10 flex items-center justify-center shrink-0"><CalendarIcon size={16} className="text-zinc-400" /></div>
                                                <div><p className="text-[11px] font-black text-text-main uppercase tracking-tight">Apple / iCloud</p></div>
                                            </button>
                                            <div className="mx-3 h-[1px] bg-border-main/50" />
                                            <button onClick={handleCopyFeed} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary-main/5 transition-all text-left">
                                                <div className="w-8 h-8 rounded-xl bg-primary-main/10 flex items-center justify-center shrink-0"><Download size={16} className="text-primary-main" /></div>
                                                <div><p className="text-[11px] font-black text-text-main uppercase tracking-tight">Copiar Enlace Feed</p></div>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button onClick={() => { setEditingId(null); setFormData(prev => ({ ...prev, studentIds: [] })); setIsModalOpen(true); }} className="hidden md:flex bg-primary-main hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary-glow transition-all items-center gap-2">
                            <Plus size={16} />
                            Nueva Clase
                        </button>
                    </div>
                </header>

                {/* Desktop Grid */}
                <div className="hidden md:flex flex-1 flex-col relative w-full min-h-0">
                    <div className="overflow-auto custom-scrollbar flex-1 relative border border-border-main rounded-3xl bg-surface shadow-inner">
                        {/* Current Time Indicator */}
                        {showTimeLine && (
                            <div className="absolute left-28 right-0 z-30 pointer-events-none flex items-center" style={{ top: `${timeLinePosition + 86}px` }}>
                                <div className="w-2 h-2 rounded-full bg-primary-main shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                <div className="flex-1 h-[2px] bg-gradient-to-r from-primary-main to-transparent opacity-50" />
                            </div>
                        )}
                        <table className="w-full border-collapse table-fixed relative">
                            <thead className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md">
                                <tr className="border-b border-border-main">
                                    <th className="p-6 text-left text-text-muted font-black uppercase tracking-widest text-[10px] border-r border-border-main w-28 sticky left-0 bg-surface z-50">HORA</th>
                                    {weekDates.map((d, index) => (
                                        <th key={index} className={`p-4 text-center border-r border-border-main/10 last:border-0 ${d.isToday ? 'bg-primary-main/[0.03]' : ''}`}>
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${d.isToday ? 'text-primary-main' : 'text-text-muted opacity-60'}`}>{d.short}</span>
                                                <span className={`text-xl font-black tracking-tight ${d.isToday ? 'text-primary-main bg-primary-main/10 px-3 py-1 rounded-xl' : 'text-text-main'}`}>{d.date}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="relative">
                                {HOURS.map((hour) => (
                                    <tr key={hour} id={`hour-row-${hour}`} className="border-b border-border-main/30 last:border-0 hover:bg-primary-main/[0.01] transition-colors h-28">
                                        <td className="p-4 text-text-muted text-[11px] font-black border-r border-border-main w-28 sticky left-0 bg-surface z-20">{hour > 12 ? `${hour-12}PM` : `${hour}AM`}</td>
                                        {weekDates.map((d, dayIdx) => {
                                            const cellSchedules = getSchedulesForCell(d.dayOfWeek, hour, d.dateStr);
                                            return (
                                                <td 
                                                    key={dayIdx} 
                                                    className={`p-1 align-top border-r border-border-main/10 last:border-r-0 relative ${d.isToday ? 'bg-primary-main/[0.02]' : ''} transition-colors duration-200 ${draggedId ? 'hover:bg-primary-main/5 cursor-alias' : 'hover:bg-primary-main/[0.01]'}`}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, d.dayOfWeek, hour)}
                                                >
                                                    <div className="flex flex-col gap-1 w-full min-h-24">
                                                        {cellSchedules.map((s) => (
                                                            <motion.div 
                                                                key={s.id} 
                                                                onClick={() => setActionModal({ isOpen: true, schedule: { ...s, date: d.dateStr } as any })} 
                                                                draggable="true"
                                                                onDragStart={(e: React.DragEvent) => handleDragStart(e, s.id)}
                                                                onDragEnd={handleDragEnd}
                                                                className="bg-primary-main/10 dark:bg-primary-main/15 border-l-4 border-primary-main shadow-sm p-3 rounded-xl group cursor-pointer hover:bg-primary-main/20 transition-all active:scale-[0.98] select-none"
                                                            >
                                                                <div className="flex items-center justify-between gap-1 mb-1">
                                                                    <span className="text-[10px] font-black text-primary-main uppercase tracking-widest opacity-80 flex items-center gap-1">
                                                                        {s.startTime} {!s.isRecurring && <CalendarIcon size={10} />}
                                                                    </span>
                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(s); }} className="p-1 text-primary-main rounded-lg hover:bg-primary-main/10 transition-all" title="Editar horario"><Edit2 size={12} /></button>
                                                                        <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, id: s.id }); }} className="p-1 text-red-500 rounded-lg hover:bg-red-500/10 transition-all" title="Eliminar"><Trash2 size={12} /></button>
                                                                    </div>
                                                                </div>
                                                                <div className="text-sm font-bold text-text-main leading-tight truncate">
                                                                    {s.students && s.students.length > 1 ? `${s.students[0].name} +${s.students.length - 1}` : (s.students?.[0]?.name || s.student?.name || 'Clase Grupal')}
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

                {/* Mobile View */}
                <div className="md:hidden flex flex-col min-h-[500px]">
                    <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 sticky top-0 z-20 bg-bg-app/90 backdrop-blur-md pt-2 snap-x">
                        {weekDates.map((d) => (
                            <button key={d.dayOfWeek} onClick={() => setSelectedMobileDay(d.dayOfWeek)} className={`snap-center flex flex-col items-center justify-center min-w-[60px] h-[72px] rounded-[20px] p-2 transition-all ${selectedMobileDay === d.dayOfWeek ? 'bg-primary-main text-white shadow-lg shadow-primary-glow border border-primary-light/30' : d.isToday ? 'bg-primary-main/10 text-primary-main border border-primary-main/20' : 'bg-surface border border-border-main text-text-muted hover:border-primary-main/30'}`}>
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-90">{d.short}</span>
                                <span className={`text-xl font-black mt-0.5 leading-none ${selectedMobileDay === d.dayOfWeek ? 'text-white' : 'text-text-main'}`}>{d.date}</span>
                                {d.isToday && selectedMobileDay !== d.dayOfWeek && <div className="w-1 h-1 rounded-full bg-primary-main mt-1" />}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 space-y-4">
                        {(() => {
                            const selectedDateObj = weekDates.find(d => d.dayOfWeek === selectedMobileDay);
                            const daySchedules = schedules.filter(s => (s.isRecurring && s.dayOfWeek === selectedMobileDay) || (!s.isRecurring && s.date === selectedDateObj?.dateStr)).sort((a,b) => a.startTime.localeCompare(b.startTime));
                            if (daySchedules.length === 0) return (
                                <EmptyState icon={CalendarIcon} title="Día Libre" description="No tienes clases agendadas para este día." actionLabel="Nueva Clase" onAction={() => {
                                    const selectedDateObj = weekDates.find(d => d.dayOfWeek === selectedMobileDay);
                                    setEditingId(null);
                                    setFormData(prev => ({ ...prev, dayOfWeek: selectedMobileDay, date: selectedDateObj?.dateStr || prev.date, studentIds: [] }));
                                    setIsModalOpen(true);
                                }}/>
                            );
                            return daySchedules.map((s, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                                    transition={{ delay: idx * 0.05 }} 
                                    key={s.id} 
                                    onClick={() => setActionModal({ isOpen: true, schedule: { ...s, date: selectedDateObj?.dateStr } as any })}
                                    className="card-premium p-3.5 flex gap-3.5 items-center bg-surface cursor-pointer active:scale-[0.98] transition-all"
                                >
                                    <div className="flex flex-col items-center justify-center min-w-[45px]">
                                        <div className="font-black text-primary-main text-base leading-none">{s.startTime.split(':')[0]}</div>
                                        <div className="text-[9px] font-black uppercase text-text-muted mt-0.5">{s.startTime.split(':')[1]}</div>
                                        {!s.isRecurring && <CalendarIcon size={10} className="text-primary-main mt-1 opacity-50" />}
                                    </div>
                                    <div className="w-px h-8 bg-border-main/50"></div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[15px] font-bold text-text-main truncate leading-tight">
                                            {s.students && s.students.length > 1 ? `${s.students[0].name} +${s.students.length - 1}` : (s.students?.[0]?.name || s.student?.name || 'Clase Grupal')}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-80 truncate">
                                                {s.students && s.students.length > 1 ? `${s.students.length} alumnos` : (s.students?.[0]?.service_name || s.student?.service_name || 'General')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setAttendanceModal({ isOpen: true, schedule: { ...s, date: selectedDateObj?.dateStr } as any }); }}
                                                className="w-8 h-8 flex items-center justify-center bg-primary-main/10 text-primary-main rounded-xl hover:bg-primary-main hover:text-white transition-all active:scale-90"
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleEdit(s); }} className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-300 hover:text-primary-main hover:bg-primary-main/10 transition-all"><Edit2 size={14} /></button>
                                        </div>
                                        <span className="text-[8px] font-black text-white bg-primary-main/90 px-1.5 py-0.5 rounded-full shadow-sm">a {s.endTime}</span>
                                    </div>
                                </motion.div>
                            ));
                        })()}
                    </div>
                </div>

                {/* Mobile FABs */}
                <div className="lg:hidden fixed bottom-[90px] right-4 flex flex-col gap-3 z-40">
                    {user?.plan === 'PRO' && (
                        <button onClick={handleExportICS} className="w-14 h-14 bg-surface border border-border-main text-text-main rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                            <CalendarIcon size={22} className="text-primary-main" />
                        </button>
                    )}
                    <button onClick={() => { setEditingId(null); setFormData(prev => ({ ...prev, studentIds: [] })); setIsModalOpen(true); }} className="w-14 h-14 bg-primary-main text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-glow active:scale-95 transition-transform">
                        <Plus size={24} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-6 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary-main"></div>
                        <span>Clases Agendadas</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary-main">
                        <AlertCircle size={14} />
                        <span>Choques prevenidos automáticamente</span>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white dark:bg-bg-soft w-full max-w-lg rounded-[40px] p-6 shadow-2xl border border-zinc-100 dark:border-border-emerald max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition"><X size={24} /></button>
                            <div className="mb-8">
                                <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tighter uppercase italic leading-tight">
                                    {editingId 
                                        ? `Editar Clase${formData.studentIds.length > 0 
                                            ? ` - ${students.find(s => s.id === formData.studentIds[0])?.name || ''}${formData.studentIds.length > 1 ? ` +${formData.studentIds.length - 1}` : ''}` 
                                            : ''}` 
                                        : 'Nueva Clase'}
                                </h2>
                                <p className="text-text-muted mt-2 font-bold text-[10px] uppercase tracking-[0.2em] opacity-60">
                                    {editingId ? 'Modificá los detalles de este horario' : 'Asigná un nuevo horario a un alumno'}
                                </p>
                            </div>
                             <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-3 ml-2">
                                        <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em]">Alumnos (uno o más)</label>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-main opacity-50" size={12} />
                                            <input 
                                                type="text" 
                                                placeholder="Buscar..." 
                                                value={studentSearchTerm} 
                                                onChange={(e) => setStudentSearchTerm(e.target.value)} 
                                                className="text-[11px] font-bold bg-surface dark:bg-bg-soft border border-border-main rounded-xl pl-8 pr-3 py-1.5 outline-none focus:ring-2 focus:ring-primary-main/20 shadow-inner w-40 text-text-main transition-all placeholder:text-zinc-500" 
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto p-3 bg-surface dark:bg-bg-app/40 border border-border-main rounded-[24px] shadow-inner font-bold text-sm custom-scrollbar">
                                        {(() => {
                                            const filtered = students.filter(s => s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()));
                                            const prioritized = [...filtered].sort((a, b) => {
                                                const aSelected = formData.studentIds.includes(a.id);
                                                const bSelected = formData.studentIds.includes(b.id);
                                                if (aSelected && !bSelected) return -1;
                                                if (!aSelected && bSelected) return 1;
                                                return a.name.localeCompare(b.name);
                                            });
                                            return prioritized.map(s => {
                                                const isSelected = formData.studentIds.includes(s.id);
                                                return (
                                                    <label key={s.id} className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-primary-main/10 border-primary-main/20 shadow-sm' : 'hover:bg-primary-main/5 border-transparent'}`}>
                                                        <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary-main border-primary-main' : 'border-zinc-300 dark:border-zinc-700'}`}>
                                                            {isSelected && <CheckCircle2 size={10} className="text-white" />}
                                                            <input 
                                                                type="checkbox" 
                                                                checked={isSelected} 
                                                                onChange={(e) => { 
                                                                    const ids = e.target.checked ? [...formData.studentIds, s.id] : formData.studentIds.filter(id => id !== s.id); 
                                                                    setFormData({ ...formData, studentIds: ids }); 
                                                                }} 
                                                                className="hidden" 
                                                            />
                                                        </div>
                                                        <span className={`text-[12px] tracking-tight truncate ${isSelected ? 'text-primary-main font-black' : 'text-text-main font-bold'}`}>{s.name}</span>
                                                    </label>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] mb-2.5 ml-2">Frecuencia</label>
                                        <div className="flex p-1.5 bg-surface dark:bg-bg-app/40 border border-border-main rounded-[20px] shadow-inner">
                                            <button type="button" onClick={() => setFormData({ ...formData, isRecurring: true })} className={`flex-1 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${formData.isRecurring ? 'bg-primary-main text-white shadow-lg shadow-primary-main/20' : 'text-zinc-500'}`}>Semanal</button>
                                            <button type="button" onClick={() => setFormData({ ...formData, isRecurring: false })} className={`flex-1 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${!formData.isRecurring ? 'bg-primary-main text-white shadow-lg shadow-primary-main/20' : 'text-zinc-500'}`}>Única</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] mb-2.5 ml-2">{formData.isRecurring ? 'Día' : 'Fecha'}</label>
                                            {formData.isRecurring ? (
                                                <select value={formData.dayOfWeek} onChange={e => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })} className="w-full p-3.5 bg-surface border border-border-main rounded-[20px] text-text-main outline-none focus:ring-2 focus:ring-primary-main/20 font-black text-[11px] appearance-none shadow-sm dark:[color-scheme:dark]">
                                                    {DAYS.map((day, i) => <option key={i} value={i}>{day}</option>)}
                                                </select>
                                            ) : (
                                                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full p-3.5 bg-surface border border-border-main rounded-[20px] text-text-main font-black text-[11px] shadow-sm dark:[color-scheme:dark] outline-none focus:ring-2 focus:ring-primary-main/20" />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] mb-2.5 ml-2">Cupo</label>
                                            <input type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })} className="w-full p-3.5 bg-surface border border-border-main rounded-[20px] text-text-main font-black text-[11px] shadow-sm dark:[color-scheme:dark] outline-none focus:ring-2 focus:ring-primary-main/20" min="1" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] mb-2.5 ml-2">Horario</label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 relative">
                                                <input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="w-full p-3.5 bg-surface border border-border-main rounded-[20px] text-text-main font-black text-[11px] shadow-sm dark:[color-scheme:dark] outline-none focus:ring-2 focus:ring-primary-main/20" />
                                            </div>
                                            <span className="text-zinc-300 font-bold opacity-30">a</span>
                                            <div className="flex-1 relative">
                                                <input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} className="w-full p-3.5 bg-surface border border-border-main rounded-[20px] text-text-main font-black text-[11px] shadow-sm dark:[color-scheme:dark] outline-none focus:ring-2 focus:ring-primary-main/20" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-primary-main hover:bg-emerald-600 text-white py-4 rounded-[20px] font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary-main/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3">
                                    <CheckCircle2 size={16} />
                                    <span>{editingId ? 'Guardar Cambios' : 'Agendar Clase'}</span>
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Action Menu Popup */}
            <AnimatePresence>
                {actionModal.isOpen && actionModal.schedule && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={() => setActionModal({ isOpen: false, schedule: null })} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div initial={{opacity: 0, y: 100}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 100}} className="relative bg-surface dark:bg-bg-soft border border-border-main rounded-[32px] sm:rounded-[24px] shadow-2xl w-full sm:w-96 overflow-hidden">
                            <div className="p-6 border-b border-border-main flex items-center justify-between bg-black/5 dark:bg-white/[0.02]">
                                <div className="min-w-0">
                                    <h3 className="font-black text-text-main text-lg truncate pr-4 uppercase italic tracking-tight">
                                        {actionModal.schedule.students && actionModal.schedule.students.length > 1 
                                            ? `Grupo: ${actionModal.schedule.students[0].name} +${actionModal.schedule.students.length - 1}` 
                                            : (actionModal.schedule.students?.[0]?.name || actionModal.schedule.student?.name || 'Clase Grupal')}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-main animate-pulse" />
                                        <p className="text-[10px] uppercase font-black tracking-widest text-text-muted">
                                            Opciones de Turno • {actionModal.schedule.startTime} HS
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setActionModal({ isOpen: false, schedule: null })} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-text-muted transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-3 flex flex-col gap-2">
                                <button 
                                    onClick={() => {
                                        setAttendanceModal({ isOpen: true, schedule: actionModal.schedule });
                                        setActionModal({ isOpen: false, schedule: null });
                                    }}
                                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-primary-main/10 hover:bg-primary-main text-primary-main hover:text-white transition-all text-left group"
                                >
                                    <div className="p-2.5 rounded-xl bg-primary-main text-white shadow-lg shadow-primary-main/20 group-hover:bg-white group-hover:text-primary-main transition-colors">
                                        <CheckCircle2 size={18} strokeWidth={3} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Asistencia</span>
                                        <span className="text-[10px] font-bold opacity-60">Marcar presentes/ausentes</span>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => {
                                        handleEdit(actionModal.schedule!);
                                        setActionModal({ isOpen: false, schedule: null });
                                    }}
                                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left group"
                                >
                                    <div className="p-2.5 rounded-xl bg-zinc-200 dark:bg-white/10 text-text-main group-hover:bg-white dark:group-hover:bg-white/20 transition-colors">
                                        <Edit2 size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Editar Turno</span>
                                        <span className="text-[10px] font-bold text-text-muted">Cambiar hora, alumnos o frecuencia</span>
                                    </div>
                                </button>

                                <div className="h-px bg-border-main/50 my-1 mx-4" />

                                <button 
                                    onClick={() => {
                                        setDeleteModal({ isOpen: true, id: actionModal.schedule!.id });
                                        setActionModal({ isOpen: false, schedule: null });
                                    }}
                                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-red-500/10 transition-all text-left group"
                                >
                                    <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                        <Trash2 size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black text-red-500 uppercase tracking-[0.2em]">Eliminar Turno</span>
                                        <span className="text-[10px] font-bold text-red-500/60">Quitar permanentemente de la agenda</span>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal isOpen={deleteModal.isOpen} onCancel={() => setDeleteModal({ isOpen: false, id: null })} onConfirm={handleDelete} title="Eliminar Clase" message="¿Estás seguro que querés eliminar esta clase? También se eliminará del calendario de tus alumnos." confirmText="ELIMINAR" /><AttendanceBulkModal isOpen={attendanceModal.isOpen} onClose={() => setAttendanceModal({ isOpen: false, schedule: null })} schedule={attendanceModal.schedule as any} attendanceDate={attendanceModal.schedule?.date} onSuccess={fetchData} />
        </Layout>
    );
};

export default Calendar;
