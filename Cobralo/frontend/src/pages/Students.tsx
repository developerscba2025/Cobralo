import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Users, CheckCircle2, Clock } from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import { api, type Student, type UserService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StudentFilters from '../components/students/StudentFilters';
import StudentTable from '../components/students/StudentTable';
import StudentModalsContainer from '../components/students/StudentModalsContainer';
import Layout from '../components/Layout';
import SkeletonCard from '../components/SkeletonCard';

const Students = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [userServices, setUserServices] = useState<UserService[]>([]);

    const fetchData = async () => {
        try {
            const [data] = await Promise.all([
                api.getStudents()
            ]);
            setStudents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading data:", error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const loadExtras = async () => {
        try {
            const s = await api.getServices();
            setUserServices(Array.isArray(s) ? s : []);
        } catch (err) {
            console.error('Error loading extras', err);
        }
    };

    useEffect(() => {
        loadExtras();
        fetchData();
    }, []);

    const refreshServices = async () => {
        await loadExtras();
    };

    const {
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        serviceFilter, setServiceFilter,
        selectedIds, setSelectedIds,
        filteredStudents,
        services,
        toggleSelect,
        toggleAll,
        handleTogglePayment,
        handleExportExcel
    } = useStudents(Array.isArray(students) ? students : [], fetchData);

    // Modal States
    const [modals, setModals] = useState({
        create: false,
        edit: { isOpen: false, student: null as Student | null },
        schedule: { isOpen: false, student: null as Student | null },
        history: { isOpen: false, student: null as Student | null },
        notes: { isOpen: false, student: null as Student | null },
        delete: { isOpen: false, student: null as Student | null },
        renew: { isOpen: false, student: null as Student | null },
        whatsapp: { isOpen: false, student: null as Student | null },
        adjustment: false,
        bulkMessage: false,
        upsell: false
    });

    const openModal = (type: string, student: Student | null = null) => {
        if (type === 'adjustment' || type === 'bulkMessage') {
            if (selectedIds.length === 0) return;
        }

        if (type === 'whatsapp') {
            // If it's a mass action (no student passed), check selection
            if (!student && selectedIds.length === 0) return;
            setModals(prev => ({ ...prev, whatsapp: { isOpen: true, student } }));
            return;
        }
        else if (type === 'adjustment') {
            if (user?.plan === 'BÁSICO') setModals(prev => ({ ...prev, upsell: true }));
            else setModals(prev => ({ ...prev, adjustment: true }));
        }
        else if (type === 'bulkMessage') {
            setModals(prev => ({ ...prev, bulkMessage: true }));
        }
        else if (type === 'create') {
            setModals(prev => ({ ...prev, create: true }));
        }
        else {
            setModals(prev => ({ ...prev, [type]: { isOpen: true, student } }));
        }
    };

    const closeModal = (type: string) => {
        if (type === 'create') setModals(prev => ({ ...prev, create: false }));
        else if (type === 'adjustment') setModals(prev => ({ ...prev, adjustment: false }));
        else if (type === 'bulkMessage') setModals(prev => ({ ...prev, bulkMessage: false }));
        else if (type === 'upsell') setModals(prev => ({ ...prev, upsell: false }));
        else {
            setModals(prev => ({ ...prev, [type]: { isOpen: false, student: null } }));
        }
    };

    const selectedStudents = (Array.isArray(students) ? students : []).filter(s => selectedIds.includes(s.id));

    if (loading) {
        return (
            <Layout fitted>
                <div className="space-y-6">
                    <SkeletonCard variant="stat" count={2} />
                    <div className="card-premium overflow-hidden">
                        <table className="w-full">
                            <tbody>
                                <SkeletonCard variant="row" count={5} />
                            </tbody>
                        </table>
                    </div>
                </div>
            </Layout>
        );
    }

    // Stats
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'paid').length;
    const pendingStudents = students.filter(s => s.status === 'pending').length;

    return (
        <Layout fitted scrollable={false}>
            <div className="flex flex-col h-full min-h-0 space-y-8 w-full overflow-y-auto custom-scrollbar pr-1 -mr-1">
                {/* Header / Stats */}
                <header className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Users size={12} /> Módulo de Alumnos
                        </p>
                        <h1 className="text-4xl md:text-5xl font-black text-text-main tracking-tight uppercase leading-none">
                            Directorio
                        </h1>
                        <p className="text-sm font-medium text-text-muted mt-2 tracking-tight">
                            Gestión integral de clientes, pagos y suscripciones
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-2 px-6 py-5 glass-emerald rounded-[28px] min-w-[120px] transition-all hover:scale-[1.02]">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                    <Users size={12} className="text-emerald-500" />
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500/70">Totales</p>
                            </div>
                            <p className="font-black text-text-main text-3xl leading-none tracking-tighter">{totalStudents}</p>
                        </div>
                        <div className="flex flex-col gap-2 px-6 py-5 glass-emerald rounded-[28px] min-w-[120px] transition-all hover:scale-[1.02]">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500/70">Activos</p>
                            </div>
                            <p className="font-black text-text-main text-3xl leading-none tracking-tighter">{activeStudents}</p>
                        </div>
                        <div className="flex flex-col gap-2 px-6 py-5 bg-amber-500/5 dark:bg-amber-500/[0.03] backdrop-blur-2xl border border-amber-500/20 rounded-[28px] min-w-[120px] transition-all hover:scale-[1.02]">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                    <Clock size={12} className="text-amber-500" />
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-500/70">Deuda</p>
                            </div>
                            <p className="font-black text-amber-500 text-3xl leading-none tracking-tighter">{pendingStudents}</p>
                        </div>
                    </div>
                </header>

                {/* Mass Actions Bar */}
                {selectedIds.length > 0 && (
                    <motion.div 
                        className="flex flex-wrap items-center gap-3 p-4 bg-emerald-500 rounded-[24px] shadow-lg shadow-emerald-500/20 text-text-main"
                    >
                        <div className="flex items-center gap-2 px-3 py-1 bg-black/10 rounded-[12px] text-[10px] font-black uppercase tracking-wider">
                            {selectedIds.length} seleccionados
                        </div>
                        <div className="h-4 w-px bg-black/20 hidden md:block" />
                        <button 
                            onClick={() => openModal('adjustment')}
                            className="flex items-center gap-2 px-4 py-1.5 bg-black text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                        >
                            <TrendingUp size={14} /> Ajustar Cuotas
                        </button>
                        <button 
                            onClick={() => openModal('bulkMessage')}
                            className="flex items-center gap-2 px-4 py-1.5 bg-black/10 hover:bg-black text-text-main hover:text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            <ShoppingBag size={14} /> Mensaje Masivo
                        </button>
                        <button 
                            onClick={() => setSelectedIds([])}
                            className="ml-auto text-[10px] font-black uppercase tracking-widest hover:bg-black/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Deshacer
                        </button>
                    </motion.div>
                )}

                {/* Filters & Control */}
                <StudentFilters 
                    searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                    serviceFilter={serviceFilter} setServiceFilter={setServiceFilter}
                    services={services}
                    onNewStudent={() => openModal('create')}
                    onExport={handleExportExcel}
                    onWhatsAppMass={() => openModal('whatsapp')}
                    selectedCount={selectedIds.length}
                />

                {/* Main Table */}
                <StudentTable 
                    students={filteredStudents}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onToggleAll={toggleAll}
                    onTogglePayment={handleTogglePayment}
                    onOpenModals={openModal}
                    currency={user?.currency || '$'}
                />

                {/* Modals Container */}
                <StudentModalsContainer 
                    modals={modals}
                    onClose={closeModal}
                    onAction={fetchData}
                    selectedStudents={selectedStudents}
                    selectedIds={selectedIds}
                    allStudents={students}
                    user={user}
                    userServices={userServices}
                    refreshServices={refreshServices}
                />
            </div>
        </Layout>
    );
};

export default Students;
