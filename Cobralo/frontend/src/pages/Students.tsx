import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag } from 'lucide-react';
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
            const [s] = await Promise.all([api.getServices()]);
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
        upsell: false
    });

    const openModal = (type: string, student: Student | null = null) => {
        if (type === 'adjustment') {
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
        else {
            setModals(prev => ({ ...prev, [type]: { isOpen: true, student } }));
        }
    };

    const closeModal = (type: string) => {
        if (type === 'create') setModals(prev => ({ ...prev, create: false }));
        else if (type === 'adjustment') setModals(prev => ({ ...prev, adjustment: false }));
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

    return (
        <Layout fitted scrollable={false}>
            <div className="flex flex-col h-full min-h-0 space-y-6 w-full overflow-y-auto custom-scrollbar pr-1 -mr-1">
                {/* Header / Stats */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter uppercase italic flex items-center gap-4">
                            ALUMNOS <span className="text-xs font-black px-2 py-1 bg-primary-main/10 text-primary-main rounded-lg not-italic shadow-lg shadow-primary-main/5 animate-pulse">{totalStudents}</span>
                        </h1>
                        <p className="text-sm font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">Gestioná tu academia con precisión PRO</p>
                    </div>
                </div>

                {/* Mass Actions Bar */}
                {selectedIds.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap items-center gap-3 p-4 bg-primary-main rounded-[24px] shadow-lg shadow-primary-main/20 text-white"
                    >
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            {selectedIds.length} seleccionados
                        </div>
                        <div className="h-4 w-px bg-white/20 hidden md:block" />
                        <button 
                            onClick={() => openModal('adjustment')}
                            className="flex items-center gap-2 px-4 py-1.5 bg-white text-primary-main rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                        >
                            <TrendingUp size={14} /> Ajustar Cuotas
                        </button>
                        <button 
                            onClick={() => openModal('whatsapp')}
                            className="flex items-center gap-2 px-4 py-1.5 bg-white/20 hover:bg-white text-white hover:text-primary-main rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            <ShoppingBag size={14} /> Mensaje Masivo
                        </button>
                        <button 
                            onClick={() => setSelectedIds([])}
                            className="ml-auto text-[10px] font-black uppercase tracking-widest hover:underline"
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
