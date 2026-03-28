import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
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
    // Recent activity
    const recentActivity = [...students].sort((a, b) => (Number(b.id) - Number(a.id))).slice(0, 15);

    return (
        <div className="space-y-8 pb-20 bg-transparent">
            {/* Header / Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-premium p-8"
                >
                    <p className="label-premium mb-4">Ingresos Mes</p>
                    <h2 className="text-4xl font-black text-primary-main">
                        {user?.currency || '$'}{stats.paid.toLocaleString('es-AR')}
                    </h2>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card-premium p-8"
                >
                    <p className="label-premium mb-4">Alumnos Activos</p>
                    <h2 className="text-4xl font-black text-zinc-900 dark:text-white">
                        {stats.totalStudents}
                    </h2>
                </motion.div>
            </div>

            {/* List Section */}
            <div className="space-y-4">
                <h3 className="label-premium mb-6 ml-2 uppercase">Actividad Reciente</h3>
                
                <div className="space-y-3">
                    {recentActivity.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-50 dark:bg-bg-soft rounded-[32px] text-zinc-400 border border-dashed border-zinc-100 dark:border-border-emerald font-medium">
                            No hay actividad de cobros reciente.
                        </div>
                    ) : (
                        recentActivity.map((student, index) => (
                            <motion.div
                                key={student.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="flex items-center justify-between p-6 bg-white dark:bg-bg-soft hover:bg-emerald-50 dark:hover:bg-bg-dark rounded-2xl border border-emerald-50 dark:border-border-emerald shadow-sm transition-all group"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-zinc-50 dark:bg-bg-dark rounded-xl flex items-center justify-center text-sm font-black text-zinc-400 dark:text-emerald-500/60 group-hover:text-primary-main transition-colors border border-zinc-100 dark:border-border-emerald uppercase group-hover:bg-primary-main/5">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white/90">{student.name}</h3>
                                        <p className="label-premium !tracking-widest">{student.service_name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10">
                                    <div className="text-right hidden sm:block">
                                        <p className="font-black text-lg text-zinc-900 dark:text-white">
                                            {user?.currency || '$'}{Number(student.amount).toLocaleString('es-AR')}
                                        </p>
                                    </div>
                                    <div className="w-24 text-right">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border
                                            ${student.status === 'paid' 
                                                ? 'text-primary-main border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-600/10 dark:border-emerald-900/50' 
                                                : 'text-amber-700 border-amber-200 bg-amber-50 dark:text-amber-400 dark:bg-amber-600/10 dark:border-amber-900/50'}`}
                                        >
                                            {student.status === 'paid' ? 'Cobrado' : 'Pendiente'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Premium CTA (Much more subtle) */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-16 flex items-center justify-center"
            >
                <a 
                    href="/settings?tab=subscription" 
                    className="flex items-center gap-3 px-6 py-3 rounded-full border border-zinc-100 dark:border-border-emerald text-zinc-400 dark:text-emerald-500/60 text-[10px] font-black uppercase tracking-widest hover:border-primary-main hover:text-primary-main transition-all font-accent bg-white dark:bg-bg-soft shadow-sm"
                >
                    <Zap size={14} className="fill-primary-main text-primary-main" />
                    Obtené todas las funciones estadísticas con Cobralo PRO
                </a>
            </motion.div>
        </div>
    );
};

export default FreeDashboard;
