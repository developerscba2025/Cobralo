import React from 'react';
import { motion } from 'framer-motion';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { ArrowRight, MessageCircle, TrendingUp, Users, DollarSign } from 'lucide-react';
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
}

const ProDashboard: React.FC<ProDashboardProps> = ({ 
    stats, 
    user, 
    chartData = [], 
    todaysSchedules = [], 
    students = [] 
}) => {
    const pendingStudents = students.filter(s => s.status === 'pending');

    const generateWaLink = (student: Student) => {
        const message = `Hola ${student.name}, te contacto de ${user.bizName || 'Cobralo'} por tu pago pendiente de ${user.currency || '$'}${student.amount}.`;
        return `https://wa.me/${student.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-premium p-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <p className="label-premium">Ingresos Mes</p>
                        <TrendingUp size={16} className="text-primary-main" />
                    </div>
                    <h2 className="text-4xl font-black text-primary-main dark:text-primary-main">
                        {user?.currency || '$'}{stats.paid.toLocaleString('es-AR')}
                    </h2>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card-premium p-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <p className="label-premium">Pagos Pendientes</p>
                        <DollarSign size={16} className="text-amber-500" />
                    </div>
                    <h2 className="text-4xl font-black text-zinc-900 dark:text-white">
                        {user?.currency || '$'}{stats.pending.toLocaleString('es-AR')}
                    </h2>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card-premium p-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <p className="label-premium">Total Alumnos</p>
                        <Users size={16} className="text-primary-main" />
                    </div>
                    <h2 className="text-4xl font-black text-zinc-900 dark:text-white">
                        {stats.totalStudents}
                    </h2>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-premium p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight uppercase">Flujo de Ingresos</h3>
                            <p className="label-premium mt-1 !tracking-widest">Últimos 30 días</p>
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" vertical={false} opacity={0.3} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#52525b" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{ fontWeight: 900 }}
                                />
                                <YAxis 
                                    stroke="#52525b" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={(v) => `${user?.currency || '$'}${v}`}
                                    tick={{ fontWeight: 900 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#050805',
                                        border: '1px solid rgba(34, 197, 94, 0.2)',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                        color: '#fff',
                                        padding: '12px'
                                    }}
                                    cursor={{ stroke: '#22c55e', strokeWidth: 1, strokeDasharray: '5 5' }}
                                    labelStyle={{ fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}
                                    itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="ingresos"
                                    stroke="#22c55e"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorIngresos)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card-premium p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight uppercase">Volumen de Pagos</h3>
                            <p className="label-premium mt-1 !tracking-widest">Tráfico del mes</p>
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" vertical={false} opacity={0.3} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#52525b" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fontWeight: 900 }}
                                />
                                <YAxis 
                                    stroke="#52525b" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fontWeight: 900 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#050805',
                                        border: '1px solid rgba(34, 197, 94, 0.2)',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                        color: '#fff',
                                        padding: '12px'
                                    }}
                                    labelStyle={{ fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}
                                    itemStyle={{ fontWeight: 900, fontSize: '12px' }}
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
                <div className="card-premium p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight uppercase">Agenda de Hoy</h3>
                        <Link to="/calendar" className="text-primary-main bg-primary-main/5 dark:bg-primary-main/10 px-4 py-2 rounded-xl label-premium !tracking-widest hover:bg-primary-main/10 transition">
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
                                    <div className="font-black text-zinc-400 dark:text-zinc-500 w-16 text-center text-xs">{schedule.startTime}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-zinc-900 dark:text-white truncate">{schedule.student?.name}</p>
                                        <p className="label-premium !tracking-widest">{schedule.student?.service_name}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 card-premium p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight uppercase">Cobros Pendientes</h3>
                        <Link to="/students" className="text-zinc-400 hover:text-primary-main label-premium !tracking-widest flex items-center gap-2 transition-colors">
                            Ver todos <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pendingStudents.length === 0 ? (
                            <div className="col-span-2 text-center py-12 text-zinc-400 font-bold bg-bg-dark rounded-2xl border border-dashed border-border-emerald">
                                <p className="uppercase tracking-widest text-[10px]">Todo al día.</p>
                            </div>
                        ) : (
                            pendingStudents.map(student => (
                                <div key={student.id} className="flex items-center justify-between p-5 card-sub hover:border-amber-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center font-black text-amber-600 shadow-sm uppercase">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-zinc-900 dark:text-white truncate leading-tight">{student.name}</p>
                                            <p className="label-premium mt-0.5 !tracking-widest">{student.service_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-black text-zinc-900 dark:text-white text-sm">
                                            {user?.currency || '$'}{Number(student.amount).toLocaleString('es-AR')}
                                        </span>
                                        {student.phone && (
                                            <a href={generateWaLink(student)} target="_blank" rel="noreferrer" className="p-3 bg-primary-main text-white rounded-xl hover:bg-green-600 transition shadow-lg shadow-primary-glow active:scale-95">
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
