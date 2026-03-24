import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, DollarSign, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PaymentStats, Student } from '../services/api';

interface ProDashboardProps {
    stats: {
        paid: number;
        pending: number;
        totalStudents: number;
    };
    paymentStats: PaymentStats | null;
    students: Student[];
    todaysSchedules: any[];
    user: any;
    monthChange: string | number;
    chartData: any[];
    generateWaLink: (student: Student) => string;
}

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const ProDashboard: React.FC<ProDashboardProps> = ({ 
    stats, paymentStats, students, todaysSchedules, user, monthChange, chartData, generateWaLink 
}) => {
    const pendingStudents = students.filter(s => s.status === 'pending').slice(0, 10);

    return (
        <>
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Panel de Control</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium capitalize">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 transition hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-500/10 flex items-center justify-center">
                            <DollarSign className="text-teal-500" size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-teal-500 bg-teal-50 dark:bg-teal-500/10 px-2 py-1 rounded-full">
                            <TrendingUp size={14} /> +{monthChange}%
                        </span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ingresos Mes</p>
                    <h2 className="text-3xl font-black text-teal-500">{user?.currency || '$'}{stats.paid.toLocaleString('es-AR')}</h2>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 transition hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/10 flex items-center justify-center">
                            <Users className="text-amber-500" size={28} />
                        </div>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Alumnos</p>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white">{stats.totalStudents}</h2>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Ingresos Mensuales</h3>
                            <p className="text-sm text-slate-400">Comparativa con mes anterior</p>
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${user?.currency || '$'}${v}`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                                    }}
                                    cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '5 5' }}
                                    labelStyle={{ color: '#94a3b8' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="ingresos"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIngresos)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Cantidad de Pagos</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                                    }}
                                    labelStyle={{ color: '#94a3b8' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="pagos" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Today's Schedule & Pending Students */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 font-medium">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Clases de Hoy</h3>
                        <Link to="/calendar" className="text-green-700 hover:text-green-800 font-bold text-xs bg-green-50 dark:bg-green-600/10 px-3 py-1.5 rounded-full transition">
                            Ver Calendario
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {todaysSchedules.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <p>No tienes clases programadas para hoy.</p>
                            </div>
                        ) : (
                            todaysSchedules.map((schedule: any) => (
                                <div key={schedule.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-l-4 border-green-600">
                                    <div className="font-bold text-slate-700 dark:text-slate-300 w-16 text-center">{schedule.startTime}</div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{schedule.student?.name}</p>
                                        <p className="text-xs text-slate-500 uppercase font-bold">{schedule.student?.service_name}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Pagos Pendientes</h3>
                        <Link to="/students" className="text-green-700 hover:text-green-800 font-medium flex items-center gap-1 text-sm">
                            Ver todos <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {pendingStudents.map(student => (
                            <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center font-bold text-amber-600">{student.name.charAt(0)}</div>
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-white">{student.name}</p>
                                        <p className="text-xs text-slate-500">{student.service_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-amber-500">{user?.currency || '$'}{Number(student.amount).toLocaleString('es-AR')}</span>
                                    {student.phone && (
                                        <a href={generateWaLink(student)} target="_blank" className="p-2 bg-green-100 text-green-700 dark:bg-green-600/10 dark:text-green-400 rounded-full hover:bg-green-200 transition">
                                            <MessageCircle size={18} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProDashboard;
