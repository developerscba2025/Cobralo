import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, TrendingUp, Users, DollarSign, Zap, Activity, CheckCircle2, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, type Student, type UnifiedSchedule } from '../services/api';
import EmptyState from '../components/EmptyState';
import { showToast } from '../components/Toast';
import { fadeInUpVariants, staggerContainerVariants, listItemVariants } from '../utils/motion';
import AttendanceBulkModal from '../components/AttendanceBulkModal';
import AnimatedCounter from '../components/AnimatedCounter';
import EmergencyNoticeModal from '../components/EmergencyNoticeModal';
import { AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import TiltCard from '../components/TiltCard';

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

import DashboardReminders from '../components/dashboard/DashboardReminders';
import DashboardMetrics from '../components/dashboard/DashboardMetrics';

const ProDashboard: React.FC<ProDashboardProps> = ({ 
    stats, 
    user, 
    todaysSchedules = [], 
    students = [],
    chartData,
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
            return saved ? JSON.parse(saved) : [];
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
    let greeting = 'HOLA';
    let icon = '👋';
    if (hour >= 20 || hour < 5) {
        greeting = 'BUENAS NOCHES';
        icon = '🌙';
    } else if (hour >= 5 && hour < 12) {
        greeting = 'BUEN DÍA';
        icon = '🌅';
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
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10B981', '#34D399', '#059669', '#F59E0B'],
                    zIndex: 9999
                });
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
            className="space-y-4 md:space-y-6 pb-12 lg:pb-0"
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
                    <Link to="/app/settings?tab=subscription" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition shadow-lg shadow-amber-500/20">
                        Gestionar Plan
                    </Link>
                </motion.div>
            )}

            {/* ── Header ── */}
            <motion.div variants={listItemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="w-full sm:w-auto space-y-2">
                    <h1 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter uppercase italic">
                        {greeting}, {user?.name?.split(' ')[0].toUpperCase() || 'USUARIO'}{' '}
                        <span className={icon === '👋' ? 'animate-bounce inline-block' : ''} style={icon === '👋' ? { animationDuration: '3s' } : {}}>{icon}</span>
                    </h1>
                    <p className="text-sm font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">{insight}</p>
                </div>
                <Link 
                    to={pendingStudents.length > 0 ? "/app/payments?tab=pending" : "#"} 
                    className={`whitespace-nowrap flex items-center gap-2 px-3 py-1.5 border rounded-xl transition-colors ${
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
            <motion.div variants={listItemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 xl:gap-5">
                
                {/* 1. Big card: Ingresos (PRIORITY) */}
                <TiltCard intensity={3} className="col-span-2 lg:col-span-2">
                    <div className={`h-full ${bentoBase} ${bentoGlass} p-5 lg:p-7 flex flex-col justify-between order-first lg:order-none`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-main/5 dark:bg-primary-main/10 rounded-full blur-[60px] -translate-y-1/4 translate-x-1/4 pointer-events-none" />

                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <span className="px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-[10px] font-black text-text-muted flex items-center gap-2 uppercase tracking-widest">
                                <TrendingUp size={11} className="text-primary-main" /> Mes actual
                            </span>
                            <span className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg ${Number(monthChange) >= 0 ? 'text-primary-main bg-primary-main/10' : 'text-red-500 bg-red-500/10'}`}>
                                {Number(monthChange) > 0 ? '+' : ''}{monthChange}% vs mes pasado
                            </span>
                        </div>

                        <div>
                            <p className="text-2xl sm:text-3xl 2xl:text-5xl font-black text-text-main tracking-tighter">
                                <AnimatedCounter value={stats.paid} prefix={user?.currency || '$'} />
                            </p>
                            <p className="text-[10px] sm:text-xs font-bold text-text-muted mt-1">
                                Cobrados.{' '}
                                <span className="text-amber-500 font-black">
                                    {user?.currency || '$'}{Number(stats.pending).toLocaleString('es-AR')} pendientes.
                                </span>
                            </p>
                        </div>
                    </div>
                </TiltCard>

                {/* 2. Clases Hoy */}
                {(() => {
                    const totalClasses = todaysSchedules.length;
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
                        <TiltCard intensity={5}>
                            <div className={`h-full ${bentoBase} ${bentoGlass} p-5 lg:p-7 flex flex-col justify-between`}>
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] sm:text-xs font-black text-text-main uppercase tracking-widest leading-none">Clases Hoy</span>
                                        <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                            <CalendarDays size={14} className="text-violet-500" />
                                        </div>
                                    </div>
                                    <p className="text-2xl sm:text-4xl font-black text-text-main tracking-tighter">
                                        {totalClasses}
                                    </p>
                                    <p className="text-[10px] font-bold text-text-muted mt-1">
                                        {hours > 0 ? `${hours}h` : ''}{mins > 0 ? ` ${mins}min` : ''}{hours === 0 && mins === 0 ? 'Libre' : ' de enseñanza'}
                                    </p>
                                </div>
                            </div>
                        </TiltCard>
                    );
                })()}

                {/* 3. Alumnos */}
                <TiltCard intensity={5}>
                    <div className={`h-full ${bentoBase} ${bentoGlass} p-5 lg:p-7 flex flex-col justify-between`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] sm:text-xs font-black text-text-main uppercase tracking-widest leading-none">Alumnos</span>
                            <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-text-muted">
                                <Users size={14} />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl sm:text-4xl font-black text-text-main tracking-tighter">
                                <AnimatedCounter value={stats.totalStudents} />
                            </p>
                            <p className="text-[10px] font-bold text-text-muted mt-1">Activos</p>
                        </div>
                    </div>
                </TiltCard>
            </motion.div>

            {/* ── Row 2: Agenda + Recordatorios ── */}
            <motion.div variants={fadeInUpVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">

                {/* Agenda de hoy */}
                <div className={`${bentoBase} ${bentoGlass} p-5 md:p-7 pt-5 md:pt-6`}>
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
                                    <AlertTriangle size={12} /> Hoy no doy clases
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
                                        <div className="flex-1 bg-black/5 dark:bg-white/[0.07] border border-black/8 dark:border-white/[0.08] rounded-2xl p-2.5 sm:p-3 flex items-center justify-between hover:bg-black/10 dark:hover:bg-white/[0.12] transition-colors">
                                            <span className="text-[12px] font-bold text-text-main truncate max-w-[150px] sm:max-w-none">{displayName}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    {studentList.slice(0, 3).map((_, j) => (
                                                        <div key={j} className={`w-5 h-5 rounded-full ${avatarColors[j % avatarColors.length]} border-2 border-bg-app opacity-85`} />
                                                    ))}
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {hasPending && (
                                                        <button
                                                            onClick={() => handleTogglePayment(studentList.find(s => s.status === 'pending')!)}
                                                            className="p-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg transition"
                                                        >
                                                            <DollarSign size={11} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleMarkAttendance(schedule)}
                                                        className="p-1.5 bg-violet-500/10 text-violet-500 hover:bg-violet-500 hover:text-white rounded-lg transition"
                                                    >
                                                        <CheckCircle2 size={11} />
                                                    </button>
                                                    {studentList[0]?.phone && (
                                                        <a
                                                            href={generateWaLink(studentList[0])}
                                                            target="_blank" rel="noreferrer"
                                                            className="p-1.5 bg-primary-main/10 text-primary-main hover:bg-primary-main hover:text-white rounded-lg transition"
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

                <DashboardReminders 
                    reminders={reminders}
                    students={students}
                    newReminder={newReminder}
                    setNewReminder={setNewReminder}
                    selectedStudentId={selectedStudentId}
                    setSelectedStudentId={setSelectedStudentId}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    onAdd={addReminder}
                    onToggle={toggleReminder}
                    onRemove={removeReminder}
                />
            </motion.div>

            {/* ── Row 3: Insights ── */}
            <motion.div variants={fadeInUpVariants} className="space-y-4 md:space-y-6">
                {/* ── Resumen Anual (Chart) ── */}
                <div className={`${bentoBase} ${bentoGlass} p-4 sm:p-5 lg:p-7`}>
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                        <h3 className="text-[10px] md:text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2 leading-none">
                            Resumen de Ingresos
                        </h3>
                    </div>
                    {chartData && chartData.length > 0 ? (
                        <div className="h-48 sm:h-64 w-full relative">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 9, fill: '#888' }} 
                                        dy={10} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 9, fill: '#888' }} 
                                        tickFormatter={(value) => `$${value}`} 
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                        labelStyle={{ color: '#888', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="ingresos" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-32 flex flex-col items-center justify-center text-center px-4">
                            <TrendingUp className="w-8 h-8 text-text-muted opacity-10 mb-2" />
                            <p className="text-[11px] font-black text-text-muted uppercase tracking-widest opacity-60">
                                Tus ingresos se verán reflejados aquí ✨
                            </p>
                        </div>
                    )}
                </div>
                
                <DashboardMetrics students={students} currency={user?.currency} />
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
