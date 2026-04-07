import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MessageCircle, TrendingUp, Users, DollarSign, Zap, Activity, CheckCircle2, BarChart3, CalendarDays, Clock, ListTodo, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, type Student, type UnifiedSchedule } from '../services/api';
import EmptyState from '../components/EmptyState';
import { showToast } from '../components/Toast';
import { fadeInUpVariants, staggerContainerVariants, listItemVariants } from '../utils/motion';
import AttendanceBulkModal from '../components/AttendanceBulkModal';
import AnimatedCounter from '../components/AnimatedCounter';
import EmergencyNoticeModal from '../components/EmergencyNoticeModal';
import { AlertTriangle } from 'lucide-react';

interface ProDashboardProps {
    stats: {
        paid: number;
        pending: number;
        totalStudents: number;
    };
    chartData?: { name: string; ingresos: number; pagos: number }[];
    todaysSchedules?: any[];
    students?: Student[];
    user: any;
    monthChange?: string | number;
    pendingAdjustment?: any;
    onAction?: () => void;
}

/* ─── Bento card style helper ─── */
const bentoBase = "relative overflow-hidden rounded-[28px] border border-border-main transition-all duration-300";
const bentoGlass = "bg-surface dark:bg-bg-soft shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]";


const ProDashboard: React.FC<ProDashboardProps> = ({ 
    stats, 
    user, 
    todaysSchedules = [], 
    students = [],
    pendingAdjustment,
    monthChange = 12,
    onAction
}) => {
    const [attendanceModal, setAttendanceModal] = useState<{ isOpen: boolean; schedule: UnifiedSchedule | null }>({
        isOpen: false,
        schedule: null
    });

    const [reminders, setReminders] = useState<{id: string, text: string, done: boolean, studentId?: number, dueDate?: string}[]>(() => {
        try {
            const saved = localStorage.getItem('pro_reminders');
            return saved ? JSON.parse(saved) : [
                { id: '1', text: 'Enviar PDF de integrales a Lucas', done: false, dueDate: new Date().toISOString().split('T')[0] },
                { id: '2', text: 'Confirmar pago de Ana', done: false }
            ];
        } catch {
            return [];
        }
    });
    const [newReminder, setNewReminder] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('pro_reminders', JSON.stringify(reminders));
    }, [reminders]);

    const toggleReminder = (id: string) => {
        setReminders(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r));
    };

    const addReminder = () => {
        if (newReminder.trim()) {
            const r = { 
                id: Date.now().toString(), 
                text: newReminder.trim(), 
                done: false,
                studentId: selectedStudentId || undefined,
                dueDate: selectedDate || undefined
            };
            setReminders(prev => [r, ...prev]);
            setNewReminder('');
            setSelectedStudentId(null);
            setSelectedDate('');
        }
    };

    const handleReminderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            addReminder();
        }
    };

    const removeReminder = (id: string) => {
        setReminders(prev => prev.filter(r => r.id !== id));
    };



    const pendingStudents = students.filter(s => s.status === 'pending');
    const todayStr = new Date().toISOString().split('T')[0];
    const remindersDueToday = reminders.filter(r => !r.done && r.dueDate === todayStr);
    const totalPendingItems = pendingStudents.length + remindersDueToday.length;

    const generateWaLink = (student: Student) => {
        const msg = `Hola ${student.name}, te contacto de ${user.bizName || 'Cobralo'} por tu pago pendiente de ${user.currency || '$'}${student.amount}.`;
        return `https://wa.me/${student.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    };

    const hour = new Date().getHours();
    let greeting = 'Hola';
    let icon = '👋';
    if (hour < 12) {
        greeting = 'Buenos días';
        icon = '☕';
    } else if (hour < 20) {
        greeting = 'Buenas tardes';
        icon = '☀️';
    } else {
        greeting = 'Buenas noches';
        icon = '🌙';
    }

    const classesToday = todaysSchedules.length;
    const pendingAmount = Number(stats.pending || 0);
    
    let insight = 'Resumen de tu academia hoy';
    if (classesToday > 0 && pendingAmount > 0) {
        insight = `Hoy tenés ${classesToday} clase${classesToday !== 1 ? 's' : ''} y ${user?.currency || '$'}${pendingAmount.toLocaleString('es-AR')} por cobrar.`;
    } else if (classesToday > 0) {
        insight = `Hoy tenés ${classesToday} clase${classesToday !== 1 ? 's' : ''} programada${classesToday !== 1 ? 's' : ''}.`;
    } else if (pendingAmount > 0) {
        insight = `Sin clases hoy, pero tenés ${user?.currency || '$'}${pendingAmount.toLocaleString('es-AR')} pendientes de cobro.`;
    } else {
        insight = `Día libre. Todo al día y sin clases hoy.`;
    }

    const handleMarkAttendance = (schedule: any) => setAttendanceModal({ isOpen: true, schedule });

    const handleTogglePayment = async (student: Student) => {
        try {
            await api.togglePayment(student.id);
            if (student.status === 'pending') {
                const now = new Date();
                await api.createPayment({
                    studentId: student.id,
                    amount: Number(student.amount) || 0,
                    month: now.getMonth() + 1,
                    year: now.getFullYear()
                });
                showToast.success('Pago registrado');
            } else {
                showToast.success('Estado actualizado');
            }
            onAction?.();
        } catch {
            showToast.error('Error al actualizar pago');
        }
    };

    const avatarColors = ['bg-green-500', 'bg-amber-500', 'bg-blue-500', 'bg-violet-500', 'bg-pink-500'];

    return (
        <motion.div 
            variants={staggerContainerVariants}
            initial="initial"
            animate="animate"
            className="space-y-6 pb-24"
        >
            {/* IPC Notice Banner */}
            {pendingAdjustment && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${bentoBase} ${bentoGlass} p-5 flex flex-col md:flex-row items-center gap-5 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20`}
                >
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                        <Zap size={22} />
                    </div>
                    <div className="flex-1 space-y-0.5 text-center md:text-left">
                        <h3 className="text-sm font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight">Próximo Ajuste de Suscripción</h3>
                        <p className="text-xs font-bold text-amber-800/70 dark:text-amber-400/70">
                            Ajuste del {pendingAdjustment.percentage}% el {new Date(pendingAdjustment.effectiveDate).toLocaleDateString()}.
                        </p>
                    </div>
                    <Link to="/settings?tab=subscription" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition shadow-lg shadow-amber-500/20">
                        Gestionar Plan
                    </Link>
                </motion.div>
            )}

            {/* ── Header ── */}
            <motion.div variants={listItemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text-main tracking-tighter">
                        {greeting}, {user?.name?.split(' ')[0] || 'Profe'} {icon}
                    </h1>
                    <p className="text-xs font-bold text-text-muted mt-1">{insight}</p>
                </div>
                <Link 
                    to={pendingStudents.length > 0 ? "/app/students" : "#"} 
                    className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl transition-colors ${
                        totalPendingItems > 0 
                            ? 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20' 
                            : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${totalPendingItems > 0 ? 'bg-amber-500 animate-pulse' : 'bg-text-muted/50'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                        totalPendingItems > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-text-muted'
                    }`}>
                        {totalPendingItems} gestion{totalPendingItems !== 1 ? 'es' : ''} pendiente{totalPendingItems !== 1 ? 's' : ''}
                    </span>
                </Link>
            </motion.div>

            {/* ── Row 1: Main Stats ── */}
            <motion.div variants={listItemVariants} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 xl:gap-5">
                
                {/* Clases Hoy (Moved to top left) */}
                {(() => {
                    const totalClasses = todaysSchedules.length; // Today's classes
                    // Calculate total weekly hours from all schedules
                    const weeklyMinutes = todaysSchedules.reduce((acc: number, s: any) => {
                        if (s.startTime && s.endTime) {
                            const [sh, sm] = s.startTime.split(':').map(Number);
                            const [eh, em] = s.endTime.split(':').map(Number);
                            return acc + ((eh * 60 + em) - (sh * 60 + sm));
                        }
                        return acc;
                    }, 0);
                    const hours = Math.floor(weeklyMinutes / 60);
                    const mins = weeklyMinutes % 60;
                    return (
                        <div className={`${bentoBase} ${bentoGlass} p-4 lg:p-5 xl:p-7 flex flex-col justify-between`}>
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-black text-text-main uppercase tracking-widest">Clases Hoy</span>
                                    <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                        <CalendarDays size={14} className="text-violet-500" />
                                    </div>
                                </div>
                                <p className="text-3xl sm:text-4xl 2xl:text-5xl font-black text-text-main tracking-tighter">
                                    {totalClasses}
                                </p>
                                <p className="text-[10px] font-bold text-text-muted mt-1">
                                    {hours > 0 ? `${hours}h` : ''}{mins > 0 ? ` ${mins}min` : ''}{hours === 0 && mins === 0 ? 'Sin enseñar' : ' de enseñanza'}
                                </p>
                            </div>
                            <div className="mt-4 flex gap-1.5 align-end">
                                {todaysSchedules.slice(0, 6).map((_: any, i: number) => (
                                    <div key={i} className="flex-1 h-1.5 rounded-full bg-violet-500" style={{ opacity: 0.4 + (i * 0.1) }} />
                                ))}
                                {todaysSchedules.length === 0 && (
                                    <div className="flex-1 h-1.5 rounded-full bg-black/10 dark:bg-white/10" />
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Big card: Ingresos (Middle) */}
                <div className={`col-span-2 lg:col-span-2 ${bentoBase} ${bentoGlass} p-5 lg:p-6 xl:p-7 flex flex-col justify-between`}>
                    {/* Green glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 dark:bg-green-500/15 rounded-full blur-[60px] -translate-y-1/4 translate-x-1/4 pointer-events-none" />

                    <div className="flex items-center justify-between mb-6">
                        <span className="px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-[10px] font-black text-text-muted flex items-center gap-2 uppercase tracking-widest">
                            <TrendingUp size={11} className="text-primary-main" /> Mes actual
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg ${Number(monthChange) >= 0 ? 'text-primary-main bg-primary-main/10' : 'text-red-500 bg-red-500/10'}`}>
                            {Number(monthChange) > 0 ? '+' : ''}{monthChange}% vs mes pasado
                        </span>
                    </div>

                    <div>
                        <p className="text-3xl sm:text-4xl 2xl:text-5xl font-black text-text-main tracking-tighter">
                            <AnimatedCounter value={stats.paid} prefix={user?.currency || '$'} />
                        </p>
                        <p className="text-xs font-bold text-text-muted mt-2">
                            Ingresos cobrados.{' '}
                            <span className="text-amber-500 font-black">
                                {user?.currency || '$'}{Number(stats.pending).toLocaleString('es-AR')} pendientes.
                            </span>
                        </p>
                    </div>
                </div>

                {/* Small card: Alumnos (Moved to top right) */}
                <div className={`${bentoBase} ${bentoGlass} p-4 lg:p-5 xl:p-7 flex flex-col justify-between`}>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-text-main uppercase tracking-widest">Alumnos</span>
                        <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-text-muted">
                            <Users size={14} />
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl sm:text-4xl 2xl:text-5xl font-black text-text-main tracking-tighter">
                            <AnimatedCounter value={stats.totalStudents} />
                        </p>
                        <p className="text-[10px] font-bold text-text-muted mt-1">Activos</p>
                    </div>
                </div>
            </motion.div>

            {/* ── Row 2: Agenda + Recordatorios ── */}
            <motion.div variants={fadeInUpVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">

                {/* Agenda de hoy */}
                <div className={`${bentoBase} ${bentoGlass} p-6 md:p-7 pt-5 md:pt-6`}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                            Agenda de hoy
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                        </h3>
                        <div className="flex items-center gap-1.5">
                            {todaysSchedules.length > 0 && (
                                <button 
                                    onClick={() => setIsEmergencyModalOpen(true)}
                                    className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                >
                                    <AlertTriangle size={12} />
                                    Hoy no doy clases
                                </button>
                            )}
                            <Link to="/app/calendar" className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-text-muted hover:text-primary-main transition-colors">
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {todaysSchedules.length === 0 ? (
                            <EmptyState icon={Activity} title="Libre" description="Hoy no tenés clases agendadas." />
                        ) : (
                            todaysSchedules.slice(0, 5).map((schedule: any, i: number) => {
                                const studentList: Student[] = schedule.students || (schedule.student ? [schedule.student] : []);
                                const displayName = studentList.length > 1
                                    ? `${studentList[0]?.name?.split(' ')[0]} +${studentList.length - 1}`
                                    : (studentList[0]?.name || 'Clase Grupal');
                                const hasPending = studentList.some(s => s.status === 'pending');

                                return (
                                    <div key={schedule.id ?? i} className="flex items-center gap-3 group">
                                        <p className="text-[10px] font-black text-text-muted w-10 shrink-0 tabular-nums">{schedule.startTime}</p>
                                        <div className="flex-1 bg-black/5 dark:bg-white/[0.07] border border-black/8 dark:border-white/[0.08] rounded-2xl p-3 flex items-center justify-between hover:bg-black/10 dark:hover:bg-white/[0.12] transition-colors">
                                            <span className="text-[12px] font-bold text-text-main truncate max-w-[100px]">{displayName}</span>
                                            <div className="flex items-center gap-2">
                                                {/* Avatar stack */}
                                                <div className="flex -space-x-2">
                                                    {studentList.slice(0, 3).map((_, j) => (
                                                        <div key={j} className={`w-5 h-5 rounded-full ${avatarColors[j % avatarColors.length]} border-2 border-bg-app opacity-85`} />
                                                    ))}
                                                </div>
                                                {/* Quick actions on hover */}
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {hasPending && (
                                                        <button
                                                            onClick={() => handleTogglePayment(studentList.find(s => s.status === 'pending')!)}
                                                            className="p-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg transition"
                                                            title="Cobrar"
                                                        >
                                                            <DollarSign size={11} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleMarkAttendance(schedule)}
                                                        className="p-1.5 bg-violet-500/10 text-violet-500 hover:bg-violet-500 hover:text-white rounded-lg transition"
                                                        title="Asistencia"
                                                    >
                                                        <CheckCircle2 size={11} />
                                                    </button>
                                                    {studentList[0]?.phone && (
                                                        <a
                                                            href={generateWaLink(studentList[0])}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 bg-primary-main/10 text-primary-main hover:bg-primary-main hover:text-white rounded-lg transition"
                                                            title="WhatsApp"
                                                        >
                                                            <MessageCircle size={11} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Recordatorios */}
                <div className={`${bentoBase} ${bentoGlass} p-6 md:p-7 flex flex-col`}>
                    <h3 className="text-xs font-black text-text-main uppercase tracking-widest flex items-center justify-between mb-5">
                        <span className="flex items-center gap-2">
                            Recordatorios
                            {reminders.some(r => !r.done) && (
                                <span className="bg-primary-main text-white text-[9px] px-1.5 py-0.5 rounded-full">
                                    {reminders.filter(r => !r.done).length}
                                </span>
                            )}
                        </span>
                        <ListTodo size={14} className="text-text-muted" />
                    </h3>

                    {/* Input */}
                    <div className="space-y-2 mb-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Plus size={14} className="text-text-muted" />
                            </div>
                            <input 
                                type="text"
                                value={newReminder}
                                onChange={(e) => setNewReminder(e.target.value)}
                                onKeyDown={handleReminderKeyDown}
                                placeholder="Nueva tarea... (Enter para guardar)"
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-main/30 transition-all"
                            />
                        </div>
                        {newReminder.trim() && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 items-center">
                                {/* Alumno Selector (Custom Dropdown) */}
                                <div className="flex-1 relative group/select">
                                    <select 
                                        value={selectedStudentId || ''}
                                        onChange={(e) => setSelectedStudentId(e.target.value ? Number(e.target.value) : null)}
                                        className="appearance-none w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-[10px] font-black text-text-main outline-none focus:ring-2 focus:ring-primary-main/30 cursor-pointer pr-8 uppercase tracking-widest"
                                    >
                                        <option value="" className="bg-bg-app">Asociar Alumno...</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id} className="bg-bg-app">{s.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-muted">
                                        <Users size={12} />
                                    </div>
                                </div>

                                {/* Date styled */}
                                <div className="relative w-32 group/date">
                                    <input 
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="appearance-none w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-[10px] font-black text-text-main outline-none focus:ring-2 focus:ring-primary-main/30 cursor-pointer uppercase tracking-widest [color-scheme:dark]"
                                    />
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-muted">
                                        <CalendarDays size={12} />
                                    </div>
                                </div>

                                <button 
                                    onClick={addReminder}
                                    className="p-2 bg-primary-main text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary-main/20 flex items-center justify-center shrink-0"
                                >
                                    <Plus size={14} />
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto min-h-[150px] max-h-[300px] pr-2 space-y-2 pb-2">
                        <AnimatePresence>
                            {reminders.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="h-full flex flex-col items-center justify-center text-center text-text-muted py-6"
                                >
                                    <ListTodo size={24} className="mb-2 opacity-20" />
                                    <p className="text-[11px] font-bold">No hay recordatorios pendientes.</p>
                                </motion.div>
                            ) : (
                                reminders.map(reminder => {
                                    const student = students.find(s => s.id === reminder.studentId);
                                    const todayStr = new Date().toISOString().split('T')[0];
                                    const isToday = reminder.dueDate === todayStr;
                                    const isOverdue = reminder.dueDate && reminder.dueDate < todayStr && !reminder.done;

                                    return (
                                        <motion.div 
                                            key={reminder.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            className={`group flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                                reminder.done 
                                                    ? 'bg-transparent border-transparent opacity-50 grayscale' 
                                                    : 'bg-black/5 dark:bg-white/[0.07] border-black/8 dark:border-white/[0.08] hover:bg-black/10 dark:hover:bg-white/[0.12]'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3 overflow-hidden cursor-pointer flex-1" onClick={() => toggleReminder(reminder.id)}>
                                                <div className="mt-0.5 shrink-0">
                                                    {reminder.done ? (
                                                        <CheckCircle2 size={16} className="text-primary-main" />
                                                    ) : (
                                                        <div className={`w-4 h-4 rounded-full border-2 transition-colors ${isToday ? 'border-amber-500 animate-pulse' : isOverdue ? 'border-red-500' : 'border-text-muted/50 group-hover:border-primary-main'}`} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-bold truncate transition-all ${reminder.done ? 'text-text-muted line-through' : 'text-text-main'}`}>
                                                        {reminder.text}
                                                    </p>
                                                    {(student || reminder.dueDate) && (
                                                        <div className="flex gap-2 mt-1">
                                                            {student && (
                                                                <span className="text-[9px] font-black uppercase text-primary-main py-0.5 px-1.5 bg-primary-main/10 rounded-md">
                                                                    {student.name.split(' ')[0]}
                                                                </span>
                                                            )}
                                                            {reminder.dueDate && (
                                                                <span className={`text-[9px] font-black uppercase py-0.5 px-1.5 rounded-md ${isToday ? 'bg-amber-500/10 text-amber-500 animate-pulse' : isOverdue ? 'bg-red-500/10 text-red-500' : 'bg-black/10 dark:bg-white/10 text-text-muted'}`}>
                                                                    {isToday ? 'Hoy' : reminder.dueDate}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => removeReminder(reminder.id)}
                                                className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </motion.div>

            {/* ── Row 3: Quick Metrics ── */}
            <motion.div variants={fadeInUpVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 xl:gap-5">
                
                {/* Próximos Vencimientos */}
                {(() => {
                    const todayDate = new Date().getDate();
                    const upcomingStudents = students.filter(s => {
                        if (s.status === 'pending') return false; 
                        if (!s.due_day) return false;
                        let diff = s.due_day - todayDate;
                        if (diff < 0) diff += 30; // Handle wrapping approx
                        return diff > 0 && diff <= 5; // Due in next 5 days
                    }).sort((a, b) => {
                        let diffA = a.due_day - todayDate;
                        if (diffA < 0) diffA += 30;
                        let diffB = b.due_day - todayDate;
                        if (diffB < 0) diffB += 30;
                        return diffA - diffB;
                    });

                    return (
                        <div className={`lg:col-span-2 ${bentoBase} ${bentoGlass} p-6 md:p-7`}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-black text-text-main uppercase tracking-widest">Próximos Vencimientos</span>
                                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <Clock size={14} className="text-amber-500" />
                                </div>
                            </div>
                            {upcomingStudents.length === 0 ? (
                                <div className="py-6 flex flex-col items-center justify-center text-center">
                                    <p className="text-[13px] font-black text-text-main uppercase tracking-tight">Todo Tranquilo</p>
                                    <p className="text-[10px] font-bold text-text-muted mt-1">Nadie vence en los próximos 5 días.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                    {upcomingStudents.slice(0, 4).map(student => {
                                        let diff = student.due_day - todayDate;
                                        if (diff < 0) diff += 30;
                                        return (
                                            <div key={student.id} className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/[0.07] border border-black/8 dark:border-white/[0.08] hover:bg-black/10 dark:hover:bg-white/[0.12] transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-[11px] ring-1 ring-amber-300/30 dark:ring-amber-500/20 shrink-0">
                                                        {(student.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-text-main leading-none truncate max-w-[100px]">{student.name}</p>
                                                        <p className="text-[10px] font-bold text-text-muted mt-0.5 truncate max-w-[100px]">{student.service_name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg whitespace-nowrap">
                                                        En {diff} día{diff !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* Distribución por servicio */}
                {(() => {
                    const serviceMap = new Map<string, { count: number; amount: number }>();
                    students.forEach(s => {
                        const svc = s.service_name || 'Sin servicio';
                        const existing = serviceMap.get(svc) || { count: 0, amount: 0 };
                        serviceMap.set(svc, { count: existing.count + 1, amount: existing.amount + Number(s.amount || 0) });
                    });
                    const serviceColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];
                    const serviceData = Array.from(serviceMap.entries())
                        .sort((a, b) => b[1].count - a[1].count)
                        .slice(0, 5)
                        .map(([name, data], i) => ({ name, ...data, color: serviceColors[i % serviceColors.length] }));
                    
                    return (
                        <div className={`${bentoBase} ${bentoGlass} p-6 md:p-7`}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-black text-text-main uppercase tracking-widest">Por Servicio</span>
                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <BarChart3 size={14} className="text-blue-500" />
                                </div>
                            </div>
                            {serviceData.length === 0 ? (
                                <p className="text-sm text-text-muted font-bold">Sin datos</p>
                            ) : (
                                <div className="space-y-3 mt-2">
                                    {serviceData.map((svc, i) => {
                                        const maxCount = serviceData[0].count;
                                        const pct = maxCount > 0 ? (svc.count / maxCount) * 100 : 0;
                                        return (
                                            <div key={i}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[11px] font-bold text-text-main truncate max-w-[120px]">{svc.name}</span>
                                                    <span className="text-[10px] font-black text-text-muted">{svc.count} al.</span>
                                                </div>
                                                <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }} 
                                                        animate={{ width: `${pct}%` }} 
                                                        transition={{ duration: 0.8, delay: i * 0.1 }}
                                                        className="h-full rounded-full" 
                                                        style={{ backgroundColor: svc.color }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })()}
            </motion.div>



            <AttendanceBulkModal 
                isOpen={attendanceModal.isOpen}
                onClose={() => setAttendanceModal({ isOpen: false, schedule: null })}
                schedule={attendanceModal.schedule}
                onSuccess={() => onAction?.()}
            />

            <EmergencyNoticeModal 
                isOpen={isEmergencyModalOpen}
                onClose={() => setIsEmergencyModalOpen(false)}
                todaysSchedules={todaysSchedules}
                allStudents={students}
                isPro={user?.plan !== 'BÁSICO'}
                onSuccess={() => onAction?.()}
            />
        </motion.div>
    );
};

export default ProDashboard;
