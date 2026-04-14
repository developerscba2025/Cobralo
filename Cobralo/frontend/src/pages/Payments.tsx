import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api, type Student, type Payment, type ReceiptData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, DollarSign, Trash2, Filter, 
  Download, Receipt as ReceiptIcon, Clock, CheckCircle2, 
  Search, Share2, CreditCard, Wallet, Banknote
} from 'lucide-react';
import { showToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';

import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

type Tab = 'pending' | 'history' | 'receipts';

const Payments = () => {
    const { user, isPro } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Initialize tab from URL or default to 'pending'
    const initialTab = (searchParams.get('tab') as Tab) || 'pending';
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    
    // Sync tab with URL when search params change
    useEffect(() => {
        const tab = searchParams.get('tab') as Tab;
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
        setSearchTerm('');
    };
    
    // Data states
    const [students, setStudents] = useState<Student[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [receipts, setReceipts] = useState<ReceiptData[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states for History
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; paymentId: number | null }>({
        isOpen: false,
        paymentId: null
    });

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    useEffect(() => {
        loadData();
    }, [activeTab, selectedYear, selectedMonth]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'pending') {
                const data = await api.getStudents();
                setStudents(Array.isArray(data) ? data : []);
            } else if (activeTab === 'history') {
                const filters: { year?: number; month?: number } = { year: selectedYear };
                if (selectedMonth) filters.month = selectedMonth;
                const data = await api.getPayments(filters);
                setPayments(data);
            } else if (activeTab === 'receipts') {
                const data = await api.getReceipts();
                setReceipts(data);
            }
        } catch (error) {
            console.error('Error loading payments data:', error);
            showToast.error('Error al cargar la información');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePayment = async () => {
        if (!deleteModal.paymentId) return;
        try {
            await api.deletePayment(deleteModal.paymentId);
            showToast.success('Pago eliminado');
            loadData();
        } catch {
            showToast.error('Error al eliminar el pago');
        } finally {
            setDeleteModal({ isOpen: false, paymentId: null });
        }
    };

    const handleRecordPayment = async (student: Student) => {
        // Optimistic update
        setStudents(prev => prev.filter(s => s.id !== student.id));
        
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10B981', '#34D399', '#059669', '#F59E0B'],
            zIndex: 9999
        });

        toast(
            (t) => (
                <div className="flex items-center gap-4 w-full justify-between">
                    <span className="font-bold text-sm">¡Cobro de {student.name} registrado!</span>
                    <button 
                        onClick={() => { 
                            toast.dismiss(t.id); 
                            clearTimeout(timer);
                            // Revert optimistic update
                            setStudents(prev => {
                                const exists = prev.some(s => s.id === student.id);
                                return exists ? prev : [...prev, student];
                            });
                        }}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap"
                    >
                        Deshacer
                    </button>
                </div>
            ),
            { duration: 5000, style: { minWidth: '350px' } }
        );

        // Delayed execution
        const timer = setTimeout(async () => {
            try {
                const now = new Date();
                await api.createPayment({
                    studentId: student.id,
                    amount: Number(student.amount || 0),
                    month: now.getMonth() + 1,
                    year: now.getFullYear()
                });
                
                // Silently refresh stats in background for current tab
                if (activeTab === 'pending') {
                    const data = await api.getStudents();
                    setStudents(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                showToast.error('Error al registrar el pago');
                // Revert optimistic update
                setStudents(prev => {
                    const exists = prev.some(s => s.id === student.id);
                    return exists ? prev : [...prev, student];
                });
            }
        }, 5000);
    };

    const handleDownloadReceipt = async (id: number) => {
        if (!isPro) {
            showToast.error('La generación de PDF es una función PRO');
            return;
        }
        try {
            await api.downloadReceiptPDF(id);
            showToast.success('Recibo descargado');
        } catch {
            showToast.error('Error al descargar el recibo');
        }
    };

    const handleShareReceipt = async (id: number) => {
        try {
            const res = await api.sendReceiptWhatsApp(id);
            if (res.whatsappUrl) {
                window.open(res.whatsappUrl, '_blank');
            } else {
                showToast.success('Texto copiado');
            }
        } catch {
            showToast.error('Error al compartir recibo');
        }
    };

    const handleSendPaymentLink = async (student: Student) => {
        if (!user?.mpAccessToken) {
            showToast.error('Vinculá tu cuenta de Mercado Pago en Ajustes primero');
            return;
        }
        try {
            const { checkoutUrl } = await api.createStudentPaymentLink({
                studentId: student.id,
                amount: Number(student.amount || 0),
                title: `Pago - ${student.name}`,
            });
            window.open(checkoutUrl, '_blank');
        } catch {
            showToast.error('Error al generar el link de pago con Mercado Pago');
        }
    };

    const pendingStudents = useMemo(() => {
        return students.filter(s => 
            s.status === 'pending' && 
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [students, searchTerm]);

    const filteredHistory = useMemo(() => {
        return payments.filter(p => 
            p.student?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [payments, searchTerm]);

    const filteredReceipts = useMemo(() => {
        return receipts.filter(r => 
            r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [receipts, searchTerm]);

    const totalCollected = payments.reduce((acc, p) => acc + Number(p.amount), 0);

    const handleExportMonthlyClosing = () => {
        if (filteredHistory.length === 0) {
            showToast.error('No hay cobros para exportar');
            return;
        }

        let csvContent = "\uFEFF";
        csvContent += `COBRALO - CIERRE DE CAJA CIERRE DE MES,,,\n`;
        csvContent += `Periodo: ${selectedMonth ? MONTHS[selectedMonth - 1] : 'Todo el año'} ${selectedYear},,,\n`;
        csvContent += `Generado el: ${new Date().toLocaleDateString('es-AR')},,,\n\n`;
        csvContent += "FECHA,ALUMNO,SERVICIO,MONTO\n";
        
        filteredHistory.forEach(p => {
            const dateStr = new Date(p.paidAt).toLocaleDateString('es-AR');
            const studentName = `"${(p.student?.name || 'Alumno eliminado').replace(/"/g, '""')}"`;
            const serviceName = `"${(p.student?.service_name || '-').replace(/"/g, '""')}"`;
            csvContent += `${dateStr},${studentName},${serviceName},${Number(p.amount)}\n`;
        });

        const totalFiltered = filteredHistory.reduce((acc, p) => acc + Number(p.amount), 0);
        csvContent += `\nTOTAL RECAUDADO,,,${totalFiltered}\n`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `cierre_cobralo_${selectedYear}_${selectedMonth || 'anual'}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast.success('Cierre mensual exportado con éxito');
    };

    return (
        <Layout>
                <div className="w-full">
                    <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter uppercase italic">
                                COBROS
                            </h1>
                            <p className="text-sm font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">
                                Organizá tus ingresos y gestioná recibos en un solo lugar.
                            </p>
                        </div>

                        {/* Stats Summary in Header */}
                        <div className="flex gap-4">
                            <div className="px-5 py-3 bg-primary-main/10 rounded-2xl border border-primary-main/20 flex items-center gap-3">
                                <DollarSign size={20} className="text-primary-main" />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-primary-main/60 tracking-widest leading-none mb-1">Total (Período)</p>
                                    <p className="font-black text-primary-main text-lg leading-none">
                                        {user?.currency || '$'}{totalCollected.toLocaleString('es-AR')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Navigation Tabs */}
                    <div className="flex p-1.5 bg-bg-soft-app border border-border-main/50 rounded-2xl mb-8 w-fit mx-auto sm:mx-0">
                        {[
                            { id: 'pending', label: 'Pendientes', icon: Clock },
                            { id: 'history', label: 'Historial', icon: Banknote },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id as Tab)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-primary-main text-white shadow-lg shadow-primary-main/20' 
                                    : 'text-text-muted hover:text-text-main'
                                }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                                {tab.id === 'pending' && pendingStudents.length > 0 && (
                                    <span className="ml-1 w-5 h-5 bg-white/20 text-white rounded-full flex items-center justify-center text-[9px]">
                                        {pendingStudents.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Global Search for tabs */}
                    <div className="relative group mb-8 max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder={activeTab === 'receipts' ? "Buscar por alumno o N°..." : "Buscar alumno..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-surface border border-border-main/50 rounded-3xl shadow-sm focus:ring-2 focus:ring-primary-main transition-all outline-none text-text-main font-bold text-sm"
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }}
                                className="py-24 text-center"
                            >
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main mx-auto"></div>
                                <p className="mt-4 label-premium">Cargando datos...</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* PENDIENTES TAB */}
                                {activeTab === 'pending' && (
                                    <div className="space-y-4">
                                        {pendingStudents.length === 0 ? (
                                            <div className="card-premium p-12 text-center border-2 border-dashed">
                                                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <CheckCircle2 size={32} />
                                                </div>
                                                <h3 className="text-xl font-black text-text-main uppercase italic font-accent mb-2">¡Todo al día!</h3>
                                                <p className="text-text-muted font-bold text-xs uppercase tracking-widest">No hay alumnos con pagos pendientes por ahora.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                                {pendingStudents.map(student => (
                                                    <div key={student.id} className="card-premium p-6 group hover:scale-[1.01] transition-all border border-border-main/60">
                                                        <div className="flex flex-col gap-4 mb-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-14 h-14 rounded-2xl bg-primary-main/10 flex items-center justify-center text-primary-main font-black text-xl shrink-0">
                                                                    {student.name.charAt(0)}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h3 className="text-xl font-black text-text-main uppercase tracking-tighter truncate">{student.name}</h3>
                                                                    <p className="label-premium !text-[10px] mt-0.5 truncate">{student.service_name}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-border-main/30">
                                                                <div>
                                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-1 opacity-60 italic">Vencimiento</p>
                                                                    <p className="text-sm font-black text-text-main">Día {student.deadline_day || 10}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-1 opacity-60 italic">Total</p>
                                                                    <p className="text-xl font-black text-primary-main leading-none">
                                                                        {user?.currency || '$'}{Number(student.amount).toLocaleString('es-AR')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {isPro ? (
                                                                user?.mpAccessToken ? (
                                                                    <button
                                                                        onClick={() => handleSendPaymentLink(student)}
                                                                        className="flex items-center justify-center gap-2 py-4 bg-[#009EE3]/10 text-[#009EE3] border border-[#009EE3]/20 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-[#009EE3] hover:text-white transition-all italic"
                                                                        title="Enviar link de pago por MP"
                                                                    >
                                                                        <CreditCard size={14} />
                                                                        Link MP
                                                                    </button>
                                                                ) : (
                                                                    <Link
                                                                        to="/app/settings?tab=business"
                                                                        className="flex items-center justify-center gap-2 py-4 bg-zinc-100 dark:bg-white/5 text-zinc-500 border border-zinc-200 dark:border-white/10 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-zinc-200 transition-all italic text-center"
                                                                        title="Vincular Mercado Pago en Ajustes"
                                                                    >
                                                                        <CreditCard size={14} />
                                                                        Vincular MP
                                                                    </Link>
                                                                )
                                                            ) : (
                                                                <Link
                                                                    to="/app/settings?tab=subscription"
                                                                    className="flex items-center justify-center gap-1.5 py-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-amber-500/20 transition-all italic text-center"
                                                                    title="Función PRO: Link de pago con Mercado Pago"
                                                                >
                                                                    <CreditCard size={12} />
                                                                    PRO
                                                                </Link>
                                                            )}
                                                            <button
                                                                onClick={() => handleRecordPayment(student)}
                                                                className="flex items-center justify-center gap-2 py-4 bg-primary-main text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-primary-main/20 hover:scale-[1.03] active:scale-95 transition-all italic"
                                                            >
                                                                <Wallet size={16} />
                                                                Registrar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* HISTORIAL TAB */}
                                {activeTab === 'history' && (
                                    <div className="space-y-4">
                                        <div className="bg-surface border border-border-main/50 rounded-3xl p-6 flex flex-wrap items-center gap-6 mb-2">
                                            <div className="flex items-center gap-4">
                                                <Filter size={20} className="text-primary-main" />
                                                <div className="flex gap-2">
                                                    <select
                                                        value={selectedYear}
                                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                                        className="px-4 py-2 bg-bg-soft-app dark:text-white rounded-xl border-none font-black text-[11px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-main/20"
                                                    >
                                                        {years.map(year => <option key={year} value={year}>{year}</option>)}
                                                    </select>
                                                    <select
                                                        value={selectedMonth || ''}
                                                        onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : null)}
                                                        className="px-4 py-2 bg-bg-soft-app dark:text-white rounded-xl border-none font-black text-[11px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-main/20"
                                                    >
                                                        <option value="">Todo el año</option>
                                                        {MONTHS.map((month, i) => <option key={i} value={i + 1}>{month}</option>)}
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={handleExportMonthlyClosing}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-main/10 text-primary-main hover:bg-primary-main hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                                >
                                                    <Download size={14} />
                                                    Exportar Excel
                                                </button>
                                            </div>
                                        </div>

                                        <div className="card-premium overflow-hidden border border-border-main/60">
                                            {filteredHistory.length === 0 ? (
                                                <div className="p-20 text-center text-text-muted">
                                                    <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                                                    <p className="font-bold uppercase tracking-widest text-xs">Sin registros en este periodo.</p>
                                                </div>
                                            ) : (
                                                <table className="w-full text-left">
                                                    <thead className="bg-bg-soft-app border-b border-border-main/50">
                                                        <tr>
                                                            <th className="p-5 label-premium">Alumno</th>
                                                            <th className="p-5 label-premium text-center">Monto</th>
                                                            <th className="p-5 label-premium hidden md:table-cell text-center">Confirmación</th>
                                                            <th className="p-5 label-premium text-right">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredHistory.map(payment => (
                                                            <tr key={payment.id} className="border-b border-border-main/30 hover:bg-primary-main/5 transition-colors">
                                                                <td className="p-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-bg-soft-app flex items-center justify-center text-primary-main font-bold">
                                                                            {payment.student?.name.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-black text-text-main leading-tight">{payment.student?.name || 'Alumno Eliminado'}</p>
                                                                            <p className="text-[10px] uppercase font-black text-text-muted tracking-tighter">{payment.student?.service_name}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4 text-center">
                                                                    <p className="font-black text-primary-main">{user?.currency || '$'}{Number(payment.amount).toLocaleString('es-AR')}</p>
                                                                </td>
                                                                <td className="p-4 hidden md:table-cell text-center">
                                                                    <p className="text-text-main text-[11px] font-black uppercase tracking-tight leading-none mb-1">
                                                                        {new Date(payment.paidAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                                    </p>
                                                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest leading-none">
                                                                        {new Date(payment.paidAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} HS
                                                                    </p>
                                                                </td>
                                                                <td className="p-4 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <button 
                                                                            onClick={() => handleShareReceipt(payment.id)} 
                                                                            className="flex items-center gap-2 px-4 py-2 bg-primary-main/10 text-primary-main hover:bg-primary-main hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                                                            title="Confirmar por WhatsApp"
                                                                        >
                                                                            <Share2 size={16} />
                                                                            Confirmar
                                                                        </button>
                                                                        <button onClick={() => setDeleteModal({ isOpen: true, paymentId: payment.id })} className="p-2.5 rounded-xl hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all">
                                                                            <Trash2 size={18} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* RECIBOS TAB */}
                                {activeTab === 'receipts' && (
                                    <div className="space-y-4">
                                        {filteredReceipts.length === 0 ? (
                                            <div className="card-premium p-20 text-center border-2 border-dashed">
                                                <ReceiptIcon size={48} className="mx-auto mb-4 opacity-20 text-primary-main" />
                                                <h3 className="text-xl font-black text-text-main uppercase italic font-accent mb-2">Sin Recibos</h3>
                                                <p className="text-text-muted font-bold text-xs uppercase tracking-widest leading-relaxed">Los recibos se generan automáticamente cuando registras un cobro.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {filteredReceipts.map(receipt => (
                                                    <div key={receipt.id} className="card-premium p-6 group flex items-center justify-between gap-6 border border-border-main/50">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-14 bg-bg-soft-app text-primary-main rounded-2xl flex flex-col items-center justify-center shrink-0 border border-border-main/50 shadow-sm transition-transform group-hover:scale-105">
                                                                <span className="text-[9px] font-black uppercase text-text-muted tracking-widest mb-1">Día</span>
                                                                <span className="text-lg font-black leading-none">{new Date(receipt.paidAt).getDate()}</span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h3 className="font-black text-text-main text-lg leading-tight truncate">{receipt.studentName}</h3>
                                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                    <p className="label-premium !text-[9px] truncate">{receipt.receiptNumber}</p>
                                                                    <span className="w-1 h-1 rounded-full bg-border-main" />
                                                                    <p className="label-premium !text-[9px]">
                                                                        {new Date(receipt.paidAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} HS
                                                                    </p>
                                                                    <span className="w-1 h-1 rounded-full bg-border-main" />
                                                                    <p className="label-premium !text-[9px]">{user?.currency || '$'}{receipt.amount.toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                onClick={() => handleDownloadReceipt(receipt.id)}
                                                                className={`p-3 rounded-2xl transition-all active:scale-90 ${isPro ? 'bg-bg-app text-text-main hover:bg-primary-main/10 hover:text-primary-main' : 'bg-bg-soft-app text-text-muted opacity-50 cursor-not-allowed'}`}
                                                            >
                                                                <Download size={20} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleShareReceipt(receipt.id)}
                                                                className="p-3 bg-primary-main/10 text-primary-main rounded-2xl hover:bg-primary-main hover:text-white transition-all active:scale-90 shadow-sm"
                                                            >
                                                                <Share2 size={20} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <ConfirmModal
                    isOpen={deleteModal.isOpen}
                    title="Eliminar Registro"
                    message="¿Estás seguro de eliminar este registro de pago? Esto no afectará la deuda actual del alumno si ya pasó el mes."
                    confirmText="Eliminar"
                    onConfirm={handleDeletePayment}
                    onCancel={() => setDeleteModal({ isOpen: false, paymentId: null })}
                    variant="danger"
                />
        </Layout>
    );
};

export default Payments;
