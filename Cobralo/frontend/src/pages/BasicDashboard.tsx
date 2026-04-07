import { motion } from 'framer-motion';
import { Zap, Activity, TrendingUp, Users2, DollarSign, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
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
    onAction?: () => Promise<void> | void;
}

const bentoBase: React.CSSProperties = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-main)',
    borderRadius: '24px',
    position: 'relative',
    overflow: 'hidden',
};

const BasicDashboard: React.FC<BasicDashboardProps> = ({ stats, students, user, pendingAdjustment }) => {
    const recentActivity = [...students].sort((a, b) => (Number(b.id) - Number(a.id))).slice(0, 10);
    const paid = recentActivity.filter(s => s.status === 'paid');
    const pending = recentActivity.filter(s => s.status !== 'paid');
    const currency = user?.currency || '$';
    const collectionRate = stats.totalStudents > 0 ? Math.round((paid.length / Math.max(recentActivity.length, 1)) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 pb-20"
        >
            {/* IPC Notice Banner */}
            {pendingAdjustment && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-[24px] flex flex-col md:flex-row items-center gap-5 border border-amber-500/20"
                    style={{ background: 'rgba(245,158,11,0.05)' }}
                >
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0"
                         style={{ background: 'rgba(245,158,11,0.08)' }}>
                        <Zap size={20} />
                    </div>
                    <div className="flex-1 space-y-1 text-center md:text-left">
                        <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">Próximo Ajuste de Planes</h3>
                        <p className="text-xs font-bold text-amber-600/80 leading-relaxed">
                            A partir del {new Date(pendingAdjustment.effectiveDate).toLocaleDateString()}, los planes se ajustarán ({pendingAdjustment.percentage}%).
                        </p>
                    </div>
                    <Link
                        to="/settings?tab=subscription"
                        className="px-5 py-2 text-amber-900 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                        style={{ background: 'rgba(245,158,11,0.9)' }}
                    >
                        Ver Planes
                    </Link>
                </motion.div>
            )}

            {/* ══ BENTO GRID SUPERIOR ══ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

                {/* Ingresos del mes - Large */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="col-span-1 sm:col-span-2 p-5 sm:p-6 md:p-8 flex flex-col justify-between min-h-[140px]"
                    style={{ ...bentoBase, background: 'linear-gradient(165deg, var(--color-surface) 0%, var(--color-bg-app) 100%)' }}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-primary-main/20 text-[9px] font-black text-primary-main uppercase tracking-widest"
                             style={{ background: 'rgba(34,197,94,0.06)' }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-main animate-pulse" />
                            Mes actual
                        </div>
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-primary-main border border-primary-main/20"
                             style={{ background: 'rgba(34,197,94,0.08)' }}>
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <div className="mt-6">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Ingresos Cobrados</p>
                        <p className="text-4xl md:text-5xl font-black text-text-main tracking-tighter">
                            {currency}{stats.paid.toLocaleString('es-AR')}
                        </p>
                        {stats.pending > 0 && (
                            <p className="text-[10px] font-bold text-amber-500/90 uppercase tracking-wider mt-2">
                                {currency}{stats.pending.toLocaleString('es-AR')} pendiente
                            </p>
                        )}
                    </div>
                </motion.div>

                {/* Alumnos Activos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 sm:p-6 flex flex-col justify-between min-h-[120px]"
                    style={bentoBase}
                >
                    <div className="flex justify-between items-start">
                        <h3 className="text-[9px] font-black text-text-muted uppercase tracking-widest">Alumnos</h3>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-border-main"
                             style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <Users2 size={16} className="text-text-muted" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-4xl font-black text-text-main tracking-tighter">{stats.totalStudents}</p>
                        <p className="text-[9px] text-text-muted font-black uppercase mt-1 tracking-widest">Activos</p>
                    </div>
                </motion.div>

                {/* Tasa de cobro */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="p-5 sm:p-6 flex flex-col justify-between min-h-[120px]"
                    style={bentoBase}
                >
                    <div className="flex justify-between items-start">
                        <h3 className="text-[9px] font-black text-text-muted uppercase tracking-widest">Cobrado</h3>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-primary-main/20"
                             style={{ background: 'rgba(34,197,94,0.06)' }}>
                            <TrendingUp size={16} className="text-primary-main" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-4xl font-black text-primary-main tracking-tighter">{collectionRate}%</p>
                        <p className="text-[9px] text-text-muted font-black uppercase mt-1 tracking-widest">Tasa de cobro</p>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-1 rounded-full bg-border-main overflow-hidden">
                        <div
                            className="h-full rounded-full bg-primary-main transition-all"
                            style={{ width: `${collectionRate}%` }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* ══ ACTIVIDAD RECIENTE ══ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={bentoBase}
                className="overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border-main/50">
                    <div className="flex items-center gap-3">
                        <h3 className="text-[10px] font-black text-text-main uppercase tracking-widest">Actividad Reciente</h3>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border-main text-[9px] font-black text-text-muted uppercase tracking-widest"
                             style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <div className={`w-1.5 h-1.5 rounded-full ${pending.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-primary-main'}`} />
                            {pending.length > 0 ? `${pending.length} pendiente${pending.length !== 1 ? 's' : ''}` : 'Al día'}
                        </div>
                    </div>
                    <Link
                        to="/app/students"
                        className="text-[9px] font-black text-primary-main uppercase tracking-widest hover:opacity-70 transition-opacity"
                    >
                        Ver todos →
                    </Link>
                </div>

                {recentActivity.length === 0 ? (
                    <div className="p-8">
                        <EmptyState
                            icon={Activity}
                            title="No hay actividad"
                            description="Aún no tienes alumnos cargados o cobros recientes para mostrar."
                            actionLabel="Agregar Alumno"
                            actionLink="/app/students"
                        />
                    </div>
                ) : (
                    <>
                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-border-main/30">
                            {recentActivity.map((student) => (
                                <div key={student.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.015] transition-colors">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black text-text-muted border border-border-main uppercase shrink-0"
                                         style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        {student.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-text-main truncate">{student.name}</p>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest truncate opacity-60">{student.service_name}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-black text-sm text-text-main">{currency}{Number(student.amount).toLocaleString('es-AR')}</p>
                                        <span className={`inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest mt-0.5 px-2 py-0.5 rounded-md border ${
                                            student.status === 'paid'
                                                ? 'text-primary-main border-primary-main/20 bg-primary-main/5'
                                                : 'text-amber-500 border-amber-500/20 bg-amber-500/5'
                                        }`}>
                                            {student.status === 'paid' ? <CheckCircle2 size={8} /> : <Clock size={8} />}
                                            {student.status === 'paid' ? 'Cobrado' : 'Pendiente'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            {/* Column Headers */}
                            <div className="flex items-center px-6 py-3 border-b border-border-main/30">
                                <div className="flex-1 text-[8px] font-black text-text-muted uppercase tracking-widest">Alumno</div>
                                <div className="w-[200px] text-[8px] font-black text-text-muted uppercase tracking-widest">Servicio</div>
                                <div className="w-[130px] text-[8px] font-black text-text-muted uppercase tracking-widest">Monto</div>
                                <div className="w-[110px] text-[8px] font-black text-text-muted uppercase tracking-widest text-right">Estado</div>
                            </div>
                            <div className="divide-y divide-border-main/20">
                                {recentActivity.map((student, i) => (
                                    <motion.div
                                        key={student.id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.02 * i }}
                                        className="flex items-center px-6 py-4 hover:bg-white/[0.015] transition-colors group"
                                    >
                                        <div className="flex-1 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-text-muted border border-border-main uppercase shrink-0"
                                                 style={{ background: 'rgba(255,255,255,0.02)' }}>
                                                {student.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-sm text-text-main">{student.name}</span>
                                        </div>
                                        <div className="w-[200px]">
                                            <span className="text-[11px] font-bold text-text-muted truncate block">{student.service_name}</span>
                                        </div>
                                        <div className="w-[130px]">
                                            <span className="font-black text-sm text-text-main">{currency}{Number(student.amount).toLocaleString('es-AR')}</span>
                                        </div>
                                        <div className="w-[110px] flex justify-end">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest ${
                                                student.status === 'paid'
                                                    ? 'text-primary-main border-primary-main/20 bg-primary-main/5 shadow-[0_0_12px_rgba(34,197,94,0.05)]'
                                                    : 'text-amber-500 border-amber-500/20 bg-amber-500/5'
                                            }`}>
                                                {student.status === 'paid'
                                                    ? <><CheckCircle2 size={10} />Cobrado</>
                                                    : <><AlertCircle size={10} />Pendiente</>
                                                }
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </motion.div>


        </motion.div>
    );
};

export default BasicDashboard;
