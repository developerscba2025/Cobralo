import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { api, type UserService } from '../services/api';
import type { Student } from '../services/api';
import { showToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import QRPayment from '../components/QRPayment';
import { 
    Search, Plus, Check, Trash2, Edit3, MessageCircle, Download, 
    Filter, X, StickyNote, Send, Clock, Calendar as CalendarIcon, Users, Star
} from 'lucide-react';
import StudentNotes from '../components/StudentNotes';
import ScheduleModal from '../components/ScheduleModal';
import AttendanceModal from '../components/AttendanceModal';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';

const Students = () => {
    const { user, isPro } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; studentId: number | null }>({
        isOpen: false,
        studentId: null
    });
    const [massWaModal, setMassWaModal] = useState(false);
    const [formStep, setFormStep] = useState(1);

    // QR Modal
    const [qrModal, setQrModal] = useState<{ isOpen: boolean; student: Student | null }>({
        isOpen: false,
        student: null
    });

    // Attendance Modal
    const [attendanceModal, setAttendanceModal] = useState<{ isOpen: boolean; student: Student | null }>({
        isOpen: false,
        student: null
    });

    // Schedule Modal
    const [scheduleModal, setScheduleModal] = useState<{ isOpen: boolean; studentId: number; studentName: string }>({
        isOpen: false,
        studentId: 0,
        studentName: ''
    });

    // Notes panel
    const [notesPanel, setNotesPanel] = useState<{ isOpen: boolean; studentId: number; studentName: string }>({
        isOpen: false,
        studentId: 0,
        studentName: ''
    });

    // Filters
    const [filterService, setFilterService] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('');
    const [userServices, setUserServices] = useState<UserService[]>([]);

    // Form
    const [formData, setFormData] = useState<Partial<Student>>({
        name: '',
        phone: '',
        service_name: 'General',
        price_per_hour: 0,
        classes_per_month: 4,
        payment_method: 'Efectivo',
        deadline_day: 10,
        surcharge_percentage: 10,
        planType: 'MONTHLY',
        credits: 0,
        sub_category: '',
        billing_alias: '',
        class_duration_min:60
    });

    // Form Schedules
    const [formSchedules, setFormSchedules] = useState<{ dayOfWeek: number; startTime: string; endTime: string }[]>([]);
    const [newScheduleDay, setNewScheduleDay] = useState(1);
    const [newScheduleTime, setNewScheduleTime] = useState('14:00');

    const handleAddSchedule = (e: React.MouseEvent) => {
        e.preventDefault();
        // Calc end time + custom duration
        const [h, m] = newScheduleTime.split(':').map(Number);
        const duration = Number(formData.class_duration_min) || 60;
        const endD = new Date();
        endD.setHours(h, m + duration);
        const endTime = `${endD.getHours().toString().padStart(2, '0')}:${endD.getMinutes().toString().padStart(2, '0')}`;

        setFormSchedules([...formSchedules, { dayOfWeek: newScheduleDay, startTime: newScheduleTime, endTime }]);
    };

    const handleRemoveSchedule = (index: number) => {
        setFormSchedules(formSchedules.filter((_, i) => i !== index));
    };

    const defaultServices = ['General', 'Piano', 'Inglés', 'Matemáticas', 'Guitarra', 'Física', 'Química', 'Lengua', 'Geografía', 'Historia', 'Biología', 'Informática'];
    const services = [...new Set([...defaultServices, ...userServices.map(s => s.name), ...students.map(s => s.service_name).filter(Boolean)])].sort();
    const paymentMethods = [...new Set(students.map(s => s.payment_method).filter(Boolean))];

    const calculateAmount = (pph: number, classes: number, duration: number = 60) => {
        const pricePerMin = pph / 60;
        return Math.round(pricePerMin * duration * classes);
    };

    useEffect(() => {
        loadStudents();
        loadUserServices();
    }, []);

    const loadUserServices = async () => {
        try {
            const data = await api.getServices();
            setUserServices(data);
        } catch (error) {
            console.error("Error loading user services", error);
        }
    };

    const loadStudents = async () => {
        try {
            const data = await api.getStudents();
            setStudents(data);
        } catch (error) {
            console.error("Error loading students", error);
            showToast.error('Error al cargar alumnos');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        // Prefill with first available service if possible
        const firstService = userServices.length > 0 ? userServices[0] : null;
        
        setFormData({
            name: '', 
            phone: '', 
            service_name: firstService ? firstService.name : (user?.defaultService || 'General'),
            price_per_hour: firstService ? Number(firstService.defaultPrice) : (Number(user?.defaultPrice) || 0), 
            classes_per_month: 4,
            payment_method: 'Efectivo', 
            deadline_day: 10, 
            surcharge_percentage: user?.defaultSurcharge || 10,
            planType: 'MONTHLY', 
            credits: 0,
            sub_category: '',
            billing_alias: user?.bizAlias || '',
            class_duration_min: 60
        });
        setFormSchedules([]);
        setIsEditing(false);
        setEditingId(null);
    };

    const handleOpenCreate = () => {
        // Enforce services check
        if (userServices.length === 0) {
            showToast.error('Primero debés definir tus Servicios Ofrecidos en Configuración.');
            return;
        }

        const studentLimit = user?.plan === 'PRO' ? Infinity : (user?.plan === 'INITIAL' ? 10 : 5);
        if (!isPro || students.length >= studentLimit) {
            const limitMsg = user?.plan === 'INITIAL' 
                ? `Límite de 10 alumnos alcanzado en el Plan Inicial.`
                : `Límite de 5 alumnos alcanzado.`;
            
            showToast.error(limitMsg);
            return;
        }
        resetForm();
        setFormStep(1);
        setIsModalOpen(true);
    };

    const handleServiceChange = (name: string) => {
        const found = userServices.find(s => s.name.toLowerCase() === name.toLowerCase());
        setFormData(prev => ({ 
            ...prev, 
            service_name: name,
            price_per_hour: found ? Number(found.defaultPrice) : prev.price_per_hour
        }));
    };

    const handleOpenEdit = (student: Student) => {
        setFormData({
            name: student.name,
            phone: student.phone,
            service_name: student.service_name,
            price_per_hour: student.price_per_hour,
            classes_per_month: student.classes_per_month,
            payment_method: student.payment_method,
            deadline_day: student.deadline_day,
            surcharge_percentage: student.surcharge_percentage,
            planType: student.planType || 'MONTHLY',
            credits: student.credits || 0,
            sub_category: student.sub_category || '',
            billing_alias: student.billing_alias || user?.bizAlias || '',
            class_duration_min: student.class_duration_min || 60
        });

        // Load schedules if present
        if (student.schedules && Array.isArray(student.schedules)) {
            setFormSchedules(student.schedules.map(s => ({
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime
            })));
        } else {
            setFormSchedules([]);
        }

        setIsEditing(true);
        setEditingId(student.id);
        setFormStep(1);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = formData.planType === 'PACK'
            ? calculateAmount(formData.price_per_hour || 0, 1, formData.class_duration_min) * (formData.credits || 0)
            : calculateAmount(formData.price_per_hour || 0, formData.classes_per_month || 0, formData.class_duration_min);

        const payload: any = {
            ...formData,
            amount,
            class_duration_min: formData.class_duration_min || 60,
            due_day: 1,
            schedules: formSchedules
        };

        try {
            console.log('Sending student creation payload:', payload);
            if (isEditing && editingId) {
                await api.updateStudent(editingId, payload);
                showToast.success('Alumno actualizado');
            } else {
                // Check limit before creating
                const studentLimit = user?.plan === 'PRO' ? Infinity : (user?.plan === 'INITIAL' ? 10 : 5);
                if (students.length >= studentLimit) {
                    showToast.error(`Límite de ${studentLimit} alumnos alcanzado.`);
                    return;
                }
                await api.createStudent(payload);
                showToast.success('Alumno creado');
            }
            setIsModalOpen(false);
            resetForm();
            loadStudents();
        } catch {
            showToast.error(isEditing ? 'Error al actualizar' : 'Error al crear alumno');
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.studentId) return;
        try {
            await api.deleteStudent(deleteModal.studentId);
            showToast.success('Alumno eliminado');
            loadStudents();
        } catch {
            showToast.error('Error al eliminar');
        } finally {
            setDeleteModal({ isOpen: false, studentId: null });
        }
    };

    const handleToggle = async (student: Student) => {
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
            } else {
                showToast.success('Estado actualizado');
            }

            loadStudents();
        } catch {
            showToast.error('Error al actualizar estado');
        }
    };


    const handleMassWhatsApp = async () => {
        try {
            const pending = await api.getPendingContacts();
            if (pending.length === 0) {
                showToast.success('No hay alumnos pendientes');
                setMassWaModal(false);
                return;
            }

            const defaultTemplate = `Hola {alumno}! Te saluda {negocio}. Te recuerdo el pago de {servicio} por ${user?.currency || '$'}{monto}. Mi alias: {alias}`;
            const template = isPro ? (user?.reminderTemplate || defaultTemplate) : defaultTemplate;

            pending.forEach((s, i) => {
                const alias = user?.bizAlias || 'Alias';

                const amount = Number(s.amount) || 0;
                const serviceName = (s.service_name === 'General' && s.sub_category) ? s.sub_category : (s.service_name || '');
                const message = template
                    .replace('{alumno}', s.name || '')
                    .replace('{monto}', amount.toLocaleString('es-AR'))
                    .replace('{negocio}', user?.bizName || 'Tu Profe')
                    .replace('{servicio}', serviceName)
                    .replace('{subcategoria}', s.sub_category || '')
                    .replace('{metodo}', s.payment_method || '')
                    .replace('{vencimiento}', (s.deadline_day || '').toString())
                    .replace('{alias}', s.billing_alias || alias);

                setTimeout(() => {
                    window.open(`https://wa.me/${s.phone}?text=${encodeURIComponent(message)}`, '_blank');
                }, i * 500);
            });

            showToast.success(`Abriendo ${pending.length} conversaciones...`);
        } catch {
            showToast.error('Error al obtener contactos');
        } finally {
            setMassWaModal(false);
        }
    };

    const handleRequestTestimonial = async (student: Student) => {
        if (!student.phone) {
            showToast.error('Este alumno no tiene número guardado.');
            return;
        }

        let link = '';
        const now = new Date();
        const expires = user?.ratingTokenExpires ? new Date(user.ratingTokenExpires) : new Date(0);

        if (user?.ratingToken && expires > now) {
            link = `${window.location.origin}/rating/teacher/${user.ratingToken}`;
        } else {
            try {
                const data = await api.generateRatingLink();
                link = `${window.location.origin}/rating/teacher/${data.token}`;
            } catch (error) {
                showToast.error('Error al generar el link de testimonio');
                return;
            }
        }

        const message = `Hola ${student.name}, quería pedirte unos minutos para dejar una calificación y testimonio sobre las clases. Es 100% anónimo si así lo prefieres: ${link}`;
        window.open(`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    // Filter students
    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesService = !filterService || s.service_name === filterService;
        const matchesStatus = !filterStatus || s.status === filterStatus;
        const matchesPayment = !filterPaymentMethod || s.payment_method === filterPaymentMethod;
        return matchesSearch && matchesService && matchesStatus && matchesPayment;
    });


    const exportToCSV = () => {
        if (!isPro) {
            showToast.error('Función no disponible en el plan actual');
            return;
        }

        const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        const headers = [
            'Alumno', 'WhatsApp', 'Servicio', 'Subcategoría', 'Plan', 
            'Horarios', 'Créditos', 'Cuota', 'Día Vencimiento', 
            'Método de Pago', 'Estado'
        ];

        const rows = filteredStudents.map(s => {
            const schedulesStr = (s.schedules || [])
                .map(sc => `${DAYS[sc.dayOfWeek]} ${sc.startTime}`)
                .join(' | ');

            return [
                s.name,
                s.phone || '',
                s.service_name || '',
                s.sub_category || '',
                s.planType || 'MONTHLY',
                s.schedules?.length ? schedulesStr : 'Sin definir',
                s.planType === 'PACK' ? (s.credits || 0).toString() : '-',
                `${user?.currency || '$'}${Number(s.amount).toLocaleString('es-AR')}`,
                s.deadline_day?.toString() || '10',
                s.payment_method || '',
                s.status === 'paid' ? 'Cobrado' : 'Pendiente'
            ];
        });

        // Robust CSV formatting with proper quoting and escaping
        const formatRow = (row: string[]) => 
            row.map(val => `"${val.replace(/"/g, '""')}"`).join(',');

        const csvContent = "\uFEFF" + [headers, ...rows].map(formatRow).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const dateStr = new Date().toISOString().split('T')[0];
        
        link.href = URL.createObjectURL(blob);
        link.download = `Cobralo_Reporte_Alumnos_${dateStr}.csv`;
        link.click();
        
        showToast.success('Reporte exportado con éxito');
    };

    // WhatsApp link generator
    const generateWaLink = (student: Student) => {
        const baseAmount = Number(student.amount) || 0;
        const alias = student.billing_alias || user?.bizAlias || 'Alias';
        const defaultTemplate = `Hola {alumno}! Te saluda {negocio}. Te envío el link de pago de {servicio} por un total de {moneda}{monto}. Mi alias es: {alias}. ¡Muchas gracias!`;
        const template = isPro ? (user?.reminderTemplate || defaultTemplate) : defaultTemplate;

        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const currentMonth = months[new Date().getMonth()];
        const serviceName = (student.service_name === 'General' && student.sub_category) ? student.sub_category : (student.service_name || '');
        const paymentLink = `${window.location.origin}/p/${student.id}`;

        const message = template
            .replace(/{alumno}/g, student.name)
            .replace(/{monto}/g, baseAmount.toLocaleString('es-AR'))
            .replace(/{negocio}/g, user?.bizName || 'Tu Profe')
            .replace(/{servicio}/g, serviceName)
            .replace(/{subcategoria}/g, student.sub_category || '')
            .replace(/{metodo}/g, student.payment_method || '')
            .replace(/{vencimiento}/g, (student.deadline_day || '').toString())
            .replace(/{alias}/g, alias)
            .replace(/{mes}/g, currentMonth)
            .replace(/{moneda}/g, user?.currency || '$')
            .replace(/{link}/g, paymentLink);

        return `https://wa.me/${student.phone}?text=${encodeURIComponent(message)}`;
    };

    const formatSchedules = (schedules?: any[]) => {
        const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        if (!schedules || schedules.length === 0) return <span className="text-slate-300 dark:text-slate-600 italic text-[10px]">Sin horario</span>;
        return (
            <div className="flex flex-col gap-1">
                {schedules.map(s => (
                    <span key={s.id} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md text-slate-500 dark:text-slate-300 whitespace-nowrap w-fit">
                        {DAYS_SHORT[s.dayOfWeek]} {s.startTime}
                    </span>
                ))}
            </div>
        );
    };

    const hasActiveFilters = filterService || filterStatus || filterPaymentMethod;
    const pendingCount = students.filter(s => s.status === 'pending').length;
    const paidCount = students.filter(s => s.status === 'paid').length;

    return (
        <Layout>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Gestión de Alumnos</h1>
                    <p className="text-text-muted font-medium">
                        {students.length} alumnos · {paidCount} cobrados · {pendingCount} pendientes
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setMassWaModal(true)}
                        disabled={pendingCount === 0}
                        className="bg-primary-main hover:bg-green-600 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-primary-glow"
                    >
                        <Send size={18} /> WhatsApp ({pendingCount})
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-white px-4 py-3 rounded-xl font-bold transition flex items-center gap-2 group relative"
                    >
                        <Download size={18} /> CSV
                    </button>
                    <button
                        onClick={handleOpenCreate}
                        className="bg-primary-main hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary-glow transition flex items-center gap-2"
                    >
                        <Plus size={18} /> Nuevo
                    </button>
                </div>
            </header>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-bg-soft-app text-text-main border border-border-emerald rounded-xl outline-none focus:ring-2 focus:ring-primary-main/20 shadow-sm transition transition-colors"
                    />
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <Filter size={18} className="text-zinc-400" />

                    <select
                        value={filterService}
                        onChange={e => setFilterService(e.target.value)}
                        className="px-3 py-2 bg-surface text-text-main rounded-lg border border-border-main text-sm outline-none font-bold uppercase text-[10px] tracking-widest shadow-sm"
                    >
                        <option value="">Servicio</option>
                        {services.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-3 py-2 bg-surface text-text-main rounded-lg border border-border-main text-sm outline-none font-bold uppercase text-[10px] tracking-widest shadow-sm"
                    >
                        <option value="">Estado</option>
                        <option value="paid">Cobrado</option>
                        <option value="pending">Pendiente</option>
                    </select>

                    <select
                        value={filterPaymentMethod}
                        onChange={e => setFilterPaymentMethod(e.target.value)}
                        className="px-3 py-2 bg-surface text-text-main rounded-lg border border-border-main text-sm outline-none font-bold uppercase text-[10px] tracking-widest shadow-sm"
                    >
                        <option value="">Método</option>
                        {paymentMethods.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>

                    {hasActiveFilters && (
                        <button
                            onClick={() => { setFilterService(''); setFilterStatus(''); setFilterPaymentMethod(''); }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Table / Cards View */}
            <div className="space-y-4">
                {/* Desktop view */}
                <div className="hidden md:block card-premium overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-bg-app border-b border-border-main">
                                <tr>
                                    <th className="p-4 label-premium">Alumno</th>
                                    <th className="p-4 label-premium">Servicio</th>
                                    <th className="p-4 label-premium">Horarios</th>
                                    <th className="p-4 label-premium">Cuota</th>
                                    <th className="p-4 label-premium">Estado</th>
                                    <th className="p-4 label-premium text-right pr-8">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <SkeletonCard variant="row" count={5} />
                                ) : filteredStudents.length === 0 ? (
                                    <tr><td colSpan={6} className="p-10">
                                        <EmptyState 
                                            icon={Users}
                                            title="No hay alumnos"
                                            description="No se encontraron alumnos con los filtros actuales o aún no has cargado ninguno."
                                        />
                                    </td></tr>
                                ) : filteredStudents.map(student => (
                                    <tr key={student.id} className="border-b border-border-main/40 hover:bg-bg-app transition transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <p className="font-bold text-text-main leading-tight">{student.name}</p>
                                                <p className="label-premium !tracking-widest mt-0.5">{student.phone}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-text-muted">{student.service_name}</span>
                                                {student.sub_category && (
                                                    <span className="text-[10px] text-primary-main font-bold uppercase tracking-tight">{student.sub_category}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {formatSchedules(student.schedules)}
                                        </td>
                                        <td className="p-4 font-bold text-green-700 dark:text-green-400">{user?.currency || '$'}{Number(student.amount).toLocaleString('es-AR')}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${student.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-600/10 dark:text-green-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                                                    {student.status === 'paid' ? 'Cobrado' : 'Pendiente'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => handleToggle(student)} className={`p-2 rounded-lg transition ${student.status === 'paid' ? 'text-primary-main bg-primary-main/10 transition-colors shadow-sm' : 'text-zinc-400 hover:text-primary-main hover:bg-primary-main/10'}`} title="Marcar pago">
                                                    <Check size={16} />
                                                </button>
                                                <button onClick={() => setNotesPanel({ isOpen: true, studentId: student.id, studentName: student.name })} className="p-2 rounded-lg text-zinc-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 transition" title="Notas">
                                                    <StickyNote size={16} />
                                                </button>
                                                <button onClick={() => setScheduleModal({ isOpen: true, studentId: student.id, studentName: student.name })} className="p-2 rounded-lg text-zinc-400 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition" title="Horarios">
                                                    <Clock size={16} />
                                                </button>
                                                <button onClick={() => setAttendanceModal({ isOpen: true, student })} className="p-2 rounded-lg text-zinc-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition" title="Asistencia">
                                                    <CalendarIcon size={16} />
                                                </button>
                                                <button onClick={() => handleOpenEdit(student)} className="p-3 bg-zinc-50 dark:bg-bg-dark rounded-xl text-zinc-400 hover:text-primary-main hover:bg-primary-main/10 transition shadow-sm border border-zinc-100 dark:border-border-emerald" title="Editar">
                                                    <Edit3 size={16} />
                                                </button>
                                                <a href={generateWaLink(student)} target="_blank" rel="noreferrer" className="p-3 bg-primary-main text-white rounded-xl hover:bg-green-600 transition shadow-lg shadow-primary-glow active:scale-95" title="WhatsApp">
                                                    <MessageCircle size={16} />
                                                </a>
                                                <button onClick={() => setDeleteModal({ isOpen: true, studentId: student.id })} className="p-3 bg-zinc-50 dark:bg-bg-dark rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition border border-zinc-100 dark:border-border-emerald" title="Eliminar">
                                                    <Trash2 size={16} />
                                                </button>
                                                <button onClick={() => handleRequestTestimonial(student)} className="p-3 bg-zinc-50 dark:bg-bg-dark rounded-xl text-zinc-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 transition border border-zinc-100 dark:border-border-emerald" title="Solicitar Testimonio">
                                                    <Star size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile view */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="pt-2">
                            <SkeletonCard variant="card" count={3} />
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <EmptyState 
                            icon={Users}
                            title="Sin resultados"
                            description="No se encontraron alumnos."
                        />
                    ) : filteredStudents.map(student => (
                        <div key={student.id} className="card-premium p-6 flex flex-col gap-5 relative overflow-hidden group">
                            {/* Status indicator bar (Subtle) */}
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${student.status === 'paid' ? 'bg-primary-main shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'}`} />
                            
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-xl text-text-main truncate mb-1">{student.name}</h3>
                                    <div className="flex items-center flex-wrap gap-2">
                                        <span className="text-[10px] font-black uppercase text-primary-main tracking-widest bg-primary-main/5 px-2 py-0.5 rounded-md">
                                            {student.service_name}
                                        </span>
                                        {student.sub_category && (
                                            <span className="text-[10px] text-text-muted font-black uppercase tracking-tight opacity-70">
                                                {student.sub_category}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-black text-2xl text-primary-main leading-none">
                                        {user?.currency || '$'}{Number(student.amount).toLocaleString('es-AR')}
                                    </p>
                                    <div className="mt-2 flex justify-end">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${student.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-600/10 dark:text-green-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                                            {student.status === 'paid' ? 'Cobrado' : 'Pendi'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 p-4 bg-bg-app/50 dark:bg-bg-dark/40 rounded-2xl border border-border-main/20">
                                <div>
                                    <p className="label-premium !text-[9px] mb-1.5">WhatsApp</p>
                                    <p className="text-sm font-bold text-text-main font-mono shrink-0 truncate">{student.phone}</p>
                                </div>
                                <div className="border-l border-border-main/30 pl-4">
                                    <p className="label-premium !text-[9px] mb-1.5">Horarios</p>
                                    <div className="flex flex-wrap gap-1">
                                        {student.schedules?.length ? (
                                            student.schedules.slice(0, 1).map((s: any, idx: number) => (
                                                <span key={idx} className="text-[10px] font-bold text-text-muted">
                                                    {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][s.dayOfWeek]} {s.startTime}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-text-muted italic opacity-50">Sin definir</span>
                                        )}
                                        {student.schedules && student.schedules.length > 1 && (
                                            <span className="text-[9px] font-black text-primary-main">+{student.schedules.length - 1} más</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-1 gap-3">
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleToggle(student)} 
                                        className={`p-3.5 rounded-2xl transition-all active:scale-90 ${student.status === 'paid' ? 'text-primary-main bg-primary-main/10 ring-1 ring-primary-main/20' : 'bg-bg-app text-zinc-400 hover:text-primary-main border border-border-main/50'}`} 
                                        title="Registrar Pago"
                                    >
                                        <Check size={22} strokeWidth={2.5} />
                                    </button>
                                    <button onClick={() => setNotesPanel({ isOpen: true, studentId: student.id, studentName: student.name })} className="p-3.5 bg-bg-app dark:bg-bg-dark border border-border-main/50 rounded-2xl text-zinc-400 hover:text-yellow-500 transition-colors" title="Ver Notas">
                                        <StickyNote size={22} />
                                    </button>
                                    <button onClick={() => handleOpenEdit(student)} className="p-3.5 bg-bg-app dark:bg-bg-dark border border-border-main/50 rounded-2xl text-zinc-400 hover:text-primary-main transition-colors" title="Editar">
                                        <Edit3 size={22} />
                                    </button>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button onClick={() => setDeleteModal({ isOpen: true, studentId: student.id })} className="p-3.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-500/60 hover:text-red-500 rounded-2xl transition-all" title="Eliminar Alumno">
                                        <Trash2 size={22} />
                                    </button>
                                    <button 
                                        onClick={() => handleRequestTestimonial(student)} 
                                        className="p-3.5 bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/20 text-yellow-600/70 hover:text-yellow-500 rounded-2xl transition-all" 
                                        title="Solicitar Testimonio"
                                    >
                                        <Star size={22} strokeWidth={2.5} />
                                    </button>
                                    <a 
                                        href={generateWaLink(student)} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="p-3.5 bg-primary-main text-white rounded-2xl shadow-lg shadow-primary-glow/50 active:scale-95 flex items-center justify-center transition-transform" 
                                        title="Enviar WhatsApp"
                                    >
                                        <MessageCircle size={22} strokeWidth={2.5} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-zinc-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-bg-soft w-full max-w-md rounded-[32px] p-8 shadow-2xl relative border border-zinc-100 dark:border-border-emerald max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="absolute right-6 top-6 text-zinc-300 hover:text-zinc-600 dark:hover:text-white transition">
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-6">
                            {isEditing ? 'Editar Alumno' : 'Nuevo Alumno'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {formStep === 1 ? (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    {/* SECCIÓN 1: DATOS PERSONALES */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-primary-main/10 dark:bg-primary-main/20 flex items-center justify-center text-primary-main">
                                                <Plus size={16} />
                                            </div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Paso 1: Datos Personales</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Nombre Completo</label>
                                                <input required type="text" autoComplete="off" placeholder="Ej: Juan Pérez" className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner focus:ring-2 focus:ring-primary-main/20 transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">WhatsApp</label>
                                                <input required type="tel" autoComplete="off" placeholder="54911..." className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner focus:ring-2 focus:ring-primary-main/20 transition-all" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Materia / Servicio</label>
                                                    <select 
                                                        className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner focus:ring-2 focus:ring-primary-main/20 transition-all appearance-none" 
                                                        value={formData.service_name} 
                                                        onChange={e => handleServiceChange(e.target.value)} 
                                                    >
                                                        {userServices.map(s => (
                                                            <option key={s.id} value={s.name}>{s.name} - {user?.currency || '$'}{Number(s.defaultPrice).toLocaleString()}</option>
                                                        ))}
                                                        {userServices.length === 0 && <option value="General">General</option>}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Subcategoría (Opcional)</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ej: Nivel Avanzado" 
                                                        className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner focus:ring-2 focus:ring-primary-main/20 transition-all" 
                                                        value={formData.sub_category || ''} 
                                                        onChange={e => setFormData({ ...formData, sub_category: e.target.value })} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                    <button 
                                        type="button" 
                                        onClick={() => (formData.name && formData.phone) ? setFormStep(2) : showToast.error('Completá nombre y teléfono')}
                                        className="w-full bg-primary-main text-white font-black uppercase tracking-widest text-[10px] py-5 rounded-2xl shadow-xl shadow-primary-glow transition-all active:scale-95"
                                    >
                                        Siguiente Paso
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    {/* SECCIÓN 2: PLAN Y COSTOS */}
                                    <section>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary-main/10 dark:bg-primary-main/20 flex items-center justify-center text-primary-main">
                                                    <Check size={16} />
                                                </div>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Paso 2: Plan y Costos</h3>
                                            </div>
                                            <button type="button" onClick={() => setFormStep(1)} className="text-[10px] font-bold text-primary-main uppercase tracking-widest hover:underline">Atrás</button>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div className="bg-zinc-50 dark:bg-bg-dark p-2 rounded-2xl flex gap-1">
                                                {[
                                                    { id: 'MONTHLY', label: 'Mensual' },
                                                    { id: 'PACK', label: 'Pack' },
                                                    { id: 'PER_CLASS', label: 'Clases' }
                                                ].map(plan => (
                                                    <button
                                                        key={plan.id}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, planType: plan.id as any })}
                                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                            formData.planType === plan.id
                                                                ? 'bg-white dark:bg-bg-soft text-primary-main shadow-md scale-[1.02]'
                                                                : 'text-zinc-400 hover:text-zinc-600'
                                                        }`}
                                                    >
                                                        {plan.label}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">
                                                        {formData.planType === 'PACK' ? 'Clases / Pack' : formData.planType === 'PER_CLASS' ? 'Créditos' : 'Clases al Mes'}
                                                    </label>
                                                    <input required type="number" className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner focus:ring-2 focus:ring-primary-main/20 transition-all" value={formData.planType === 'PACK' ? (formData.credits || '') : (formData.classes_per_month || '')} onChange={e => (formData.planType === 'PACK' || formData.planType === 'PER_CLASS') ? setFormData({ ...formData, credits: Number(e.target.value) }) : setFormData({ ...formData, classes_per_month: Number(e.target.value) })} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Precio x Hora</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">{user?.currency || '$'}</span>
                                                        <input required type="number" className="w-full p-4 pl-8 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner focus:ring-2 focus:ring-primary-main/20 transition-all" value={formData.price_per_hour || ''} onChange={e => setFormData({ ...formData, price_per_hour: Number(e.target.value) })} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-2 block">Duración de Clase (minutos)</label>
                                                    <div className="flex gap-2 mb-3">
                                                        {[30, 45, 60, 90, 120].map(m => (
                                                            <button 
                                                                key={m} 
                                                                type="button" 
                                                                onClick={() => setFormData({ ...formData, class_duration_min: m })}
                                                                className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${formData.class_duration_min === m ? 'bg-primary-main text-white shadow-lg' : 'bg-zinc-100 dark:bg-bg-dark text-zinc-400'}`}
                                                            >
                                                                {m} min
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <input 
                                                        type="number" 
                                                        className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner focus:ring-2 focus:ring-primary-main/20 transition-all" 
                                                        placeholder="Otra duración..." 
                                                        value={formData.class_duration_min || ''} 
                                                        onChange={e => setFormData({ ...formData, class_duration_min: Number(e.target.value) })} 
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Vencimiento (Día)</label>
                                                    <input type="number" min="1" max="31" className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner focus:ring-2 focus:ring-primary-main/20 transition-all" value={formData.deadline_day || ''} onChange={e => setFormData({ ...formData, deadline_day: Number(e.target.value) })} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Método</label>
                                                    <select className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none font-bold text-sm outline-none shadow-inner focus:ring-2 focus:ring-primary-main/20 transition-all appearance-none" value={formData.payment_method} onChange={e => setFormData({ ...formData, payment_method: e.target.value })}>
                                                        <option value="Efectivo">Efectivo 💵</option>
                                                        <option value="Transferencia">Transferencia 🏦</option>
                                                        <option value="Otro">Otro 💳</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* HORARIOS SIMPLIFICADOS */}
                                    <section>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Horarios</h3>
                                            <span className="text-[10px] font-bold text-primary-main bg-primary-main/5 px-2 py-1 rounded-lg">
                                                {formSchedules.length} clases / sem
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {formSchedules.map((s, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-zinc-50 dark:bg-bg-dark px-3 py-1.5 rounded-xl text-[10px] font-black text-zinc-500 shadow-sm border border-zinc-100 dark:border-border-emerald">
                                                    <span>{['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][s.dayOfWeek]} {s.startTime}</span>
                                                    <button type="button" onClick={() => handleRemoveSchedule(i)} className="text-zinc-300 hover:text-red-500"><X size={12} /></button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <select value={newScheduleDay} onChange={e => setNewScheduleDay(Number(e.target.value))} className="flex-1 p-3 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-xl text-xs font-bold outline-none border-none shadow-sm">
                                                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((d, i) => (
                                                    <option key={i} value={i+1}>{d}</option>
                                                ))}
                                            </select>
                                            <input type="time" value={newScheduleTime} onChange={e => setNewScheduleTime(e.target.value)} className="w-24 p-3 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-xl text-xs font-bold outline-none border-none shadow-sm" />
                                            <button type="button" onClick={handleAddSchedule} className="p-3 bg-zinc-100 dark:bg-bg-dark text-primary-main rounded-xl border border-primary-main/10 hover:bg-primary-main hover:text-white transition">
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </section>

                                    {/* RESUMEN Y ENVÍO */}
                                    <div className="pt-2">
                                        <div className="bg-primary-main p-6 rounded-[28px] text-white shadow-xl shadow-primary-glow relative overflow-hidden group">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Cálculo de Cuota</p>
                                            <div className="flex items-end gap-1">
                                                <span className="text-xl font-bold mb-1 opacity-80">{user?.currency || '$'}</span>
                                                <span className="text-4xl font-black tracking-tighter">
                                                    {(formData.planType === 'PACK'
                                                        ? calculateAmount(formData.price_per_hour || 0, 1, formData.class_duration_min || 60) * (formData.credits || 0)
                                                        : calculateAmount(formData.price_per_hour || 0, formData.classes_per_month || 0, formData.class_duration_min || 60)
                                                    ).toLocaleString('es-AR')}
                                                </span>
                                            </div>
                                            <button type="submit" className="w-full bg-white text-primary-main font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl mt-6 transition-all hover:bg-zinc-50 active:scale-95 shadow-lg shadow-black/10">
                                                {isEditing ? 'Guardar Cambios' : 'Confirmar Registro'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* QR Payment Modal */}
            {qrModal.student && (
                <QRPayment
                    isOpen={qrModal.isOpen}
                    onClose={() => setQrModal({ isOpen: false, student: null })}
                    studentName={qrModal.student.name}
                    amount={Number(qrModal.student.amount)}
                    alias={user?.bizAlias || 'tu-alias'}
                    paymentMethod={qrModal.student.payment_method}
                />
            )}

            {/* Notes Panel */}
            <StudentNotes
                isOpen={notesPanel.isOpen}
                onClose={() => setNotesPanel({ ...notesPanel, isOpen: false })}
                studentId={notesPanel.studentId}
                studentName={notesPanel.studentName}
            />

            <ScheduleModal
                isOpen={scheduleModal.isOpen}
                onClose={() => setScheduleModal({ ...scheduleModal, isOpen: false })}
                studentId={scheduleModal.studentId}
                studentName={scheduleModal.studentName}
            />

            {attendanceModal.isOpen && attendanceModal.student && (
                <AttendanceModal
                    student={attendanceModal.student}
                    onClose={() => setAttendanceModal({ isOpen: false, student: null })}
                    onUpdate={loadStudents}
                />
            )}

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Eliminar Alumno"
                message="¿Estás seguro de eliminar este alumno? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ isOpen: false, studentId: null })}
                variant="danger"
            />


            {/* Mass WhatsApp Modal */}
            <ConfirmModal
                isOpen={massWaModal}
                title="WhatsApp Masivo"
                message={`Se abrirán ${pendingCount} conversaciones de WhatsApp con los alumnos pendientes. ¿Continuar?`}
                confirmText="Enviar"
                onConfirm={handleMassWhatsApp}
                onCancel={() => setMassWaModal(false)}
            />
        </Layout>
    );
};

export default Students;
