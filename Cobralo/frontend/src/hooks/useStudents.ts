import { useState, useMemo } from 'react';
import { api, type Student } from '../services/api';
import { showToast } from '../components/Toast';
import confetti from 'canvas-confetti';

export const useStudents = (initialStudents: Student[], onAction?: () => void) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Filter Logic
    const filteredStudents = useMemo(() => {
        if (!Array.isArray(initialStudents)) return [];
        return initialStudents.filter(student => {
            const matchesSearch = 
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.phone?.includes(searchTerm) ||
                student.service_name?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = 
                statusFilter === 'all' || 
                (statusFilter === 'paid' && student.status === 'paid') ||
                (statusFilter === 'pending' && student.status === 'pending');
            
            const matchesService = 
                serviceFilter === 'all' || 
                student.service_name === serviceFilter;

            return matchesSearch && matchesStatus && matchesService;
        });
    }, [initialStudents, searchTerm, statusFilter, serviceFilter]);

    // Unique services for filter
    const services = useMemo(() => {
        const set = new Set(initialStudents.map(s => s.service_name).filter(Boolean));
        return Array.from(set) as string[];
    }, [initialStudents]);

    // Selection handlers
    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        if (selectedIds.length === filteredStudents.length) setSelectedIds([]);
        else setSelectedIds(filteredStudents.map(s => s.id));
    };

    // Actions
    const handleTogglePayment = async (student: Student) => {
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
                showToast.success(`Pago registrado para ${student.name}`);
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10B981', '#34D399', '#059669', '#F59E0B'],
                    zIndex: 9999
                });
            } else {
                showToast.success(`Estado revertido para ${student.name}`);
            }
            onAction?.();
        } catch {
            showToast.error('No se pudo actualizar el pago');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.deleteStudent(id);
            showToast.success('Alumno eliminado');
            onAction?.();
        } catch {
            showToast.error('No se pudo eliminar al alumno');
        }
    };

    const handleExportExcel = () => {
        if (filteredStudents.length === 0) {
            showToast.error('No hay alumnos para exportar');
            return;
        }

        const data = filteredStudents.map(s => {
            const schedulesText = s.schedules?.map(sch => {
                const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                return `${days[sch.dayOfWeek]} ${sch.startTime}-${sch.endTime}`;
            }).join(', ') || 'Flexible / Sin horario';

            return {
                name: s.name.toUpperCase(),
                status: s.status === 'paid' ? 'AL DÍA' : s.status === 'paused' ? 'PAUSADO' : 'PENDIENTE',
                phone: s.phone || '',
                service: s.service_name || '',
                plan: s.planType === 'PACK' ? 'Pack' : s.planType === 'PER_CLASS' ? 'Por Clase' : 'Mensual',
                amount: Number(s.amount) || 0,
                due_day: s.due_day || '',
                credits: s.planType === 'PACK' ? (s.credits || 0) : 'N/A',
                makeup: s.makeup_classes || 0,
                method: s.payment_method || '',
                schedules: schedulesText,
                alias: s.billing_alias || '',
                notes: s.notes || ''
            };
        });

        const totalPending = filteredStudents
            .filter(s => s.status !== 'paid')
            .reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
        
        const totalPaid = filteredStudents
            .filter(s => s.status === 'paid')
            .reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

        import('../utils/excel').then(({ exportToExcel, formatExcelCurrency }) => {
            exportToExcel({
                filename: 'Cobralo_Alumnos',
                sheetName: 'Lista de Alumnos',
                title: 'Reporte General de Alumnos',
                data,
                columns: [
                    { header: 'NOMBRE COMPLETO', key: 'name', width: 35 },
                    { header: 'ESTADO', key: 'status', width: 15 },
                    { header: 'TELÉFONO', key: 'phone', width: 15 },
                    { header: 'SERVICIO', key: 'service', width: 20 },
                    { header: 'PLAN', key: 'plan', width: 12 },
                    { header: 'MONTO ($)', key: 'amount', width: 12 },
                    { header: 'DÍA PAGO', key: 'due_day', width: 10 },
                    { header: 'CLASES DISP.', key: 'credits', width: 12 },
                    { header: 'RECUPEROS', key: 'makeup', width: 12 },
                    { header: 'MÉTODO PAGO', key: 'method', width: 15 },
                    { header: 'HORARIOS', key: 'schedules', width: 40 },
                    { header: 'ALIAS/CBU', key: 'alias', width: 25 },
                    { header: 'NOTAS', key: 'notes', width: 40 }
                ],
                summaryData: {
                    'Total Alumnos': filteredStudents.length,
                    'Alumnos con deuda': filteredStudents.filter(s => s.status !== 'paid').length,
                    'Total recaudado (mes)': formatExcelCurrency(totalPaid),
                    'Total pendiente de cobro': formatExcelCurrency(totalPending),
                    'Proyección Total': formatExcelCurrency(totalPaid + totalPending)
                }
            });
            showToast.success('Excel generado correctamente');
        });
    };

    return {
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        serviceFilter, setServiceFilter,
        selectedIds, setSelectedIds,
        filteredStudents,
        services,
        toggleSelect,
        toggleAll,
        handleTogglePayment,
        handleDelete,
        handleExportExcel
    };
};
