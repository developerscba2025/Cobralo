import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { api, type UserService } from '../services/api';
import type { Student } from '../services/api';
import { showToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import QRPayment from '../components/QRPayment';
import { 
    Search, Plus, Check, Trash2, Edit3, MessageCircle, Download, 
    Filter, X, StickyNote, RefreshCw, Send, Clock, Calendar as CalendarIcon
} from 'lucide-react';
import StudentNotes from '../components/StudentNotes';
import ScheduleModal from '../components/ScheduleModal';
import AttendanceModal from '../components/AttendanceModal';

const Students = () => {
    const { user } = useAuth();
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
    const [resetModal, setResetModal] = useState(false);
    const [massWaModal, setMassWaModal] = useState(false);

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
        billing_alias: ''
    });

    // Form Schedules
    const [formSchedules, setFormSchedules] = useState<{ dayOfWeek: number; startTime: string; endTime: string }[]>([]);
    const [newScheduleDay, setNewScheduleDay] = useState(1);
    const [newScheduleTime, setNewScheduleTime] = useState('14:00');

    const handleAddSchedule = (e: React.MouseEvent) => {
        e.preventDefault();
        // Calc end time + 1h
        const [h, m] = newScheduleTime.split(':').map(Number);
        const endD = new Date();
        endD.setHours(h, m + 60);
        const endTime = `${endD.getHours().toString().padStart(2, '0')}:${endD.getMinutes().toString().padStart(2, '0')}`;

        setFormSchedules([...formSchedules, { dayOfWeek: newScheduleDay, startTime: newScheduleTime, endTime }]);
    };

    const handleRemoveSchedule = (index: number) => {
        setFormSchedules(formSchedules.filter((_, i) => i !== index));
    };

    const defaultServices = ['General', 'Piano', 'Inglés', 'Matemáticas', 'Guitarra', 'Física', 'Química', 'Lengua', 'Geografía', 'Historia', 'Biología', 'Informática'];
    const services = [...new Set([...defaultServices, ...userServices.map(s => s.name), ...students.map(s => s.service_name).filter(Boolean)])].sort();
    const paymentMethods = [...new Set(students.map(s => s.payment_method).filter(Boolean))];

    const calculateAmount = (pph: number, classes: number) => pph * classes;

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
        setFormData({
            name: '', 
            phone: '', 
            service_name: user?.defaultService || 'General',
            price_per_hour: Number(user?.defaultPrice) || 0, 
            classes_per_month: 4,
            payment_method: 'Efectivo', 
            deadline_day: 10, 
            surcharge_percentage: user?.defaultSurcharge || 10,
            planType: 'MONTHLY', 
            credits: 0,
            sub_category: '',
            billing_alias: user?.bizAlias || ''
        });
        setFormSchedules([]);
        setIsEditing(false);
        setEditingId(null);
    };

    const handleOpenCreate = () => {
        resetForm();
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
            billing_alias: student.billing_alias || user?.bizAlias || ''
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
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = formData.planType === 'PACK'
            ? calculateAmount(formData.price_per_hour || 0, 1) * (formData.credits || 0)
            : calculateAmount(formData.price_per_hour || 0, formData.classes_per_month || 0);

        const payload: any = {
            ...formData,
            amount,
            class_duration_min: 60,
            due_day: 1,
            schedules: formSchedules
        };

        try {
            console.log('Sending student creation payload:', payload);
            if (isEditing && editingId) {
                await api.updateStudent(editingId, payload);
                showToast.success('Alumno actualizado');
            } else {
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

    const handleResetMonth = async () => {
        try {
            const result = await api.resetMonth();
            showToast.success(result.message);
            loadStudents();
        } catch {
            showToast.error('Error al reiniciar mes');
        } finally {
            setResetModal(false);
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
            const template = user?.reminderTemplate || defaultTemplate;

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

    // Filter students
    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesService = !filterService || s.service_name === filterService;
        const matchesStatus = !filterStatus || s.status === filterStatus;
        const matchesPayment = !filterPaymentMethod || s.payment_method === filterPaymentMethod;
        return matchesSearch && matchesService && matchesStatus && matchesPayment;
    });

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Nombre', 'Teléfono', 'Servicio', 'Cuota', 'Método de Pago', 'Estado'];
        const rows = filteredStudents.map(s => [
            s.name,
            s.phone || '',
            s.service_name || '',
            s.amount?.toString() || '0',
            s.payment_method || '',
            s.status === 'paid' ? 'Cobrado' : 'Pendiente'
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `alumnos_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        showToast.success('Archivo exportado');
    };

    // WhatsApp link generator
    const generateWaLink = (student: Student) => {
        const baseAmount = Number(student.amount) || 0;
        const alias = student.billing_alias || user?.bizAlias || 'Alias';
        const defaultTemplate = `Hola {alumno}! Te saluda {negocio}. Te envío el link de pago de {servicio} por un total de ${user?.currency || '$'}{monto}. Mi alias es: {alias}. ¡Muchas gracias!`;
        const template = user?.reminderTemplate || defaultTemplate;

        const serviceName = (student.service_name === 'General' && student.sub_category) ? student.sub_category : (student.service_name || '');
        const message = template
            .replace('{alumno}', student.name)
            .replace('{monto}', baseAmount.toLocaleString('es-AR'))
            .replace('{negocio}', user?.bizName || 'Tu Profe')
            .replace('{servicio}', serviceName)
            .replace('{subcategoria}', student.sub_category || '')
            .replace('{metodo}', student.payment_method || '')
            .replace('{vencimiento}', (student.deadline_day || '').toString())
            .replace('{alias}', student.billing_alias || alias);

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
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Gestión de Alumnos</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {students.length} alumnos · {paidCount} cobrados · {pendingCount} pendientes
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setMassWaModal(true)}
                        disabled={pendingCount === 0}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-bold transition flex items-center gap-2"
                    >
                        <Send size={18} /> WhatsApp ({pendingCount})
                    </button>
                    <button
                        onClick={() => setResetModal(true)}
                        disabled={paidCount === 0}
                        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-bold transition flex items-center gap-2"
                    >
                        <RefreshCw size={18} /> Nuevo Mes
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-4 py-3 rounded-xl font-bold transition flex items-center gap-2"
                    >
                        <Download size={18} /> CSV
                    </button>
                    <button
                        onClick={handleOpenCreate}
                        className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
                    >
                        <Plus size={18} /> Nuevo
                    </button>
                </div>
            </header>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-600 shadow-sm transition"
                    />
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <Filter size={18} className="text-slate-400" />

                    <select
                        value={filterService}
                        onChange={e => setFilterService(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-800 dark:text-white rounded-lg border border-slate-100 dark:border-slate-700 text-sm"
                    >
                        <option value="">Servicio</option>
                        {services.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-800 dark:text-white rounded-lg border border-slate-100 dark:border-slate-700 text-sm"
                    >
                        <option value="">Estado</option>
                        <option value="paid">Cobrado</option>
                        <option value="pending">Pendiente</option>
                    </select>

                    <select
                        value={filterPaymentMethod}
                        onChange={e => setFilterPaymentMethod(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-800 dark:text-white rounded-lg border border-slate-100 dark:border-slate-700 text-sm"
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

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="p-4 text-xs font-black uppercase text-slate-400 tracking-wider">Alumno</th>
                                <th className="p-4 text-xs font-black uppercase text-slate-400 tracking-wider">Servicio</th>
                                <th className="p-4 text-xs font-black uppercase text-slate-400 tracking-wider">Horarios</th>
                                <th className="p-4 text-xs font-black uppercase text-slate-400 tracking-wider">Cuota</th>
                                <th className="p-4 text-xs font-black uppercase text-slate-400 tracking-wider">Estado</th>
                                <th className="p-4 text-xs font-black uppercase text-slate-400 tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center text-slate-400">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
                                </td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan={6} className="p-10 text-center text-slate-400">No se encontraron alumnos</td></tr>
                            ) : filteredStudents.map(student => (
                                <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <p className="font-bold text-slate-800 dark:text-white">{student.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{student.phone}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{student.service_name}</span>
                                            {student.sub_category && (
                                                <span className="text-[10px] text-green-600 font-bold uppercase tracking-tight">{student.sub_category}</span>
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
                                            {(student.planType === 'PACK' || student.planType === 'PER_CLASS') && (Number(student.credits) || 0) <= 0 && (
                                                <span className="text-[10px] bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-black px-2 py-0.5 rounded-md flex items-center gap-1 italic animate-pulse">
                                                    ⚠️ Debe {student.planType === 'PER_CLASS' ? 'Pago' : 'Clases'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1">
                                            <button onClick={() => handleToggle(student)} className={`p-2 rounded-lg transition ${student.status === 'paid' ? 'text-green-600 bg-green-50 dark:bg-green-600/10' : 'text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-600/10'}`} title="Marcar pago">
                                                <Check size={16} />
                                            </button>
                                            {/* QR Payment hidden per user request */}
                                            {/* <button onClick={() => setQrModal({ isOpen: true, student })} className="p-2 rounded-lg text-slate-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition" title="QR de pago">
                                                <QrCode size={16} />
                                            </button> */}
                                            <button onClick={() => setNotesPanel({ isOpen: true, studentId: student.id, studentName: student.name })} className="p-2 rounded-lg text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 transition" title="Notas">
                                                <StickyNote size={16} />
                                            </button>
                                            <button onClick={() => setScheduleModal({ isOpen: true, studentId: student.id, studentName: student.name })} className="p-2 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition" title="Horarios">
                                                <Clock size={16} />
                                            </button>
                                            <button onClick={() => setAttendanceModal({ isOpen: true, student })} className="p-2 rounded-lg text-slate-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition" title="Asistencia">
                                                <CalendarIcon size={16} />
                                            </button>
                                            <button onClick={() => handleOpenEdit(student)} className="p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-600/10 transition" title="Editar">
                                                <Edit3 size={16} />
                                            </button>
                                            <a href={generateWaLink(student)} target="_blank" rel="noreferrer" className="p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-600/10 transition" title="WhatsApp">
                                                <MessageCircle size={16} />
                                            </a>
                                            <button onClick={() => setDeleteModal({ isOpen: true, studentId: student.id })} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition" title="Eliminar">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] p-8 shadow-2xl relative border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="absolute right-6 top-6 text-slate-300 hover:text-slate-600 dark:hover:text-white transition">
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                            {isEditing ? 'Editar Alumno' : 'Nuevo Alumno'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-3 mb-1 block">Nombre del Alumno</label>
                                <input required type="text" placeholder="Ej: Juan Pérez" className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none outline-none font-medium" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-3 mb-1 block">WhatsApp (sin 0 ni 15)</label>
                                <input required type="tel" placeholder="Ej: 5491112345678" className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none outline-none font-medium" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-3 mb-1 block">Servicio / Materia</label>
                                <input 
                                    list="services-list"
                                    placeholder="Escribe o selecciona..."
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none font-bold outline-none" 
                                    value={formData.service_name} 
                                    onChange={e => handleServiceChange(e.target.value)} 
                                />
                                <datalist id="services-list">
                                    {services.map(s => <option key={s} value={s} />)}
                                </datalist>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-3 mb-1 block">Subcategoría / Tema</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: Álgebra, Nivel B1, etc." 
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none outline-none font-medium" 
                                    value={formData.sub_category || ''} 
                                    onChange={e => setFormData({ ...formData, sub_category: e.target.value })} 
                                />
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl mb-4">
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block">Tipo de Plan</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="planType"
                                            checked={formData.planType === 'MONTHLY'}
                                            onChange={() => setFormData({ ...formData, planType: 'MONTHLY' })}
                                            className="w-4 h-4 text-green-700 focus:ring-green-600"
                                        />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Mensual</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="planType"
                                            checked={formData.planType === 'PACK'}
                                            onChange={() => setFormData({ ...formData, planType: 'PACK' })}
                                            className="w-4 h-4 text-green-700 focus:ring-green-600"
                                        />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Pack de Clases</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="planType"
                                            checked={formData.planType === 'PER_CLASS'}
                                            onChange={() => setFormData({ ...formData, planType: 'PER_CLASS' })}
                                            className="w-4 h-4 text-green-700 focus:ring-green-600"
                                        />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Por Clase</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 ml-3 mb-1 block">
                                        {formData.planType === 'PACK' ? 'Clases en el Pack' : formData.planType === 'PER_CLASS' ? 'Crédito Inicial' : 'Clases al Mes'}
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="Ej: 4"
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none outline-none font-medium"
                                        value={formData.planType === 'PACK' ? (formData.credits || '') : (formData.classes_per_month || '')}
                                        onChange={e =>
                                            (formData.planType === 'PACK' || formData.planType === 'PER_CLASS')
                                                ? setFormData({ ...formData, credits: Number(e.target.value) })
                                                : setFormData({ ...formData, classes_per_month: Number(e.target.value) })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 ml-3 mb-1 block">Precio por Hora</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{user?.currency || '$'}</span>
                                        <input required type="number" placeholder="0" className="w-full p-4 pl-8 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none outline-none font-bold" value={formData.price_per_hour || ''} onChange={e => setFormData({ ...formData, price_per_hour: Number(e.target.value) })} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 ml-3 mb-1 block">Método de Pago</label>
                                    <select className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none font-bold outline-none" value={formData.payment_method} onChange={e => setFormData({ ...formData, payment_method: e.target.value })}>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Transferencia">Transferencia</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 ml-3 mb-1 block">Día de Vencimiento</label>
                                    <input type="number" min="1" max="31" placeholder="Ej: 10" className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none outline-none font-medium" value={formData.deadline_day || ''} onChange={e => setFormData({ ...formData, deadline_day: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 ml-3 mb-1 block">% Recargo por Mora</label>
                                    <div className="relative">
                                        <input type="number" placeholder="Ej: 10" className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none outline-none font-medium" value={formData.surcharge_percentage || ''} onChange={e => setFormData({ ...formData, surcharge_percentage: Number(e.target.value) })} />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-[24px] border border-slate-100 dark:border-slate-700/50">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1 mb-2 block text-balance">¿Dónde querés recibir el dinero de este alumno?</label>
                                
                                {user?.paymentAccounts && user.paymentAccounts.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {user.paymentAccounts.map(account => (
                                            <button
                                                key={account.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, billing_alias: account.alias })}
                                                className={`px-3 py-2 rounded-xl text-xs font-bold transition border-2 ${
                                                    formData.billing_alias === account.alias
                                                        ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-200 dark:shadow-none'
                                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-green-200'
                                                }`}
                                            >
                                                {account.name}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <input 
                                    type="text" 
                                    placeholder="CBU o Alias personalizado..." 
                                    className="w-full p-4 bg-white dark:bg-slate-800 dark:text-white rounded-2xl border-none outline-none font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm" 
                                    value={formData.billing_alias || ''} 
                                    onChange={e => setFormData({ ...formData, billing_alias: e.target.value })} 
                                />
                                <p className="text-[10px] text-slate-400 font-medium italic mt-2 ml-1">
                                    {formData.billing_alias ? 'Usaremos el alias seleccionado para los recordatorios.' : 'Si lo dejas vacío, usaremos tu cuenta predeterminada.'}
                                </p>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-6">
                                <label className="text-sm font-black text-slate-800 dark:text-white mb-3 block flex items-center gap-2">
                                    <Clock size={16} className="text-green-600" /> Horarios de Clase
                                </label>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {formSchedules.map((s, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-green-50 dark:bg-green-600/10 px-3 py-1.5 rounded-xl text-xs font-bold text-green-800 dark:text-green-300 border border-green-100 dark:border-green-600/20">
                                            <span>{['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][s.dayOfWeek]} {s.startTime}</span>
                                            <button type="button" onClick={() => handleRemoveSchedule(i)} className="hover:text-red-500 p-0.5 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition"><X size={14} /></button>
                                        </div>
                                    ))}
                                    {formSchedules.length === 0 && <span className="text-xs text-slate-400 italic py-1.5">Sin horarios definidos</span>}
                                </div>

                                <div className="flex gap-2">
                                    <select value={newScheduleDay} onChange={e => setNewScheduleDay(Number(e.target.value))} className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-xl text-sm font-bold outline-none border-none">
                                        {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((d, i) => (
                                            <option key={i} value={i}>{d}</option>
                                        ))}
                                    </select>
                                    <input type="time" value={newScheduleTime} onChange={e => setNewScheduleTime(e.target.value)} className="w-24 p-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-xl text-sm font-bold outline-none border-none" />
                                    <button onClick={handleAddSchedule} className="p-3 bg-green-700 hover:bg-green-800 text-white rounded-xl transition shadow-lg shadow-green-600/20">
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-green-50 dark:bg-green-600/10 p-4 rounded-2xl mt-4 border border-green-100 dark:border-green-600/20">
                                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                                    {formData.planType === 'PACK' ? 'Precio Total del Pack:' : 'Cuota mensual calculada:'}
                                </p>
                                <p className="font-black text-3xl text-green-800 dark:text-green-400 mt-1">
                                    {user?.currency || '$'}{
                                        formData.planType === 'PACK'
                                            ? calculateAmount(formData.price_per_hour || 0, formData.credits || 0).toLocaleString('es-AR')
                                            : calculateAmount(formData.price_per_hour || 0, formData.classes_per_month || 0).toLocaleString('es-AR')
                                    }
                                </p>
                            </div>
                            <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-2xl transition">
                                {isEditing ? 'Guardar Cambios' : 'Guardar Alumno'}
                            </button>
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

            {/* Reset Month Modal */}
            <ConfirmModal
                isOpen={resetModal}
                title="Nuevo Mes"
                message={`¿Marcar todos los ${paidCount} alumnos cobrados como pendientes para el nuevo mes?`}
                confirmText="Reset"
                onConfirm={handleResetMonth}
                onCancel={() => setResetModal(false)}
                variant="warning"
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
