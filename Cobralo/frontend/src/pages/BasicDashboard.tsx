import { motion } from 'framer-motion';
import { Zap, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Student } from '../services/api';
import EmptyState from '../components/EmptyState';

interface BasicDashboardProps {
    stats: {
        paid: number;
        pending: number;
        totalStudents: number;
    };
    students: Student[];
    user: any;
    pendingAdjustment?: any;
}

const BasicDashboard: React.FC<BasicDashboardProps> = ({ stats, students, user, pendingAdjustment }) => {
    // Recent activity
    const recentActivity = [...students].sort((a, b) => (Number(b.id) - Number(a.id))).slice(0, 15);

    return (
        <div className="space-y-8 pb-20 bg-transparent">
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
                        <h3 className="text-sm font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight">Pr\u00f3ximo Ajuste de Planes</h3>
                        <p className="text-xs font-bold text-amber-800/70 dark:text-amber-400/70 leading-relaxed">
                            A partir del {new Date(pendingAdjustment.effectiveDate).toLocaleDateString()}, los planes Pro se ajustar\u00e1n por inflaci\u00f3n (**{pendingAdjustment.percentage}%**). \u00a1Aprovech\u00e1 a suscribirte hoy!
                        </p>
                    </div>
                    <Link 
                        to="/settings?tab=subscription"
                        className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20"
                    >
                        Ver Planes
                    </Link>
                </motion.div>
            )}

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
                    <h2 className="text-4xl font-black text-text-main">
                        {stats.totalStudents}
                    </h2>
                </motion.div>
            </div>

            {/* List Section */}
            <div className="space-y-4">
                <h3 className="label-premium mb-6 ml-2 uppercase">Actividad Reciente</h3>
                
                {recentActivity.length === 0 ? (
                    <EmptyState 
                        icon={Activity}
                        title="No hay actividad"
                        description="Aún no tienes alumnos cargados o cobros recientes para mostrar en esta lista."
                        actionLabel="Ver Alumnos"
                        actionLink="/app/students"
                    />
                ) : (
                    <>
                        {/* Mobile Cards View */}
                        <div className="md:hidden space-y-3">
                            {recentActivity.map((student) => (
                                <div key={student.id} className="card-premium p-4 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-surface dark:bg-bg-app rounded-xl flex items-center justify-center text-xs font-black text-text-muted border border-border-main uppercase shadow-sm">
                                                {student.name.substring(0, 2)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-text-main leading-tight">{student.name}</h4>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-80">{student.service_name}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-primary-main">
                                                {user?.currency || '$'}{Number(student.amount).toLocaleString('es-AR')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end border-t border-border-main/30 pt-3">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                            student.status === 'paid' 
                                            ? 'bg-green-100 text-green-700 dark:bg-green-600/10 dark:text-green-400' 
                                            : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                                        }`}>
                                            {student.status === 'paid' ? 'Cobrado' : 'Pendiente'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block card-premium overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-bg-app border-b border-border-main">
                                        <tr>
                                            <th className="p-4 label-premium">Alumno</th>
                                            <th className="p-4 label-premium">Servicio</th>
                                            <th className="p-4 label-premium">Monto</th>
                                            <th className="p-4 label-premium">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentActivity.map((student) => (
                                            <tr key={student.id} className="border-b border-border-main/40 hover:bg-bg-app transition transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-surface dark:bg-bg-app rounded-lg flex items-center justify-center text-[10px] font-black text-text-muted border border-border-main uppercase shadow-sm">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <span className="font-bold text-text-main leading-tight">{student.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm font-semibold text-text-muted">{student.service_name}</span>
                                                </td>
                                                <td className="p-4 font-bold text-text-main">
                                                    {user?.currency || '$'}{Number(student.amount).toLocaleString('es-AR')}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                        student.status === 'paid' 
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-600/10 dark:text-green-400' 
                                                        : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                                                    }`}>
                                                        {student.status === 'paid' ? 'Cobrado' : 'Pendiente'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};

export default BasicDashboard;
