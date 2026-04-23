import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, Users, Clock, Send, CheckCircle2, 
    Search, Trash2, Plus, Calendar as CalendarIcon,
    Loader2, UserPlus, ChevronRight, Zap, LayoutGrid,
    MessageCircle, Settings2, MoreVertical, Edit2
} from 'lucide-react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import type { Group, ClassSchedule } from '../services/api';
import { showToast } from '../components/Toast';
import AttendanceBulkModal from '../components/AttendanceBulkModal';
import ClassParticipantsModal from '../components/ClassParticipantsModal';
import ConfirmModal from '../components/ConfirmModal';
import WhatsAppPreviewModal from '../components/WhatsAppPreviewModal';
import GroupModal from '../components/GroupModal';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAY_SHORT: { [k: number]: string } = { 0: 'DOM', 1: 'LUN', 2: 'MAR', 3: 'MIÉ', 4: 'JUE', 5: 'VIE', 6: 'SÁB' };

const Classes = () => {
    const { user, isPro } = useAuth();
    const navigate = useNavigate();
    const [groups, setGroups] = useState<Group[]>([]);
    const [standaloneSchedules, setStandaloneSchedules] = useState<ClassSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('grid');

    // Modals
    const [groupModal, setGroupModal] = useState<{ isOpen: boolean; group: Group | null }>({ isOpen: false, group: null });
    const [attendanceModal, setAttendanceModal] = useState<{ isOpen: boolean; schedule: any | null }>({ isOpen: false, schedule: null });
    const [participantsModal, setParticipantsModal] = useState<{ isOpen: boolean; schedule: any | null }>({ isOpen: false, schedule: null });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; type: 'group' | 'schedule' }>({ isOpen: false, id: null, type: 'group' });
    const [whatsappModal, setWhatsappModal] = useState<{ isOpen: boolean; students: any[]; template: string; goal?: 'WELCOME' | 'PAYMENT' | 'GENERAL' }>({ isOpen: false, students: [], template: '' });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [groupsData, allSchedules] = await Promise.all([
                api.getGroups(),
                api.getAllSchedules()
            ]);
            setGroups(groupsData);
            setStandaloneSchedules(allSchedules.filter((s: any) => !s.groupId));
        } catch {
            showToast.error('Error al cargar datos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotify = (students: any[]) => {
        if (students.length === 0) return;
        setWhatsappModal({ isOpen: true, students, template: '', goal: 'PAYMENT' });
    };

    const handleGeneralNotice = (students: any[]) => {
        if (students.length === 0) return;
        setWhatsappModal({ isOpen: true, students, template: '', goal: 'GENERAL' });
    };

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        try {
            if (deleteModal.type === 'group') {
                await api.deleteGroup(deleteModal.id);
                showToast.success('Grupo eliminado');
            } else {
                await api.deleteSchedule(deleteModal.id);
                showToast.success('Clase eliminada');
            }
            loadData();
        } catch {
            showToast.error('Error al eliminar');
        } finally {
            setDeleteModal({ isOpen: false, id: null, type: 'group' });
        }
    };

    const removeTildes = (str: string) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const filteredGroups = groups.filter(g => {
        const lowerSearch = removeTildes(searchTerm);
        const studentNames = g.students.map(s => s.name).join(' ');
        return removeTildes(g.name).includes(lowerSearch) || 
               removeTildes(studentNames).includes(lowerSearch) ||
               removeTildes(g.service?.name || '').includes(lowerSearch);
    });

    const filteredStandalone = standaloneSchedules.filter(s => {
        const lowerSearch = removeTildes(searchTerm);
        const studentNames = (s.students || [s.student]).map(st => st?.name || '').join(' ');
        return removeTildes(s.title || '').includes(lowerSearch) || 
               removeTildes(studentNames).includes(lowerSearch);
    });

    // Stats
    const totalGroups = groups.length;
    const totalStudents = new Set([...groups.flatMap(g => g.students.map(s => s.id)), ...standaloneSchedules.flatMap(s => (s.students || [s.student]).filter(Boolean).map(st => st!.id))]).size;

    return (
        <Layout>
            {/* Header */}
            <header className="mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Users size={12} /> Gestión de Grupos
                        </p>
                        <h1 className="text-4xl font-black text-text-main tracking-tight uppercase leading-none italic">
                            Mis Alumnos
                        </h1>
                        <p className="text-text-muted font-medium tracking-tight mt-1 text-sm">
                            Organización centralizada por grupos y horarios
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setGroupModal({ isOpen: true, group: null })}
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Plus size={16} strokeWidth={3} /> Nuevo Grupo
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                {!isLoading && (
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Grupos Activos', value: totalGroups, icon: <Users size={12} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                            { label: 'Alumnos Totales', value: totalStudents, icon: <Users size={12} />, color: 'text-sky-500', bg: 'bg-sky-500/10' },
                            { label: 'Cupos Disponibles', value: groups.reduce((acc, g) => acc + ((g.capacity || 0) - g.students.length), 0), icon: <Zap size={12} />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                            { label: 'Clases Semanales', value: groups.reduce((acc, g) => acc + g.schedules.length, 0) + standaloneSchedules.length, icon: <Clock size={12} />, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                        ].map((stat) => (
                            <div key={stat.label} className="glass-premium border border-border-main rounded-[28px] px-6 py-5 flex flex-col gap-2 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                        <span className={stat.color}>{stat.icon}</span>
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">{stat.label}</p>
                                </div>
                                <p className="text-2xl font-black text-text-main leading-none tracking-tighter">{stat.value}</p>
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
                    placeholder="Buscar grupo, alumno o servicio..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 glass-premium border border-border-main rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 shadow-sm transition-all font-bold text-sm placeholder:text-text-muted"
                />
            </div>

            {/* Content */}
            <div className="space-y-12">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-24 gap-4">
                        <Loader2 className="animate-spin text-emerald-500" size={36} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Sincronizando entidades...</p>
                    </div>
                ) : (
                    <>
                        {/* GRUPS SECTION */}
                        <section>
                            <div className="flex items-center gap-4 mb-6">
                                <h2 className="text-lg font-black text-text-main uppercase tracking-widest italic flex items-center gap-2">
                                    <Users className="text-emerald-500" size={18} /> Grupos Reales
                                </h2>
                                <div className="flex-1 h-px bg-border-main" />
                            </div>

                            {filteredGroups.length === 0 ? (
                                <div className="text-center p-12 bg-white/5 border border-dashed border-border-main rounded-[40px]">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">No hay grupos configurados</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredGroups.map((group) => (
                                        <motion.div
                                            key={group.id}
                                            layoutId={`group-${group.id}`}
                                            className="group glass-premium border border-border-main rounded-[36px] overflow-hidden hover:shadow-2xl hover:shadow-black/40 transition-all duration-300"
                                        >
                                            <div className="p-7">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div 
                                                            className="w-3 h-10 rounded-full" 
                                                            style={{ backgroundColor: group.color || '#10b981' }} 
                                                        />
                                                        <div>
                                                            <h3 className="text-xl font-black text-text-main tracking-tight uppercase leading-tight italic">
                                                                {group.name}
                                                            </h3>
                                                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                                                {group.service?.name || 'Sin servicio'}
                                                                {group.subcategory && (
                                                                    <span className="text-text-muted/60 font-medium"> • {group.subcategory}</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button 
                                                            onClick={() => setGroupModal({ isOpen: true, group })}
                                                            className="p-2 text-text-muted hover:text-text-main hover:bg-white/5 rounded-xl transition-all"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => setDeleteModal({ isOpen: true, id: group.id, type: 'group' })}
                                                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {/* Capacity bar */}
                                                    {group.capacity && (
                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-text-muted">
                                                                <span>Ocupación Alumnos</span>
                                                                <span>{group.students.length} / {group.capacity}</span>
                                                            </div>
                                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-emerald-500 transition-all duration-500"
                                                                    style={{ width: `${Math.min(100, (group.students.length / group.capacity) * 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Students chips */}
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {group.students.slice(0, 5).map(s => (
                                                            <span key={s.id} className="px-2.5 py-1 bg-white/5 border border-border-main rounded-full text-[9px] font-bold text-text-muted">
                                                                {s.name.split(' ')[0]}
                                                            </span>
                                                        ))}
                                                        {group.students.length > 5 && (
                                                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black">
                                                                +{group.students.length - 5}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Schedules */}
                                                    <div className="pt-4 border-t border-border-main/50 space-y-2">
                                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Horarios Semanales</p>
                                                        {group.schedules.length === 0 ? (
                                                            <p className="text-[10px] text-text-muted italic">Sin horarios en el calendario</p>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-2">
                                                                {group.schedules.map(s => (
                                                                    <div key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-app border border-border-main rounded-xl text-[10px] font-black text-text-main">
                                                                        <span className="text-emerald-500">{DAY_SHORT[s.dayOfWeek]}</span>
                                                                        <span>{s.startTime}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-6 flex gap-2">
                                                    <button 
                                                        onClick={() => handleGeneralNotice(group.students)}
                                                        className="flex-1 py-3 bg-white/5 border border-border-main rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-main hover:bg-emerald-500 hover:text-black transition-all"
                                                    >
                                                        Avisar
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            // For attendance, we need a specific schedule. 
                                                            // If group has 1 schedule, use it. If more, let user pick?
                                                            // For now, if 1, use it.
                                                            if (group.schedules.length === 1) {
                                                                setAttendanceModal({ isOpen: true, schedule: group.schedules[0] });
                                                            } else {
                                                                showToast.success('Selecciona un horario desde el calendario para registrar asistencia');
                                                            }
                                                        }}
                                                        className="flex-1 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
                                                    >
                                                        Asistencia
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* STANDALONE SECTION */}
                        {standaloneSchedules.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <h2 className="text-lg font-black text-text-muted uppercase tracking-widest italic flex items-center gap-2">
                                        <Clock size={18} /> Clases Individuales
                                    </h2>
                                    <div className="flex-1 h-px bg-border-main" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredStandalone.map(s => (
                                        <div key={s.id} className="p-5 glass-premium border border-border-main rounded-[28px] flex justify-between items-center group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-border-main flex flex-col items-center justify-center">
                                                    <span className="text-[8px] font-black text-emerald-500 uppercase leading-none mb-1">{DAY_SHORT[s.dayOfWeek]}</span>
                                                    <span className="text-sm font-black text-text-main leading-none italic">{s.startTime}</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-text-main uppercase tracking-tight">
                                                        {s.title || (s.students || [s.student])[0]?.name || 'Clase'}
                                                    </h4>
                                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
                                                        {(s.students || [s.student]).length} Alumno/s
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => setAttendanceModal({ isOpen: true, schedule: s })}
                                                    className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteModal({ isOpen: true, id: s.id, type: 'schedule' })}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            <GroupModal
                isOpen={groupModal.isOpen}
                onClose={() => setGroupModal({ isOpen: false, group: null })}
                group={groupModal.group}
                onSuccess={loadData}
            />
            <AttendanceBulkModal
                isOpen={attendanceModal.isOpen}
                onClose={() => setAttendanceModal({ isOpen: false, schedule: null })}
                schedule={attendanceModal.schedule}
                onSuccess={loadData}
            />
            <ClassParticipantsModal
                isOpen={participantsModal.isOpen}
                onClose={() => setParticipantsModal({ isOpen: false, schedule: null })}
                schedule={participantsModal.schedule}
                onSuccess={loadData}
            />
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title={deleteModal.type === 'group' ? "Eliminar Grupo" : "Eliminar Clase"}
                message={deleteModal.type === 'group' ? "¿Estás seguro de eliminar este grupo? Los horarios asociados se mantendrán como clases individuales." : "¿Estás seguro de eliminar esta clase?"}
                confirmText="Eliminar"
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ isOpen: false, id: null, type: 'group' })}
                variant="danger"
            />
            <WhatsAppPreviewModal
                isOpen={whatsappModal.isOpen}
                onClose={() => setWhatsappModal({ isOpen: false, students: [], template: '' })}
                students={whatsappModal.students}
                user={user}
                isPro={isPro}
                initialGoal={whatsappModal.goal}
                customTemplate={whatsappModal.template}
            />
        </Layout>
    );
};

export default Classes;
