import React from 'react';
import { motion } from 'framer-motion';
import { User, TrendingUp, Users, DollarSign, Wallet } from 'lucide-react';
import type { Student, PaymentStats } from '../services/api';

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
    const pendingStudents = students.filter(s => s.status === 'pending').slice(0, 10);
    const paidStudents = students.filter(s => s.status === 'paid').slice(0, 5);
    
    // Combine for a "recent activity" feel like in the image
    const recentActivity = [...students].sort((a, b) => (b.id - a.id)).slice(0, 15);

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8 -m-6 md:-m-10">
            {/* Header / Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#141414] p-8 rounded-[32px] border border-white/5"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Ingresos Mes</p>
                    <h2 className="text-4xl font-black text-[#22C55E]">
                        {user?.currency || '$'}{stats.paid.toLocaleString('es-AR')}
                    </h2>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#141414] p-8 rounded-[32px] border border-white/5"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Ganancia Neta</p>
                    <h2 className="text-4xl font-black text-white">
                        {user?.currency || '$'}{stats.paid.toLocaleString('es-AR')}
                    </h2>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#141414] p-8 rounded-[32px] border border-white/5"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Alumnos</p>
                    <h2 className="text-4xl font-black text-white">
                        {stats.totalStudents}
                    </h2>
                </motion.div>
            </div>

            {/* List Section */}
            <div className="space-y-4">
                {recentActivity.map((student, index) => (
                    <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-6 bg-[#141414]/40 hover:bg-[#141414] rounded-2xl border border-transparent hover:border-white/5 transition-all group"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-sm font-black text-white/60 group-hover:text-[#22C55E] transition-colors border border-white/5">
                                {student.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white/90">{student.name}</h3>
                                <p className="text-xs font-medium text-white/30 uppercase tracking-widest">{student.service_name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-12">
                            <div className="text-right">
                                <p className="font-black text-lg text-white">
                                    {user?.currency || '$'}{Number(student.amount).toLocaleString('es-AR')}
                                </p>
                            </div>
                            <div className="w-24 text-right">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border
                                    ${student.status === 'paid' 
                                        ? 'text-[#22C55E] border-[#22C55E]/20 bg-[#22C55E]/5' 
                                        : 'text-[#EAB308] border-[#EAB308]/20 bg-[#EAB308]/5'}`}
                                >
                                    {student.status === 'paid' ? 'Cobrado' : 'Pendiente'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Premium CTA */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 p-8 bg-gradient-to-r from-green-600/10 to-transparent rounded-[40px] border border-green-600/20 flex flex-col md:flex-row items-center justify-between gap-6"
            >
                <div>
                    <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Potenciá tu negocio con Cobralo PRO</h3>
                    <p className="text-white/40 text-sm font-medium">Recordatorios automáticos, gestión de cobros masiva y estadísticas avanzadas.</p>
                </div>
                <a href="/settings?tab=subscription" className="bg-white text-black px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-xl shadow-green-600/10">
                    Saber Más ✨
                </a>
            </motion.div>
        </div>
    );
};

export default FreeDashboard;
