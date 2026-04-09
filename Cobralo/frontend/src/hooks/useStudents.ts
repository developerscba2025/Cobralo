import { useState, useMemo } from 'react';
import { api, type Student } from '../services/api';
import { showToast } from '../components/Toast';
import * as XLSX from 'xlsx';
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

        // Formatear datos para el Excel
        const data = filteredStudents.map(s => {
            const schedulesText = s.schedules?.map(sch => {
                const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                return `${days[sch.dayOfWeek]} ${sch.startTime}-${sch.endTime}`;
            }).join(', ') || 'Flexible / Sin horario';

            return {
                'NOMBRE COMPLETO': s.name.toUpperCase(),
                'ESTADO': s.status === 'paid' ? 'AL DÍA' : s.status === 'paused' ? 'PAUSADO' : 'PENDIENTE',
                'TELEFONO': s.phone || '',
                'SERVICIO': s.service_name || '',
                'PLAN': s.planType === 'PACK' ? 'Pack' : s.planType === 'PER_CLASS' ? 'Por Clase' : 'Mensual',
                'MONTO ($)': Number(s.amount) || 0,
                'DIA PAGO': s.due_day || '',
                'CLASES DISP': s.planType === 'PACK' ? (s.credits || 0) : 'N/A',
                'RECUPEROS': s.makeup_classes || 0,
                'METODO PAGO': s.payment_method || '',
                'HORARIOS': schedulesText,
                'ALIAS/CBU': s.billing_alias || '',
                'NOTAS': s.notes || ''
            };
        });

        const ws = XLSX.utils.json_to_sheet(data);
        
        // Ajustar anchos de columna (wch = width in characters)
        const wscols = [
            { wch: 30 }, // Nombre
            { wch: 12 }, // Estado
            { wch: 15 }, // Telefono
            { wch: 20 }, // Servicio
            { wch: 12 }, // Plan
            { wch: 10 }, // Monto
            { wch: 8 },  // Dia Pago
            { wch: 10 }, // Clases Disp
            { wch: 10 }, // Recuperos
            { wch: 15 }, // Metodo Pago
            { wch: 35 }, // Horarios
            { wch: 20 }, // Alias
            { wch: 40 }  // Notas
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Lista de Alumnos");
        
        // Nombre del archivo con fecha legible
        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `Cobralo_Alumnos_${date}.xlsx`);
        
        showToast.success('Excel generado correctamente');
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
