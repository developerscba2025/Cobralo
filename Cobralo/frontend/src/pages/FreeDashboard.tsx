import React from 'react';
import { motion } from 'framer-motion';
import type { Student } from '../services/api';

interface FreeDashboardProps {
    stats: {
        paid: number;
        pending: number;
        totalStudents: number;
    };
    students: Student[];
    user: any;
}

const FreeDashboard: React.FC<FreeDashboardProps> = ({ stats, students, user }) => {
    // Combine for a "recent activity" feel
    const recentActivity = [...students].sort((a, b) => (Number(b.id) - Number(a.id))).slice(0, 15);

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header / Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Ingresos Mes</p>
                    <h2 className="text-4xl font-black text-green-600">
                        {user?.currency || '$'}{stats.paid.toLocaleString('es-AR')}
                    </h2>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Ganancia Neta</p>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white">
                        {user?.currency || '$'}{stats.paid.toLocaleString('es-AR')}
                    </h2>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Alumnos</p>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white">
                        {stats.totalStudents}
                    </h2>
                </motion.div>
            </div>

            {/* List Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Actividad Reciente</h3>
                {recentActivity.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-700">
                        No hay actividad reciente.
                    </div>
                ) : (
                    recentActivity.map((student, index) => (
                        <motion.div
                            key={student.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-sm font-black text-slate-400 group-hover:text-green-600 transition-colors border border-slate-100 dark:border-slate-800">
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white/90">{student.name}</h3>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{student.service_name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="text-right">
                                    <p className="font-black text-lg text-slate-900 dark:text-white">
                                        {user?.currency || '$'}{Number(student.amount).toLocaleString('es-AR')}
                                    </p>
                                </div>
                                <div className="w-24 text-right">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border
                                        ${student.status === 'paid' 
                                            ? 'text-green-600 border-green-200 bg-green-50 dark:bg-green-600/10 dark:border-green-900/50' 
                                            : 'text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-600/10 dark:border-amber-900/50'}`}
                                    >
                                        {student.status === 'paid' ? 'Cobrado' : 'Pendiente'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Premium CTA */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 p-8 bg-gradient-to-r from-green-600/10 to-transparent rounded-[40px] border border-green-600/20 flex flex-col md:flex-row items-center justify-between gap-6"
            >
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Potenciá tu negocio con Cobralo PRO</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Recordatorios automáticos, gestión de cobros masiva y estadísticas avanzadas.</p>
                </div>
                <a href="/settings?tab=subscription" className="bg-green-700 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-800 transition-all shadow-xl shadow-green-200 dark:shadow-none">
                    Saber Más ✨
                </a>
            </motion.div>
        </div>
    );
};

export default FreeDashboard;
