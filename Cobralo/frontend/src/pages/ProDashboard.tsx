import React from 'react';
import { motion } from 'framer-motion';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { ArrowRight, MessageCircle, TrendingUp, Users, DollarSign, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Student } from '../services/api';

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
}

const ProDashboard: React.FC<ProDashboardProps> = ({ 
    stats, 
    user, 
    chartData = [], 
    todaysSchedules = [], 
    students = [],
    pendingAdjustment
}) => {
    const pendingStudents = students.filter(s => s.status === 'pending');

    const generateWaLink = (student: Student) => {
        const message = `Hola ${student.name}, te contacto de ${user.bizName || 'Cobralo'} por tu pago pendiente de ${user.currency || '$'}${student.amount}.`;
        return `https://wa.me/${student.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="space-y-8 pb-20">
            {/* IPC Notice Banner */}
            {pendingAdjustment && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-[32px] flex flex-col md:flex-row items-center gap-6 shadow-sm"
                >
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                        <Zap size={24} />
                    </div>
                    <div className="flex-1 space-y-1 text-center md:text-left">
                        <h3 className="text-sm font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight">Pr\u00f3ximo Ajuste de Suscripci\u00f3n</h3>
                        <p className="text-xs font-bold text-amber-800/70 dark:text-amber-400/70 leading-relaxed">
                            Debido a la inflaci\u00f3n (IPC), tu plan se ajustar\u00e1 un **{pendingAdjustment.percentage}%** el {new Date(pendingAdjustment.effectiveDate).toLocaleDateString()}.
                        </p>
                    </div>
                    <Link 
                        to="/settings?tab=subscription"
                        className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20"
                    >
                        Gestionar Plan
                    </Link>
                </motion.div>
            )}

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-premium p-6 md:p-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <p className="label-premium">Ingresos Mes</p>
                        <TrendingUp size={16} className="text-primary-main" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary-main dark:text-primary-main">
                        {user?.currency || '$'}{stats.paid.toLocaleString('es-AR')}
                    </h2>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card-premium p-6 md:p-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <p className="label-premium">Pagos Pendientes</p>
                        <DollarSign size={16} className="text-amber-500" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-text-main">
                        {user?.currency || '$'}{stats.pending.toLocaleString('es-AR')}
                    </h2>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card-premium p-6 md:p-8 sm:col-span-2 lg:col-span-1"
                >
                    <div className="flex items-center justify-between mb-4">
                        <p className="label-premium">Total Alumnos</p>
                        <Users size={16} className="text-primary-main" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-text-main">
                        {stats.totalStudents}
                    </h2>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-premium p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-text-main tracking-tight uppercase">Flujo de Ingresos</h3>
                            <p className="label-premium mt-1 !tracking-widest">Últimos 30 días</p>
                        </div>
                    </div>
                    <div className="h-60 md:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" vertical={false} opacity={0.1} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="currentColor" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{ fontWeight: 900, opacity: 0.5 }}
                                />
                                <YAxis 
                                    stroke="currentColor" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={(v) => `${user?.currency || '$'}${v}`}
                                    tick={{ fontWeight: 900, opacity: 0.5 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border-main)',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                                        color: 'var(--text-main)',
                                        padding: '12px'
                                    }}
                                    cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '5 5' }}
                                    labelStyle={{ fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}
                                    itemStyle={{ fontWeight: 900, fontSize: '12px', color: 'var(--primary)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="ingresos"
                                    stroke="var(--primary)"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorIngresos)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card-premium p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-text-main tracking-tight uppercase">Volumen de Pagos</h3>
                            <p className="label-premium mt-1 !tracking-widest">Tráfico del mes</p>
                        </div>
                    </div>
                    <div className="h-60 md:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" vertical={false} opacity={0.1} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="currentColor" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fontWeight: 900, opacity: 0.5 }}
                                />
                                <YAxis 
                                    stroke="currentColor" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fontWeight: 900, opacity: 0.5 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border-main)',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                                        color: 'var(--text-main)',
                                        padding: '12px'
                                    }}
                                    labelStyle={{ fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}
                                    itemStyle={{ fontWeight: 900, fontSize: '12px', color: 'var(--primary)' }}
                                />
                                <Bar dataKey="pagos" fill="#22c55e" opacity={0.8} radius={[8, 8, 0, 0]}>
                                    {chartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#4ade80' : '#22c55e'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Schedule & Pending Students */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card-premium p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-text-main tracking-tight uppercase">Agenda de Hoy</h3>
                        <Link to="/app/calendar" className="text-primary-main bg-primary-main/5 dark:bg-primary-main/10 px-4 py-2 rounded-xl label-premium !tracking-widest hover:bg-primary-main/10 transition">
                            Calendario
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {todaysSchedules.length === 0 ? (
                            <div className="text-center py-12 text-zinc-400 font-bold bg-bg-dark rounded-2xl border border-dashed border-border-emerald">
                                <p className="uppercase tracking-widest text-[10px]">No hay clases para hoy.</p>
                            </div>
                        ) : (
                            todaysSchedules.map((schedule: any) => (
                                <div key={schedule.id} className="flex items-center gap-4 p-4 card-sub border-l-4 border-primary-main group hover:translate-x-1 transition-all">
                                    <div className="font-black text-text-muted w-16 text-center text-xs">{schedule.startTime}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-text-main truncate">{schedule.student?.name}</p>
                                        <p className="label-premium !tracking-widest">{schedule.student?.service_name}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 card-premium p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-text-main tracking-tight uppercase">Cobros Pendientes</h3>
                        <Link to="/app/students" className="text-text-muted hover:text-primary-main label-premium !tracking-widest flex items-center gap-2 transition-colors">
                            Ver todos <ArrowRight size={14} />
                        </Link>
                    </div>
                    
                    <div className="hidden md:block overflow-hidden rounded-2xl border border-border-emerald/20">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-bg-app border-b border-border-emerald">
                                    <tr>
                                        <th className="p-4 label-premium">Alumno</th>
                                        <th className="p-4 label-premium">Servicio</th>
                                        <th className="p-4 label-premium">Monto</th>
                                        <th className="p-4 label-premium text-right pr-4">WhatsApp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-10 text-center text-zinc-400">
                                                Todo al día.
                                            </td>
                                        </tr>
                                    ) : (
                                        pendingStudents.map(student => (
                                            <tr key={student.id} className="border-b border-border-emerald/40 hover:bg-bg-app transition transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center font-black text-amber-600 text-[10px] uppercase">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <span className="font-bold text-text-main leading-tight">{student.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm font-semibold text-text-muted">{student.service_name}</span>
                                                </td>
                                                <td className="p-4 font-black text-text-main">
                                                    {user?.currency || '$'}{Number(student.amount).toLocaleString('es-AR')}
                                                </td>
                                                <td className="p-4 text-right pr-4">
                                                    {student.phone && (
                                                        <a href={generateWaLink(student)} target="_blank" rel="noreferrer" className="inline-flex p-2 bg-primary-main text-white rounded-lg hover:bg-green-600 transition shadow-sm active:scale-95">
                                                            <MessageCircle size={16} />
                                                        </a>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card List for Pending Payments */}
                    <div className="md:hidden space-y-3">
                        {pendingStudents.length === 0 ? (
                            <div className="text-center py-10 text-zinc-400 text-sm italic bg-bg-app rounded-2xl border border-dashed border-border-emerald/40">
                                Todo al día.
                            </div>
                        ) : (
                            pendingStudents.map(student => (
                                <div key={student.id} className="p-4 bg-bg-app rounded-2xl border border-border-emerald/20 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center font-black text-amber-600 flex-shrink-0 animate-pulse">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-text-main text-sm truncate">{student.name}</p>
                                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{student.service_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-black text-text-main text-sm whitespace-nowrap">{user?.currency || '$'}{Number(student.amount).toLocaleString('es-AR')}</p>
                                        {student.phone && (
                                            <a href={generateWaLink(student)} target="_blank" rel="noreferrer" className="p-3 bg-primary-main text-white rounded-xl shadow-lg shadow-primary-glow flex items-center justify-center">
                                                <MessageCircle size={18} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProDashboard;
