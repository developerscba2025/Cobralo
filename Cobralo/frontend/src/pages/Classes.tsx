import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, Users, Clock, Send, CheckCircle2, 
    Search, Trash2, Plus, Calendar as CalendarIcon,
    Loader2, UserPlus, ChevronRight, Zap, LayoutGrid
} from 'lucide-react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import type { UnifiedSchedule } from '../services/api';
import { showToast } from '../components/Toast';
import AttendanceBulkModal from '../components/AttendanceBulkModal';
import ClassParticipantsModal from '../components/ClassParticipantsModal';
import ConfirmModal from '../components/ConfirmModal';
import WhatsAppPreviewModal from '../components/WhatsAppPreviewModal';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAY_SHORT: { [k: number]: string } = { 0: 'DOM', 1: 'LUN', 2: 'MAR', 3: 'MIÉ', 4: 'JUE', 5: 'VIE', 6: 'SÁB' };
const DAY_COLORS: { [k: number]: string } = {
    0: 'from-rose-500/20 to-transparent',
    1: 'from-emerald-500/20 to-transparent',
    2: 'from-sky-500/20 to-transparent',
    3: 'from-violet-500/20 to-transparent',
    4: 'from-amber-500/20 to-transparent',
    5: 'from-emerald-500/20 to-transparent',
    6: 'from-orange-500/20 to-transparent',
};
const DAY_ACCENT: { [k: number]: string } = {
    0: 'text-rose-400',
    1: 'text-emerald-400',
    2: 'text-sky-400',
    3: 'text-violet-400',
    4: 'text-amber-400',
    5: 'text-emerald-400',
    6: 'text-orange-400',
};

const Classes = () => {
    const { user, isPro } = useAuth();
    const navigate = useNavigate();
    const [classes, setClasses] = useState<UnifiedSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

    const [attendanceModal, setAttendanceModal] = useState<{ isOpen: boolean; schedule: UnifiedSchedule | null }>({ isOpen: false, schedule: null });
    const [participantsModal, setParticipantsModal] = useState<{ isOpen: boolean; schedule: UnifiedSchedule | null }>({ isOpen: false, schedule: null });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
    const [whatsappModal, setWhatsappModal] = useState<{ isOpen: boolean; students: any[]; template: string }>({ isOpen: false, students: [], template: '' });

    useEffect(() => { loadClasses(); }, []);

    const loadClasses = async () => {
        setIsLoading(true);
        try {
            const data = await api.getAllSchedules();
            setClasses(data);
        } catch {
            showToast.error('Error al cargar los grupos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotifyGroup = (schedule: UnifiedSchedule) => {
        const participants = schedule.students || (schedule.student ? [schedule.student] : []);
        if (participants.length === 0) return;
        const msg = `Hola {alumno}! Te recuerdo nuestro grupo de {servicio} hoy a las ${schedule.startTime} hs. ¡Nos vemos!`;
        setWhatsappModal({ isOpen: true, students: participants, template: msg });
    };

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        try {
            await api.deleteSchedule(deleteModal.id);
            showToast.success('Grupo eliminado');
            loadClasses();
        } catch {
            showToast.error('Error al eliminar');
        } finally {
            setDeleteModal({ isOpen: false, id: null });
        }
    };

    const removeTildes = (str: string) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const filteredClasses = classes.filter(c => {
        const studentNames = (c.students || [c.student]).map(s => s?.name || '').join(' ');
        const lowerSearch = removeTildes(searchTerm);
        return removeTildes(studentNames).includes(lowerSearch) ||
            removeTildes(c.startTime).includes(lowerSearch) ||
            removeTildes(DAYS[c.dayOfWeek === 7 ? 0 : c.dayOfWeek]).includes(lowerSearch);
    });

    // Group by day
    const groupedByDay: Record<number, UnifiedSchedule[]> = {};
    filteredClasses.forEach(c => {
        const safeDay = c.dayOfWeek === 7 ? 0 : c.dayOfWeek;
        if (!groupedByDay[safeDay]) groupedByDay[safeDay] = [];
        groupedByDay[safeDay].push(c);
    });

    const sortedDays = Object.keys(groupedByDay).map(Number).sort((a, b) => {
        if (a === 0) return 1;
        if (b === 0) return -1;
        return a - b;
    });

    // Merge schedules that share the same startTime + serviceName
    const getMergedSchedules = (daySchedules: UnifiedSchedule[]) => {
        const timeMap: Record<string, UnifiedSchedule[]> = {};
        daySchedules.forEach(s => {
            const serviceName = s.students?.[0]?.service_name || s.student?.service_name || '';
            const key = `${s.startTime}__${serviceName}`;
            if (!timeMap[key]) timeMap[key] = [];
            timeMap[key].push(s);
        });

        return Object.values(timeMap).map(group => {
            if (group.length < 2) return group[0];
            const allStudents = group.flatMap(s => s.students || (s.student ? [s.student] : []));
            const uniqueStudents = Array.from(new Map(allStudents.map(st => [st.id, st])).values());
            return { ...group[0], students: uniqueStudents, _mergedIds: group.map(s => s.id) } as UnifiedSchedule & { _mergedIds: number[] };
        }).sort((a, b) => {
            const timeA = (a.startTime || '').replace(/^(\d:)/, '0$1');
            const timeB = (b.startTime || '').replace(/^(\d:)/, '0$1');
            return timeA.localeCompare(timeB);
        });
    };

    // Stats
    const totalGroups = filteredClasses.length;
    const totalStudentsInClasses = new Set(
        filteredClasses.flatMap(c => (c.students || [c.student]).filter(Boolean).map(s => s!.id))
    ).size;
    const groupClasses = filteredClasses.filter(c => (c.students?.length ?? 0) > 1).length;

    return (
        <Layout>
            {/* Header */}
            <header className="mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <CalendarIcon size={12} /> Módulo de Clases
                        </p>
                        <h1 className="text-4xl font-black text-text-main tracking-tight uppercase leading-none">
                            Mis Grupos
                        </h1>
                        <p className="text-text-muted font-medium tracking-tight mt-1 text-sm">
                            Gestión de horarios, asistencia y alumnos por grupo
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* View Toggle */}
                        <div className="flex gap-1 bg-surface/50 dark:bg-black/30 border border-border-main rounded-2xl p-1">
                            <button
                                onClick={() => setViewMode('timeline')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'timeline' ? 'bg-emerald-500 text-black' : 'text-text-muted hover:text-text-main'}`}
                            >
                                Timeline
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-emerald-500 text-black' : 'text-text-muted hover:text-text-main'}`}
                            >
                                <LayoutGrid size={12} /> Grid
                            </button>
                        </div>
                        <button
                            onClick={() => navigate('/app/calendar', { state: { openModal: true } })}
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Plus size={16} strokeWidth={3} /> Nuevo Grupo
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                {!isLoading && classes.length > 0 && (
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        {[
                            { label: 'Horarios', value: totalGroups, icon: <Clock size={12} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                            { label: 'Alumnos', value: totalStudentsInClasses, icon: <Users size={12} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                            { label: 'Grupales', value: groupClasses, icon: <Zap size={12} />, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-surface dark:bg-bg-soft border border-border-main rounded-[24px] px-6 py-5 flex flex-col gap-2 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                        <span className={stat.color}>{stat.icon}</span>
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">{stat.label}</p>
                                </div>
                                <p className="text-3xl font-black text-text-main leading-none tracking-tighter">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </header>

            {/* Search */}
            <div className="relative max-w-md mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar por alumno, día u horario..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-surface dark:bg-[#111113] border border-border-main rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 shadow-sm transition-all font-bold text-sm placeholder:text-text-muted"
                />
            </div>

            {/* Content */}
            <div className="space-y-10">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-24 gap-4">
                        <Loader2 className="animate-spin text-emerald-500" size={36} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Sincronizando grupos...</p>
                    </div>
                ) : sortedDays.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center p-16 bg-surface dark:bg-[#111113] rounded-[40px] border-2 border-dashed border-border-main"
                    >
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="text-emerald-500/50" size={36} />
                        </div>
                        <h3 className="text-xl font-black text-text-main uppercase italic tracking-tight mb-2">Sin grupos aún</h3>
                        <p className="text-text-muted max-w-xs mx-auto mb-8 text-sm">
                            {searchTerm ? 'No se encontraron resultados.' : 'Creá tu primer grupo desde la Agenda para empezar a organizar tus clases.'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => navigate('/app/calendar', { state: { openModal: true } })}
                                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-0.5 active:scale-95"
                            >
                                <Plus size={18} strokeWidth={3} /> Crear Primer Grupo
                            </button>
                        )}
                    </motion.div>
                ) : viewMode === 'timeline' ? (
                    // ─── TIMELINE VIEW ───
                    sortedDays.map((dayNum, dayIdx) => {
                        const mergedSchedules = getMergedSchedules(groupedByDay[dayNum]);
                        return (
                            <motion.div
                                key={dayNum}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: dayIdx * 0.05 }}
                            >
                                {/* Day Header */}
                                <div className="flex items-center gap-4 mb-5">
                                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${DAY_COLORS[dayNum]} border border-border-main flex flex-col items-center justify-center`}>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${DAY_ACCENT[dayNum]}`}>{DAY_SHORT[dayNum]}</span>
                                        <span className="text-lg font-black text-text-main leading-none">{mergedSchedules.length}</span>
                                    </div>
                                    <div>
                                        <h2 className={`text-base font-black uppercase tracking-[0.2em] ${DAY_ACCENT[dayNum]}`}>{DAYS[dayNum]}</h2>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                                            {mergedSchedules.length} {mergedSchedules.length === 1 ? 'clase' : 'clases'} · {' '}
                                            {new Set(mergedSchedules.flatMap(s => (s.students || [s.student]).filter(Boolean).map(p => p!.id))).size} alumnos
                                        </p>
                                    </div>
                                    <div className="flex-1 h-px bg-border-main" />
                                </div>

                                {/* Timeline Slots */}
                                <div className="space-y-3 ml-4 pl-4 border-l-2 border-border-main relative">
                                    {mergedSchedules.map((schedule, sIdx) => {
                                        const participants = schedule.students || (schedule.student ? [schedule.student] : []);
                                        const isMerged = !!(schedule as any)._mergedIds;
                                        const isOverCapacity = schedule.capacity ? participants.length >= schedule.capacity : false;
                                        const serviceName = participants[0]?.service_name || 'Sin servicio';

                                        return (
                                            <motion.div
                                                key={schedule.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: dayIdx * 0.05 + sIdx * 0.04 }}
                                                className="relative"
                                            >
                                                {/* Timeline dot */}
                                                <div className="absolute -left-[21px] top-6 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-bg-app dark:border-[#0E1113]" />

                                                <div className={`group bg-surface dark:bg-[#111113] border rounded-[28px] p-5 transition-all duration-300 hover:shadow-lg dark:hover:shadow-black/40 ${isMerged ? 'border-emerald-500/20 hover:border-emerald-500/40' : 'border-border-main hover:border-emerald-500/20'}`}>
                                                    <div className="flex items-start gap-5">
                                                        {/* Time Block */}
                                                        <div className="flex-shrink-0 text-center min-w-[64px]">
                                                            <div className="text-2xl font-black text-text-main tracking-tighter italic leading-none">
                                                                {schedule.startTime}
                                                            </div>
                                                            <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">
                                                                {schedule.endTime}
                                                            </div>
                                                            {schedule.capacity && (
                                                                <div className={`mt-2 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${isOverCapacity ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                                    {participants.length}/{schedule.capacity}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Divider */}
                                                        <div className="w-px self-stretch bg-border-main" />

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{serviceName}</span>
                                                                {isMerged && (
                                                                    <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                                                        GRUPAL
                                                                    </span>
                                                                )}
                                                                {isOverCapacity && (
                                                                    <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                                        LLENO
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Participants */}
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {participants.slice(0, 6).map((p, i) => (
                                                                    <span
                                                                        key={p.id}
                                                                        style={{ animationDelay: `${i * 30}ms` }}
                                                                        className="px-2.5 py-1 bg-bg-app dark:bg-black/30 border border-border-main rounded-full text-[10px] font-bold text-text-main flex items-center gap-1.5"
                                                                    >
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                                        {p.name}
                                                                    </span>
                                                                ))}
                                                                {participants.length > 6 && (
                                                                    <span className="px-2.5 py-1 bg-bg-app dark:bg-black/30 border border-border-main rounded-full text-[10px] font-bold text-text-muted">
                                                                        +{participants.length - 6} más
                                                                    </span>
                                                                )}
                                                                {participants.length === 0 && (
                                                                    <span className="text-[10px] text-text-muted italic">Sin alumnos asignados</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                            <button
                                                                onClick={() => setAttendanceModal({ isOpen: true, schedule })}
                                                                disabled={participants.length === 0}
                                                                title="Registrar asistencia"
                                                                className="p-2 rounded-xl text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 transition-all disabled:opacity-30"
                                                            >
                                                                <CheckCircle2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => setParticipantsModal({ isOpen: true, schedule })}
                                                                title="Gestionar integrantes"
                                                                className="p-2 rounded-xl text-text-muted hover:text-sky-400 hover:bg-sky-500/10 transition-all"
                                                            >
                                                                <UserPlus size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleNotifyGroup(schedule)}
                                                                disabled={participants.length === 0}
                                                                title="Notificar grupo"
                                                                className="p-2 rounded-xl text-text-muted hover:text-violet-400 hover:bg-violet-500/10 transition-all disabled:opacity-30"
                                                            >
                                                                <Send size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteModal({ isOpen: true, id: schedule.id })}
                                                                title="Eliminar"
                                                                className="p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Mobile actions footer */}
                                                    <div className="mt-4 pt-4 border-t border-border-main grid grid-cols-3 gap-2 md:hidden">
                                                        <button
                                                            onClick={() => setAttendanceModal({ isOpen: true, schedule })}
                                                            disabled={participants.length === 0}
                                                            className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-wider text-[9px] disabled:opacity-40"
                                                        >
                                                            <CheckCircle2 size={14} /> Asistir
                                                        </button>
                                                        <button
                                                            onClick={() => setParticipantsModal({ isOpen: true, schedule })}
                                                            className="flex items-center justify-center gap-1.5 py-2.5 bg-surface dark:bg-black/30 border border-border-main text-text-main rounded-2xl font-black uppercase tracking-wider text-[9px]"
                                                        >
                                                            <UserPlus size={14} /> Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleNotifyGroup(schedule)}
                                                            disabled={participants.length === 0}
                                                            className="flex items-center justify-center gap-1.5 py-2.5 bg-surface dark:bg-black/30 border border-border-main text-text-main rounded-2xl font-black uppercase tracking-wider text-[9px] disabled:opacity-40"
                                                        >
                                                            <Send size={14} /> Avisar
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    // ─── GRID VIEW ───
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {sortedDays.flatMap(dayNum =>
                                getMergedSchedules(groupedByDay[dayNum]).map((schedule, idx) => {
                                    const participants = schedule.students || (schedule.student ? [schedule.student] : []);
                                    const isMerged = !!(schedule as any)._mergedIds;
                                    const serviceName = participants[0]?.service_name || 'Sin servicio';
                                    const isOverCapacity = schedule.capacity ? participants.length >= schedule.capacity : false;

                                    return (
                                        <motion.div
                                            key={schedule.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.04 }}
                                            className={`group relative bg-surface dark:bg-bg-dark border rounded-[32px] p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl dark:hover:shadow-black/60 ${isMerged ? 'border-emerald-500/20 hover:border-emerald-500/40' : 'border-border-main hover:border-emerald-500/20'}`}
                                        >
                                            {/* Accent bar */}
                                            <div className={`absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r ${DAY_COLORS[dayNum === 7 ? 0 : dayNum]} rounded-b-full`} />

                                            <div className="flex justify-between items-start mb-5">
                                                <div>
                                                    <div className={`text-[9px] font-black uppercase tracking-[0.25em] mb-1 ${DAY_ACCENT[dayNum === 7 ? 0 : dayNum]}`}>
                                                        {DAYS[dayNum === 7 ? 0 : dayNum]}
                                                    </div>
                                                    <div className="flex items-baseline gap-2">
                                                        <Clock size={14} className="text-emerald-500 mb-0.5" />
                                                        <span className="text-2xl font-black text-text-main italic tracking-tight">{schedule.startTime}</span>
                                                        <span className="text-xs text-text-muted font-bold">- {schedule.endTime}</span>
                                                    </div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">{serviceName}</div>
                                                </div>
                                                <div className="flex flex-col gap-1.5 items-end">
                                                    {isMerged && <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-violet-500/10 text-violet-400 border border-violet-500/20">GRUPAL</span>}
                                                    {isOverCapacity && <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">LLENO</span>}
                                                </div>
                                            </div>

                                            <div className="mb-5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Users size={12} className="text-text-muted" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                                                        {participants.length} {schedule.capacity ? `/ ${schedule.capacity}` : ''} alumnos
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {participants.slice(0, 4).map(p => (
                                                        <span key={p.id} className="px-2.5 py-1 bg-bg-app dark:bg-black/30 border border-border-main rounded-full text-[10px] font-bold text-text-main">
                                                            {p.name.split(' ')[0]}
                                                        </span>
                                                    ))}
                                                    {participants.length > 4 && (
                                                        <span className="px-2.5 py-1 bg-bg-app dark:bg-black/30 border border-border-main rounded-full text-[10px] font-bold text-text-muted">
                                                            +{participants.length - 4}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setAttendanceModal({ isOpen: true, schedule })}
                                                    disabled={participants.length === 0}
                                                    className="flex items-center justify-center gap-1.5 py-3 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-40"
                                                >
                                                    <CheckCircle2 size={14} /> Asistir
                                                </button>
                                                <button
                                                    onClick={() => setParticipantsModal({ isOpen: true, schedule })}
                                                    className="flex items-center justify-center gap-1.5 py-3 bg-surface dark:bg-black/30 border border-border-main text-text-main rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all active:scale-95 hover:border-emerald-500/30"
                                                >
                                                    <UserPlus size={14} /> Editar
                                                </button>
                                            </div>

                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => handleNotifyGroup(schedule)}
                                                    disabled={participants.length === 0}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-text-muted hover:text-violet-400 border border-border-main rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all hover:border-violet-500/30 disabled:opacity-30"
                                                >
                                                    <Send size={12} /> Notificar
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({ isOpen: true, id: schedule.id })}
                                                    className="p-2.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 border border-border-main rounded-2xl transition-all hover:border-red-500/30"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            {/* Arrow hint */}
                                            <ChevronRight size={14} className="absolute bottom-5 right-5 text-border-main group-hover:text-emerald-500/30 transition-colors" />
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AttendanceBulkModal
                isOpen={attendanceModal.isOpen}
                onClose={() => setAttendanceModal({ isOpen: false, schedule: null })}
                schedule={attendanceModal.schedule}
                onSuccess={loadClasses}
            />
            <ClassParticipantsModal
                isOpen={participantsModal.isOpen}
                onClose={() => setParticipantsModal({ isOpen: false, schedule: null })}
                schedule={participantsModal.schedule}
                onSuccess={loadClasses}
            />
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Eliminar Grupo"
                message="¿Estás seguro de eliminar este horario? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ isOpen: false, id: null })}
                variant="danger"
            />
            <WhatsAppPreviewModal
                isOpen={whatsappModal.isOpen}
                onClose={() => setWhatsappModal({ isOpen: false, students: [], template: '' })}
                students={whatsappModal.students}
                user={user}
                isPro={isPro}
                customTemplate={whatsappModal.template}
            />
        </Layout>
    );
};

export default Classes;
