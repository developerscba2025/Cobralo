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
    Filter, X, StickyNote, Send, Clock, Calendar as CalendarIcon, Users, Star, MoreHorizontal, DollarSign, ChevronUp, ChevronDown, Lock
} from 'lucide-react';
import StudentNotes from '../components/StudentNotes';
import ScheduleModal from '../components/ScheduleModal';
import AttendanceModal from '../components/AttendanceModal';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import WhatsAppPreviewModal from '../components/WhatsAppPreviewModal';

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

    // Selection Mode
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [whatsappPreview, setWhatsappPreview] = useState<{ isOpen: boolean; students: Student[] }>({
        isOpen: false,
        students: []
    });

    // Pagination & Sorting
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const [sortConfig, setSortConfig] = useState<{ key: keyof Student | 'amount', direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

    const requestSort = (key: keyof Student | 'amount') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    // Extra Payment Modal
    const [extraPaymentModal, setExtraPaymentModal] = useState<{ isOpen: boolean; student: Student | null }>({
        isOpen: false,
        student: null
    });
    const [extraPaymentAmount, setExtraPaymentAmount] = useState<string>('');
    const [extraPaymentNote, setExtraPaymentNote] = useState<string>('');

    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

    // Filters
    const [filterService, setFilterService] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('');
    const [filterDay, setFilterDay] = useState<string>('');
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
        if (students.length >= studentLimit) {
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

    const handleTogglePause = async (student: Student) => {
        try {
            const newStatus = student.status === 'paused' ? 'pending' : 'paused';
            await api.updateStudent(student.id, { status: newStatus });
            showToast.success(`Alumno ${student.status === 'paused' ? 'reanudado' : 'pausado'} correctamente`);
            loadStudents();
        } catch {
            showToast.error('Error al actualizar estado');
        }
    };

    const handleToggleSelection = (id: number) => {
        setSelectedStudentIds(prev => 
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (filtered: Student[]) => {
        if (selectedStudentIds.length === filtered.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(filtered.map(s => s.id));
        }
    };

    const handleOpenWhatsAppPreview = () => {
        const selected = students.filter(s => selectedStudentIds.includes(s.id));
        if (selected.length === 0) {
            showToast.error('Seleccioná al menos un alumno');
            return;
        }
        setWhatsappPreview({ isOpen: true, students: selected });
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

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterService, filterStatus, filterPaymentMethod, filterDay]);

    const handleExtraPayment = async () => {
        if (!extraPaymentModal.student || !extraPaymentAmount) return;
        try {
            const now = new Date();
            await api.createPayment({
                studentId: extraPaymentModal.student.id,
                amount: Number(extraPaymentAmount),
                month: now.getMonth() + 1,
                year: now.getFullYear()
            });

            if (extraPaymentNote.trim()) {
                await api.createNote({
                    studentId: extraPaymentModal.student.id,
                    content: `Pago Extra ($${extraPaymentAmount}): ${extraPaymentNote.trim()}`
                });
            }

            showToast.success('Pago extra registrado correctamente');
            setExtraPaymentModal({ isOpen: false, student: null });
            setExtraPaymentAmount('');
            setExtraPaymentNote('');
            loadStudents(); 
        } catch {
            showToast.error('Error al registrar pago extra');
        }
    };

    // Filter students
    const filteredStudents = students.filter(s => {
        const lowerSearch = (searchTerm || '').toLowerCase();
        const matchesSearch = (s.name || '').toLowerCase().includes(lowerSearch) ||
                              (s.schedules || []).some(sch => 
                                  ['dom','lun','mar','mié','jue','vie','sáb'][sch.dayOfWeek].toLowerCase().includes(lowerSearch) || 
                                  sch.startTime.includes(lowerSearch)
                              );
        const matchesService = !filterService || s.service_name === filterService;
        const matchesStatus = !filterStatus || s.status === filterStatus;
        const matchesPayment = !filterPaymentMethod || s.payment_method === filterPaymentMethod;
        const matchesDay = !filterDay || (s.schedules || []).some(sch => sch.dayOfWeek.toString() === filterDay);
        return matchesSearch && matchesService && matchesStatus && matchesPayment && matchesDay;
    }).sort((a, b) => {
        if (sortConfig.key === 'amount') {
            const numA = Number(a.amount) || 0;
            const numB = Number(b.amount) || 0;
            return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        }
        const strA = (String(a[sortConfig.key as keyof Student] || '')).toLowerCase();
        const strB = (String(b[sortConfig.key as keyof Student] || '')).toLowerCase();
        return sortConfig.direction === 'asc' ? strA.localeCompare(strB, 'es') : strB.localeCompare(strA, 'es');
    });

    const paginatedStudents = filteredStudents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

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
                    <span key={s.id} className="text-[10px] font-black bg-primary-main/10 dark:bg-primary-main/15 px-2 py-0.5 rounded-lg text-primary-main whitespace-nowrap w-fit border border-primary-main/20 dark:border-primary-main/25">
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
            {activeMenuId && (
                <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
            )}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Gestión de Alumnos</h1>
                    <p className="text-text-muted font-medium">
                        {students.length} alumnos · {paidCount} cobrados · {pendingCount} pendientes
                    </p>
                </div>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 md:pb-0 md:overflow-visible">
                    <button
                        onClick={() => setIsSelectionMode(!isSelectionMode)}
                        className={`px-4 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg ${isSelectionMode ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-white'}`}
                    >
                        {isSelectionMode ? <X size={18} /> : <Check size={18} />}
                        {isSelectionMode ? 'Cancelar' : 'Seleccionar'}
                    </button>
                    <button
                        onClick={isSelectionMode ? handleOpenWhatsAppPreview : () => setMassWaModal(true)}
                        disabled={!isSelectionMode && pendingCount === 0}
                        className="bg-primary-main hover:bg-green-600 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-primary-glow"
                    >
                        <Send size={18} /> 
                        {isSelectionMode 
                            ? `WhatsApp (${selectedStudentIds.length})` 
                            : `WhatsApp (${pendingCount})`}
                    </button>
                    <button
                        onClick={exportToCSV}
                        className={`hidden lg:flex px-4 py-3 rounded-xl font-bold transition items-center gap-2 group relative ${isPro ? 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-white' : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500'}`}
                    >
                        <Download size={18} /> CSV
                        {!isPro && <Lock size={14} className="text-primary-main ml-1" />}
                    </button>
                    <button
                        onClick={handleOpenCreate}
                        className="hidden lg:flex bg-primary-main hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary-glow transition items-center gap-2"
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

                <div className="flex gap-2 items-center overflow-x-auto hide-scrollbar pb-2 md:pb-0 md:flex-wrap md:overflow-visible">
                    <Filter size={18} className="text-zinc-400 shrink-0" />

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
                        <option value="paused">Pausado</option>
                    </select>

                    <select
                        value={filterPaymentMethod}
                        onChange={e => setFilterPaymentMethod(e.target.value)}
                        className="px-3 py-2 bg-surface text-text-main rounded-lg border border-border-main text-sm outline-none font-bold uppercase text-[10px] tracking-widest shadow-sm"
                    >
                        <option value="">Método</option>
                        {paymentMethods.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>

                    <select
                        value={filterDay}
                        onChange={e => setFilterDay(e.target.value)}
                        className="px-3 py-2 bg-surface text-text-main rounded-lg border border-border-main text-sm outline-none font-bold uppercase text-[10px] tracking-widest shadow-sm"
                    >
                        <option value="">Día</option>
                        {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((d, i) => <option key={i} value={i.toString()}>{d}</option>)}
                    </select>

                    {hasActiveFilters && (
                        <button
                            onClick={() => { setFilterService(''); setFilterStatus(''); setFilterPaymentMethod(''); setFilterDay(''); }}
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
                <div className="hidden lg:block card-premium pb-0">
                    <div className="overflow-visible custom-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-black/[0.03] dark:bg-white/[0.03] border-b border-border-main/60">
                                    <th className="px-4 py-3.5 w-10 rounded-tl-[24px]">
                                        {isSelectionMode && (
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 rounded-md accent-primary-main cursor-pointer"
                                                checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                                                onChange={() => handleSelectAll(filteredStudents)}
                                            />
                                        )}
                                    </th>
                                    <th className="px-4 py-3.5 label-premium cursor-pointer group hover:text-primary-main" onClick={() => requestSort('name')}>
                                        <div className="flex items-center gap-1">Alumno {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-primary-main" /> : <ChevronDown size={14} className="text-primary-main" />)}</div>
                                    </th>
                                    <th className="px-4 py-3.5 label-premium cursor-pointer group hover:text-primary-main" onClick={() => requestSort('service_name')}>
                                        <div className="flex items-center gap-1">Servicio {sortConfig.key === 'service_name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-primary-main" /> : <ChevronDown size={14} className="text-primary-main" />)}</div>
                                    </th>
                                    <th className="px-4 py-3.5 label-premium">Horarios</th>
                                    <th className="px-4 py-3.5 label-premium cursor-pointer group hover:text-primary-main" onClick={() => requestSort('amount')}>
                                        <div className="flex items-center gap-1">Cuota {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-primary-main" /> : <ChevronDown size={14} className="text-primary-main" />)}</div>
                                    </th>
                                    <th className="px-4 py-3.5 label-premium cursor-pointer group hover:text-primary-main" onClick={() => requestSort('status')}>
                                        <div className="flex items-center gap-1">Estado {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-primary-main" /> : <ChevronDown size={14} className="text-primary-main" />)}</div>
                                    </th>
                                    <th className="px-4 py-3.5 label-premium text-right pr-8 rounded-tr-[24px]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <SkeletonCard variant="row" count={5} />
                                ) : paginatedStudents.length === 0 ? (
                                    <tr><td colSpan={7} className="p-10">
                                        <EmptyState 
                                            icon={Users}
                                            title="No hay alumnos"
                                            description="No se encontraron alumnos con los filtros actuales o aún no has cargado ninguno."
                                        />
                                    </td></tr>
                                ) : paginatedStudents.map((student, index) => (
                                    <motion.tr 
                                        key={student.id} 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05, type: 'spring', stiffness: 500, damping: 40 }}
                                        className={`border-b border-border-main/30 transition-colors group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] ${selectedStudentIds.includes(student.id) ? 'bg-primary-main/5' : ''}`}
                                        onClick={() => isSelectionMode && handleToggleSelection(student.id)}
                                    >
                                        <td className="px-4 py-3.5">
                                            {isSelectionMode && (
                                                <input 
                                                    type="checkbox" 
                                                    className="w-5 h-5 rounded-md accent-primary-main cursor-pointer"
                                                    checked={selectedStudentIds.includes(student.id)}
                                                    readOnly
                                                />
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-primary-main/10 dark:bg-primary-main/15 border border-primary-main/20 flex items-center justify-center text-primary-main font-black text-[12px] shrink-0">
                                                    {(student.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="font-bold text-text-main leading-tight text-[13px]">{student.name}</p>
                                                    <p className="text-[10px] font-bold text-text-muted/70 mt-0.5 tabular-nums">{student.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-text-main">{student.service_name}</span>
                                                {student.sub_category && (
                                                    <span className="text-[10px] text-primary-main font-black uppercase tracking-tight mt-0.5">{student.sub_category}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {formatSchedules(student.schedules)}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-[15px] font-black text-text-main tracking-tight">
                                                {user?.currency || '$'}{Number(student.amount).toLocaleString('es-AR')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                                student.status === 'paid' 
                                                    ? 'bg-primary-main/10 text-primary-main border-primary-main/25 dark:bg-primary-main/15' 
                                                    : student.status === 'paused'
                                                    ? 'bg-zinc-200 text-zinc-500 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400'
                                                    : 'bg-amber-500/10 text-amber-600 border-amber-500/25 dark:text-amber-400'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'paid' ? 'bg-primary-main' : student.status === 'paused' ? 'bg-zinc-400' : 'bg-amber-500'}`} />
                                                {student.status === 'paid' ? 'Cobrado' : student.status === 'paused' ? 'Pausado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex justify-end gap-1.5 relative">
                                                <button onClick={() => handleToggle(student)} className={`p-2 rounded-xl transition-all shadow-sm flex items-center justify-center ${student.status === 'paid' ? 'text-primary-main bg-primary-main/10 hover:bg-primary-main/20' : 'text-zinc-400 bg-zinc-50 dark:bg-bg-dark hover:text-primary-main hover:bg-primary-main/10 border border-zinc-100 dark:border-border-emerald'}`} title="Marcar pago">
                                                    <Check size={16} />
                                                </button>
                                                <a href={generateWaLink(student)} target="_blank" rel="noreferrer" className="p-2 bg-primary-main text-white rounded-xl hover:bg-green-600 transition-all shadow-md shadow-primary-glow/50 active:scale-95 flex items-center justify-center shrink-0" title="WhatsApp">
                                                    <MessageCircle size={16} />
                                                </a>
                                                
                                                <button onClick={() => setActiveMenuId(activeMenuId === student.id ? null : student.id)} className={`p-2 border border-zinc-100 dark:border-border-emerald rounded-xl transition-all ml-1 ${activeMenuId === student.id ? 'bg-primary-main/10 text-primary-main border-primary-main/20' : 'text-zinc-400 bg-zinc-50 dark:bg-bg-dark hover:text-primary-main hover:bg-primary-main/10'}`}>
                                                    <MoreHorizontal size={16} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                <div onClick={() => setActiveMenuId(null)} className={`absolute right-0 ${paginatedStudents.length > 2 && index >= paginatedStudents.length - 2 ? 'bottom-full mb-2' : 'top-full mt-2'} w-44 bg-surface dark:bg-bg-soft rounded-2xl shadow-xl border border-zinc-100 dark:border-border-emerald z-50 transition-all origin-top-right transform flex flex-col overflow-hidden ${activeMenuId === student.id ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                                                    <button onClick={() => handleOpenEdit(student)} className="flex items-center gap-3 w-full p-2.5 px-4 text-left text-[11px] font-bold text-text-muted hover:bg-primary-main/10 hover:text-primary-main transition-colors border-b border-border-main/50">
                                                        <Edit3 size={14} /> Editar Perfil
                                                    </button>
                                                    <button onClick={() => setExtraPaymentModal({ isOpen: true, student })} className="flex items-center gap-3 w-full p-2.5 px-4 text-left text-[11px] font-bold text-text-muted hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors border-b border-border-main/50">
                                                        <DollarSign size={14} /> Pago Extra
                                                    </button>
                                                    <button onClick={() => handleTogglePause(student)} className="flex items-center gap-3 w-full p-2.5 px-4 text-left text-[11px] font-bold text-text-muted hover:bg-zinc-500/10 hover:text-zinc-500 transition-colors border-b border-border-main/50">
                                                        <Clock size={14} /> {student.status === 'paused' ? 'Reanudar Alumno' : 'Pausar Alumno'}
                                                    </button>
                                                    <button onClick={() => isPro ? setNotesPanel({ isOpen: true, studentId: student.id, studentName: student.name }) : showToast.error('Función exclusiva PRO')} className="flex items-center justify-between w-full p-2.5 px-4 text-left text-[11px] font-bold text-text-muted hover:bg-yellow-500/10 hover:text-yellow-600 transition-colors group">
                                                        <div className="flex items-center gap-3"><StickyNote size={14} /> Notas</div>
                                                        {!isPro && <Lock size={12} className="text-zinc-300 dark:text-zinc-600 group-hover:text-amber-500" />}
                                                    </button>
                                                    <button onClick={() => isPro ? setScheduleModal({ isOpen: true, studentId: student.id, studentName: student.name }) : showToast.error('Función exclusiva PRO')} className="flex items-center justify-between w-full p-2.5 px-4 text-left text-[11px] font-bold text-text-muted hover:bg-cyan-500/10 hover:text-cyan-600 transition-colors group">
                                                        <div className="flex items-center gap-3"><Clock size={14} /> Horarios</div>
                                                        {!isPro && <Lock size={12} className="text-zinc-300 dark:text-zinc-600 group-hover:text-amber-500" />}
                                                    </button>
                                                    <button onClick={() => isPro ? setAttendanceModal({ isOpen: true, student }) : showToast.error('Función exclusiva PRO')} className="flex items-center justify-between w-full p-2.5 px-4 text-left text-[11px] font-bold text-text-muted hover:bg-violet-500/10 hover:text-violet-600 transition-colors group">
                                                        <div className="flex items-center gap-3"><CalendarIcon size={14} /> Asistencia</div>
                                                        {!isPro && <Lock size={12} className="text-zinc-300 dark:text-zinc-600 group-hover:text-amber-500" />}
                                                    </button>
                                                    <button onClick={() => isPro ? handleRequestTestimonial(student) : showToast.error('Función exclusiva PRO')} className="flex items-center justify-between w-full p-2.5 px-4 text-left text-[11px] font-bold text-text-muted hover:bg-amber-500/10 hover:text-amber-600 transition-colors border-b border-border-main/50 group">
                                                        <div className="flex items-center gap-3"><Star size={14} /> Testimonio</div>
                                                        {!isPro && <Lock size={12} className="text-zinc-300 dark:text-zinc-600 group-hover:text-amber-500" />}
                                                    </button>
                                                    <button onClick={() => setDeleteModal({ isOpen: true, studentId: student.id })} className="flex items-center gap-3 w-full p-2.5 px-4 text-left text-[11px] font-bold text-red-500 hover:bg-red-500/10 transition-colors">
                                                        <Trash2 size={14} /> Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile view */}
                <div className="lg:hidden space-y-4">
                    {loading ? (
                        <div className="pt-2">
                            <SkeletonCard variant="card" count={3} />
                        </div>
                    ) : paginatedStudents.length === 0 ? (
                        <EmptyState 
                            icon={Users}
                            title="Sin resultados"
                            description="No se encontraron alumnos."
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {paginatedStudents.map((student, index) => (
                                <motion.div 
                                    key={student.id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 500, damping: 40 }}
                                    onClick={() => isSelectionMode && handleToggleSelection(student.id)}
                                    className={`card-premium p-5 flex flex-col gap-4 relative overflow-hidden group h-full transition-all duration-300 ${selectedStudentIds.includes(student.id) ? 'ring-2 ring-primary-main shadow-2xl scale-[1.02] bg-primary-main/[0.02]' : ''}`}
                                >
                                    {/* Selection checkbox for mobile */}
                                    {isSelectionMode && (
                                        <div className="absolute top-4 right-4 z-20">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedStudentIds.includes(student.id) ? 'bg-primary-main border-primary-main text-white shadow-lg shadow-primary-glow' : 'bg-white/50 dark:bg-bg-dark/50 border-zinc-200 dark:border-white/10'}`}>
                                                {selectedStudentIds.includes(student.id) && <Check size={14} strokeWidth={4} />}
                                            </div>
                                        </div>
                                    )}

                                    {/* Status indicator bar */}
                                    <div className={`absolute top-0 left-0 w-1.5 h-full ${student.status === 'paid' ? 'bg-primary-main shadow-[0_0_15px_rgba(34,197,94,0.3)]' : student.status === 'paused' ? 'bg-zinc-400' : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'}`} />
                                    
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-xl text-text-main truncate mb-0.5">{student.name}</h3>
                                            <div className="flex items-center flex-wrap gap-1.5">
                                                <span className="text-[10px] font-black uppercase text-primary-main tracking-widest bg-primary-main/10 px-2 py-0.5 rounded-md">
                                                    {student.service_name}
                                                </span>
                                                {student.sub_category && (
                                                    <span className="text-[9px] text-text-muted font-black uppercase tracking-tight opacity-70">
                                                        {student.sub_category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-black text-2xl text-text-main leading-none">
                                                {user?.currency || '$'}{Number(student.amount).toLocaleString('es-AR')}
                                            </p>
                                            <div className="mt-2 flex justify-end">
                                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${student.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-600/10 dark:text-green-400' : student.status === 'paused' ? 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                                                    {student.status === 'paid' ? 'Cobrado' : student.status === 'paused' ? 'Pausado' : 'Pendi'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 p-3 bg-bg-app/50 dark:bg-bg-dark/40 rounded-2xl border border-border-main/20 flex-1">
                                        <div>
                                            <p className="label-premium !text-[8px] mb-1">WhatsApp</p>
                                            <p className="text-[12px] font-bold text-text-main font-mono shrink-0 truncate">{student.phone}</p>
                                        </div>
                                        <div className="border-l border-border-main/30 pl-3">
                                            <p className="label-premium !text-[8px] mb-1">Horarios</p>
                                            <div className="flex flex-wrap gap-1">
                                                {student.schedules?.length ? (
                                                    student.schedules.slice(0, 1).map((s: any, idx: number) => (
                                                        <span key={idx} className="text-[11px] font-bold text-text-main">
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

                                    <div className="flex items-center justify-between mt-auto pt-2 gap-2">
                                        <div className="flex gap-1.5 text-zinc-400">
                                            <button 
                                                onClick={() => handleToggle(student)} 
                                                className={`p-2.5 rounded-xl transition-all active:scale-90 ${student.status === 'paid' ? 'text-primary-main bg-primary-main/10 ring-1 ring-primary-main/20' : 'bg-bg-app border border-border-main/50'}`} 
                                                title="Registrar Pago"
                                            >
                                                <Check size={18} strokeWidth={2.5} />
                                            </button>
                                            <button onClick={() => isPro ? setNotesPanel({ isOpen: true, studentId: student.id, studentName: student.name }) : showToast.error('Función exclusiva PRO')} className="relative p-2.5 bg-bg-app border border-border-main/50 rounded-xl group" title="Notas">
                                                <StickyNote size={18} />
                                                {!isPro && <Lock size={10} className="absolute top-1 right-1 text-zinc-400 dark:text-zinc-600 group-hover:text-amber-500" />}
                                            </button>
                                            <button onClick={() => isPro ? setScheduleModal({ isOpen: true, studentId: student.id, studentName: student.name }) : showToast.error('Función exclusiva PRO')} className="relative p-2.5 bg-bg-app border border-border-main/50 rounded-xl group" title="Horarios">
                                                <Clock size={18} />
                                                {!isPro && <Lock size={10} className="absolute top-1 right-1 text-zinc-400 dark:text-zinc-600 group-hover:text-amber-500" />}
                                            </button>
                                        </div>
                                        
                                        <div className="flex gap-1.5">
                                            <div className="relative">
                                                <button onClick={() => setActiveMenuId(activeMenuId === student.id ? null : student.id)} className={`p-2.5 border border-border-main/50 rounded-xl transition-colors ${activeMenuId === student.id ? 'text-primary-main bg-primary-main/10' : 'bg-bg-app text-zinc-400'}`}>
                                                    <MoreHorizontal size={18} />
                                                </button>
                                                <div onClick={() => setActiveMenuId(null)} className={`absolute right-0 bottom-full mb-2 w-48 bg-surface dark:bg-bg-soft rounded-2xl shadow-xl border border-border-main z-50 transition-all flex flex-col overflow-hidden origin-bottom-right transform ${activeMenuId === student.id ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                                                    <button onClick={() => handleOpenEdit(student)} className="flex items-center gap-3 w-full p-2.5 px-4 text-left text-[10px] font-bold text-text-muted hover:bg-primary-main/10 hover:text-primary-main transition-colors border-b border-border-main/50">
                                                        <Edit3 size={14} /> Editar
                                                    </button>
                                                    <button onClick={() => setExtraPaymentModal({ isOpen: true, student })} className="flex items-center gap-3 w-full p-2.5 px-4 text-left text-[10px] font-bold text-text-muted hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors border-b border-border-main/50">
                                                        <DollarSign size={14} /> Pago Extra
                                                    </button>
                                                    <button onClick={() => handleTogglePause(student)} className="flex items-center gap-3 w-full p-2.5 px-4 text-left text-[10px] font-bold text-text-muted hover:bg-zinc-500/10 hover:text-zinc-500 transition-colors border-b border-border-main/50">
                                                        <Clock size={14} /> {student.status === 'paused' ? 'Reanudar Alumno' : 'Pausar Alumno'}
                                                    </button>
                                                    <button onClick={() => isPro ? setAttendanceModal({ isOpen: true, student }) : showToast.error('Función exclusiva PRO')} className="flex items-center justify-between w-full p-2.5 px-4 text-left text-[10px] font-bold text-text-muted hover:bg-violet-500/10 hover:text-violet-600 transition-colors group">
                                                        <div className="flex items-center gap-3"><CalendarIcon size={14} /> Asistencia</div>
                                                        {!isPro && <Lock size={12} className="text-zinc-300 dark:text-zinc-600 group-hover:text-amber-500" />}
                                                    </button>
                                                    <button onClick={() => isPro ? handleRequestTestimonial(student) : showToast.error('Función exclusiva PRO')} className="flex items-center justify-between w-full p-2.5 px-4 text-left text-[10px] font-bold text-text-muted hover:bg-amber-500/10 hover:text-amber-600 transition-colors border-b border-border-main/50 group">
                                                        <div className="flex items-center gap-3"><Star size={14} /> Testimonio</div>
                                                        {!isPro && <Lock size={12} className="text-zinc-300 dark:text-zinc-600 group-hover:text-amber-500" />}
                                                    </button>
                                                    <button onClick={() => setDeleteModal({ isOpen: true, studentId: student.id })} className="flex items-center gap-3 w-full p-2.5 px-4 text-left text-[10px] font-bold text-red-500 hover:bg-red-500/10 transition-colors">
                                                        <Trash2 size={14} /> Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                            <a 
                                                href={generateWaLink(student)} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="p-2.5 bg-primary-main text-white rounded-xl shadow-lg shadow-primary-glow flex items-center justify-center transition-transform active:scale-95" 
                                                title="WhatsApp"
                                            >
                                                <MessageCircle size={18} strokeWidth={2.5} />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="flex items-center bg-zinc-50 dark:bg-bg-dark rounded-xl p-1 shadow-sm border border-border-main">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${currentPage === 1 ? 'text-zinc-400 opacity-50' : 'text-text-main hover:bg-white dark:hover:bg-bg-soft shadow-sm'}`}
                        >
                            Anterior
                        </button>
                        <span className="px-4 text-xs font-black text-text-muted">
                            {currentPage} / {totalPages}
                        </span>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${currentPage === totalPages ? 'text-zinc-400 opacity-50' : 'text-text-main hover:bg-white dark:hover:bg-bg-soft shadow-sm'}`}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}

            <WhatsAppPreviewModal 
                isOpen={whatsappPreview.isOpen}
                onClose={() => setWhatsappPreview({ ...whatsappPreview, isOpen: false })}
                students={whatsappPreview.students}
                user={user}
                isPro={isPro}
            />

            {/* Mobile FAB */}
            <button
                onClick={handleOpenCreate}
                className="lg:hidden fixed bottom-[90px] right-4 w-14 h-14 bg-primary-main text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-glow z-40 active:scale-95 transition-transform"
            >
                <Plus size={24} strokeWidth={2.5} />
            </button>

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

            {/* Extra Payment Modal */}
            {extraPaymentModal.isOpen && extraPaymentModal.student && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setExtraPaymentModal({isOpen: false, student: null})} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-sm bg-white dark:bg-bg-soft rounded-3xl p-6 shadow-2xl border border-zinc-100 dark:border-border-emerald z-10">
                        <h2 className="text-xl font-black text-text-main mb-2">Pago Extra</h2>
                        <p className="text-sm font-bold text-text-muted mb-6">Registrar pago manual adicional para {extraPaymentModal.student.name}</p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-zinc-400 mb-1 ml-1 block">Monto a registrar</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400">{user?.currency || '$'}</span>
                                    <input 
                                        type="number" 
                                        className="w-full p-4 pl-8 bg-zinc-50 dark:bg-bg-dark rounded-xl font-bold border-none outline-none focus:ring-2 focus:ring-primary-main/20 text-text-main"
                                        placeholder="Ej: 5000"
                                        value={extraPaymentAmount}
                                        onChange={(e) => setExtraPaymentAmount(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-zinc-400 mb-1 ml-1 block">Nota / Motivo (Opcional)</label>
                                <input 
                                    type="text" 
                                    className="w-full p-4 bg-zinc-50 dark:bg-bg-dark rounded-xl font-bold border-none outline-none focus:ring-2 focus:ring-primary-main/20 text-text-main text-sm"
                                    placeholder="Ej: Pago parcial, materiales, etc."
                                    value={extraPaymentNote}
                                    onChange={(e) => setExtraPaymentNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={() => { setExtraPaymentModal({isOpen: false, student: null}); setExtraPaymentNote(''); }} className="flex-1 p-4 rounded-xl font-bold bg-zinc-100 dark:bg-bg-dark text-text-muted hover:bg-zinc-200">Cancelar</button>
                            <button onClick={handleExtraPayment} disabled={!extraPaymentAmount} className="flex-1 p-4 rounded-xl font-black uppercase text-[10px] bg-primary-main text-white shadow-lg shadow-primary-glow active:scale-95 transition-all disabled:opacity-50">Registrar</button>
                        </div>
                    </motion.div>
                </div>
            )}

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
