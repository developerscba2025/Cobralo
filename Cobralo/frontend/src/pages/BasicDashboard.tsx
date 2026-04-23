import { motion } from 'framer-motion';
import { Zap, Activity, TrendingUp, Users2, DollarSign, Clock, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, type Student } from '../services/api';
import EmptyState from '../components/EmptyState';
import TiltCard from '../components/TiltCard';
import Tooltip from '../components/ui/Tooltip';
import { showToast } from '../components/Toast';
import confetti from 'canvas-confetti';
import { staggerContainerVariants, listItemVariants } from '../utils/motion';

interface BasicDashboardProps {
    stats: {
        paid: number;
        pending: number;
        totalStudents: number;
    };
    students: Student[];
    todaysSchedules?: any[];
    user: any;
    pendingAdjustment?: any;
    onAction?: () => Promise<void> | void;
}

// Using card-premium from index.css for universal consistency
const bentoBaseClass = "card-premium";

const BasicDashboard: React.FC<BasicDashboardProps> = ({ stats, students, todaysSchedules = [], user, pendingAdjustment, onAction }) => {
    const recentActivity = [...students].sort((a, b) => (Number(b.id) - Number(a.id))).slice(0, 10);
    const paid = recentActivity.filter(s => s.status === 'paid');
    const pending = recentActivity.filter(s => s.status !== 'paid');
    const currency = user?.currency || '$';
    const collectionRate = stats.totalStudents > 0 ? Math.round((paid.length / Math.max(recentActivity.length, 1)) * 100) : 0;

    const handleTogglePayment = async (student: Student, e: React.MouseEvent) => {
        e.preventDefault();
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
            if (onAction) {
                await onAction();
            }
        } catch {
            showToast.error('Error al actualizar pago');
        }
    };

    return (
        <motion.div 
            variants={staggerContainerVariants}
            initial="initial"
            animate="animate"
            className="space-y-4 md:space-y-6 pb-12 lg:pb-0"
        >
            {/* ── Header ── */}
            <div className="space-y-2 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="flex items-center gap-4">
                    <h1 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter uppercase italic">
                        {(() => {
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
                            const name = user?.name ? user.name.split(' ')[0].toUpperCase() : 'USUARIO';
                            return <>{greeting}, {name} <span className={icon === '👋' ? 'animate-bounce inline-block' : ''} style={icon === '👋' ? { animationDuration: '3s' } : {}}>{icon}</span></>;
                        })()}
                    </h1>
                </div>
                <p className="text-sm font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">Resumen de tu academia hoy</p>
            </div>
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
                        to="/app/settings?tab=subscription"
                        className="px-5 py-2 text-amber-900 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                        style={{ background: 'rgba(245,158,11,0.9)' }}
                    >
                        Ver Planes
                    </Link>
                </motion.div>
            )}

            {/* ══ BENTO GRID SUPERIOR ══ */}
            <motion.div variants={listItemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 xl:gap-5">

                {/* Ingresos del mes - Large */}
                <TiltCard intensity={3} className="col-span-1 sm:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="p-5 sm:p-6 md:p-8 flex flex-col justify-between min-h-[140px] h-full w-full glass-emerald rounded-[28px] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] -translate-y-1/4 translate-x-1/4 pointer-events-none" />
                        
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Mes actual
                            </div>
                            <Tooltip content="Total recaudado este mes (sin incluir lo pendiente)">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-emerald-500 bg-white/5 border border-white/10">
                                    <DollarSign size={18} />
                                </div>
                            </Tooltip>
                        </div>
                        <div className="mt-4 md:mt-6 relative z-10">
                            <p className="text-[9px] md:text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 italic">Ingresos (Mes Actual)</p>
                            {stats.paid === 0 && stats.pending === 0 && stats.totalStudents === 0 ? (
                                <p className="text-[10px] md:text-[11px] font-black text-text-muted mt-1 opacity-60">
                                    Aparecerá aquí ✨
                                </p>
                            ) : (
                                <>
                                    <p className="text-3xl md:text-5xl font-black text-text-main tracking-tighter leading-none">
                                        {currency}{stats.paid.toLocaleString('es-AR')}
                                    </p>
                                    {stats.pending > 0 && (
                                        <p className="text-[9px] font-bold text-amber-500/90 uppercase tracking-wider mt-1.5 opacity-80">
                                            {currency}{stats.pending.toLocaleString('es-AR')} pendiente
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </TiltCard>

                {/* Alumnos Activos */}
                <TiltCard intensity={5}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`p-5 sm:p-6 flex flex-col justify-between min-h-[120px] h-full w-full ${bentoBaseClass}`}
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Alumnos</h3>
                            <Tooltip content="Cantidad total de personas inscriptas">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/5 bg-white/5">
                                    <Users2 size={16} className="text-text-muted" />
                                </div>
                            </Tooltip>
                        </div>
                        <div className="mt-4">
                            <p className="text-4xl font-black text-text-main tracking-tighter">{stats.totalStudents}</p>
                            <p className="text-[10px] text-text-muted font-black uppercase mt-2 tracking-widest opacity-60">Alumnos Activos</p>
                        </div>
                    </motion.div>
                </TiltCard>

                {/* Tasa de cobro */}
                <TiltCard intensity={5}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className={`p-5 sm:p-6 flex flex-col justify-between min-h-[120px] h-full w-full ${bentoBaseClass}`}
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="text-[9px] font-black text-emerald-500/70 uppercase tracking-widest leading-none">Eficiencia</h3>
                            <Tooltip content="Porcentaje de alumnos que ya pagaron este mes">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-emerald-500/20 bg-emerald-500/10">
                                    <TrendingUp size={16} className="text-emerald-500" />
                                </div>
                            </Tooltip>
                        </div>
                        <div className="mt-4">
                            <p className="text-4xl font-black text-emerald-500 tracking-tighter">{collectionRate}%</p>
                            <p className="text-[10px] text-text-muted font-black uppercase mt-2 tracking-widest opacity-60">Tasa de Cobro</p>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all"
                                style={{ width: `${collectionRate}%` }}
                            />
                        </div>
                    </motion.div>
                </TiltCard>
                
                {/* Agenda Mini Widget (si hay clases hoy) */}
                {todaysSchedules.length > 0 && (
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18 }}
                        className={`col-span-1 sm:col-span-2 md:col-span-4 p-5 flex flex-col justify-between ${bentoBaseClass}`}
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-[10px] font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                                <Clock size={12} className="text-violet-500" />
                                Clases de Hoy ({todaysSchedules.length})
                            </h3>
                            <Link to="/app/calendar" className="text-[9px] font-black text-primary-main uppercase tracking-widest hover:opacity-70 transition-opacity">
                                Ver Agenda →
                            </Link>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                            {todaysSchedules.map((schedule: any) => {
                                const studentsList = schedule.students || (schedule.student ? [schedule.student] : []);
                                const name = studentsList.length > 1 ? `${studentsList[0]?.name?.split(' ')[0]} +${studentsList.length - 1}` : (studentsList[0]?.name || 'Grupal');
                                return (
                                    <div key={schedule.id} className="min-w-[140px] p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0 snap-start">
                                        <p className="text-[12px] font-black text-text-main truncate max-w-full">{schedule.startTime}</p>
                                        <p className="text-[10px] font-bold text-text-muted truncate mt-1">{name}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* ══ ACTIVIDAD RECIENTE ══ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`overflow-hidden card-premium`}
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
                                <div key={student.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface/[0.015] transition-colors">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black text-text-muted border border-border-main uppercase shrink-0"
                                         style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        {student.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-text-main truncate">{student.name}</p>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest truncate opacity-60">{student.service_name}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {student.status !== 'paid' && (
                                            <button
                                                onClick={(e) => handleTogglePayment(student, e)}
                                                className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Wallet size={14} />
                                            </button>
                                        )}
                                        <div className="text-right">
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
                                        className="flex items-center px-6 py-4 hover:bg-surface/[0.015] transition-colors group"
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
                                        <div className="w-[110px] flex items-center justify-end gap-2">
                                            {student.status !== 'paid' && (
                                                <button
                                                    onClick={(e) => handleTogglePayment(student, e)}
                                                    className="w-7 h-7 flex items-center justify-center bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm shrink-0"
                                                >
                                                    <Wallet size={12} />
                                                </button>
                                            )}
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
