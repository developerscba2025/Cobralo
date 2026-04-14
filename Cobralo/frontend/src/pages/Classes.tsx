import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    BookOpen, Users, Clock, Send, CheckCircle2, 
    Search, Trash2, Plus, Calendar as CalendarIcon,
    Loader2, UserPlus
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

const Classes = () => {
    const { user, isPro } = useAuth();
    const [classes, setClasses] = useState<UnifiedSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [attendanceModal, setAttendanceModal] = useState<{ isOpen: boolean; schedule: UnifiedSchedule | null }>({
        isOpen: false,
        schedule: null
    });
    const [participantsModal, setParticipantsModal] = useState<{ isOpen: boolean; schedule: UnifiedSchedule | null }>({
        isOpen: false,
        schedule: null
    });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false,
        id: null
    });
    const [whatsappModal, setWhatsappModal] = useState<{ isOpen: boolean; students: any[]; template: string }>({
        isOpen: false,
        students: [],
        template: ''
    });

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        setIsLoading(true);
        try {
            const data = await api.getAllSchedules();
            setClasses(data);
        } catch (error) {
            console.error('Error loading classes:', error);
            showToast.error('Error al cargar los grupos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotifyGroup = (schedule: UnifiedSchedule) => {
        const participants = schedule.students || (schedule.student ? [schedule.student] : []);
        if (participants.length === 0) return;

        const time = schedule.startTime;
        const msg = `Hola {alumno}! Te recuerdo nuestro grupo de {servicio} hoy a las ${time} hs. ¡Nos vemos!`;
        
        setWhatsappModal({
            isOpen: true,
            students: participants,
            template: msg
        });
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

    const removeTildes = (str: string) => (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const filteredClasses = classes.filter(c => {
        const studentNames = (c.students || [c.student]).map(s => s?.name || '').join(' ');
        const lowerSearch = removeTildes(searchTerm);
        return removeTildes(studentNames).includes(lowerSearch) || 
               removeTildes(c.startTime).includes(lowerSearch) ||
               removeTildes(DAYS[c.dayOfWeek === 7 ? 0 : c.dayOfWeek]).includes(lowerSearch);
    });

    // Grouping by day
    const groupedByDay: Record<number, UnifiedSchedule[]> = {};
    filteredClasses.forEach(c => {
        const safeDay = c.dayOfWeek === 7 ? 0 : c.dayOfWeek;
        if (!groupedByDay[safeDay]) groupedByDay[safeDay] = [];
        groupedByDay[safeDay].push(c);
    });

    // Sort by day (starting Monday=1)
    const sortedDays = Object.keys(groupedByDay).map(Number).sort((a, b) => {
        if (a === 0) return 1;
        if (b === 0) return -1;
        return a - b;
    });

    const navigate = useNavigate();

    return (
        <Layout>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-text-main tracking-tighter uppercase">Mis Grupos</h1>
                    <p className="text-text-muted font-medium tracking-tight">
                        Gestiona tus horarios grupales y asistencia centralizada
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/app/calendar', { state: { openModal: true } })}
                        className="w-full md:w-auto bg-primary-main hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-glow transition items-center gap-2 flex justify-center"
                    >
                        <Plus size={18} /> Nuevo Grupo en Agenda
                    </button>
                </div>
            </header>

            <div className="relative max-w-full md:max-w-md mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por alumno, día o servicio..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-surface dark:bg-bg-soft border border-border-main rounded-2xl outline-none focus:ring-2 focus:ring-primary-main/20 shadow-sm transition-all font-bold"
                />
            </div>

            <div className="space-y-12">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 className="animate-spin text-primary-main" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Cargando tus grupos...</p>
                    </div>
                ) : sortedDays.length === 0 ? (
                    <div className="text-center p-8 md:p-20 bg-surface dark:bg-bg-soft rounded-[40px] border-2 border-dashed border-border-main">
                        <BookOpen className="mx-auto mb-4 text-zinc-300 dark:text-emerald-500/20" size={60} />
                        <h3 className="text-xl font-bold text-text-main mb-2">No se encontraron grupos</h3>
                        <p className="text-text-muted max-w-xs mx-auto mb-8">Prueba ajustando tu búsqueda o crea un nuevo grupo desde la Agenda.</p>
                        
                        <button
                            onClick={() => navigate('/app/calendar', { state: { openModal: true } })}
                            className="inline-flex items-center gap-2 bg-primary-main hover:bg-green-600 text-white px-8 py-4 rounded-[20px] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary-glow/40 transition-all hover:-translate-y-0.5 active:scale-95"
                        >
                            <Plus size={20} /> Crear Nuevo Grupo
                        </button>
                    </div>
                ) : (
                    sortedDays.map(dayNum => (
                        <div key={dayNum} className="space-y-4">
                            <h2 className="text-[10px] font-black text-primary-main uppercase tracking-[0.3em] ml-4 flex items-center gap-2">
                                <CalendarIcon size={14} /> {DAYS[dayNum]}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {groupedByDay[dayNum].sort((a,b) => {
                                    const timeA = (a.startTime || '').replace(/^(\d:)/, '0$1');
                                    const timeB = (b.startTime || '').replace(/^(\d:)/, '0$1');
                                    return timeA.localeCompare(timeB);
                                }).map(schedule => {
                                    const participants = schedule.students || (schedule.student ? [schedule.student] : []);
                                    return (
                                        <motion.div
                                            key={schedule.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="group relative bg-surface dark:bg-bg-soft border border-border-main rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:border-primary-main/30 transition-all overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-main opacity-20 group-hover:opacity-100 transition-opacity" />
                                            
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Clock size={14} className="text-primary-main" />
                                                        <span className="text-xl font-black text-text-main tabular-nums">
                                                            {schedule.startTime} - {schedule.endTime}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-80">
                                                        {participants[0]?.service_name || 'Servicio General'}
                                                    </span>
                                                    {schedule.capacity && (
                                                        <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-bg-dark border border-border-main rounded-xl w-fit">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${participants.length >= schedule.capacity ? 'bg-amber-500 animate-pulse' : 'bg-primary-main'}`} />
                                                            <span className="text-[9px] font-black uppercase tracking-tighter text-text-main">
                                                                Cupo: {participants.length} / {schedule.capacity}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => setParticipantsModal({ isOpen: true, schedule })}
                                                        className="p-2 text-zinc-400 hover:text-primary-main hover:bg-primary-main/10 rounded-xl transition-all"
                                                        title="Gestionar Integrantes"
                                                    >
                                                        <UserPlus size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeleteModal({ isOpen: true, id: schedule.id })}
                                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                                                        title="Eliminar Grupo"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mb-8">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Users size={14} className="text-text-muted" />
                                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                        {participants.length} Participantes
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {participants.map(p => (
                                                        <div 
                                                            key={p.id}
                                                            className="px-3 py-1 bg-bg-app dark:bg-bg-dark border border-border-main rounded-full text-xs font-bold text-text-main flex items-center gap-2"
                                                        >
                                                            <div className="w-2 h-2 rounded-full bg-primary-main animate-pulse" />
                                                            {p.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => setAttendanceModal({ isOpen: true, schedule })}
                                                    disabled={participants.length === 0}
                                                    className="flex items-center justify-center gap-2 py-3 bg-primary-main text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-glow transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                                >
                                                    <CheckCircle2 size={16} /> Asistencia
                                                </button>
                                                <button
                                                    onClick={() => handleNotifyGroup(schedule)}
                                                    className="flex items-center justify-center gap-2 py-3 bg-surface dark:bg-bg-dark border border-border-main text-text-main rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-50 transition-all active:scale-95"
                                                >
                                                    <Send size={16} /> Notificar
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

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
                message="¿Estás seguro de eliminar este grupo para todos los alumnos? Esta acción no se puede deshacer."
                confirmText="Eliminar Grupo"
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
