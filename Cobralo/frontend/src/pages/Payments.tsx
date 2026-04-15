import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api, type Student, type Payment, type ReceiptData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, DollarSign, Trash2, 
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
        <Layout fitted scrollable={false}>
                <div className="flex flex-col h-full min-h-0 gap-4 2xl:gap-6">
                    <header className="flex-shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-2xl md:text-3xl 2xl:text-5xl font-black text-text-main tracking-tighter uppercase italic flex items-center gap-3">
                                <span className="w-1.5 h-8 bg-primary-main rounded-full" />
                                COBROS
                            </h1>
                            <p className="text-[10px] 2xl:text-xs font-bold text-text-muted uppercase tracking-[0.2em] opacity-40 mt-1 ml-4.5">Control total de tus finanzas</p>
                        </div>

                        <div className="flex gap-4">
                            <div className="px-6 py-3 bg-surface/80 dark:bg-white/5 backdrop-blur-xl border border-border-main/50 rounded-2xl flex items-center gap-4 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-primary-main/10 flex items-center justify-center text-primary-main">
                                    <DollarSign size={22} strokeWidth={3} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase text-text-muted tracking-widest leading-none mb-1">Recaudado (Período)</p>
                                    <p className="font-black text-text-main text-xl leading-none">
                                        {user?.currency || '$'}{totalCollected.toLocaleString('es-AR')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Control Bar: Tabs + Search */}
                    <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface/50 dark:bg-white/[0.02] border border-border-main/50 p-2 rounded-[28px]">
                        <div className="flex p-1 bg-bg-app dark:bg-black/20 rounded-2xl w-full sm:w-auto">
                            {[
                                { id: 'pending', label: 'Pendientes', icon: Clock },
                                { id: 'history', label: 'Historial', icon: Banknote },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id as Tab)}
                                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                        activeTab === tab.id 
                                        ? 'bg-primary-main text-white shadow-lg shadow-primary-main/20' 
                                        : 'text-text-muted hover:text-text-main'
                                    }`}
                                >
                                    <tab.icon size={14} />
                                    {tab.label}
                                    {tab.id === 'pending' && pendingStudents.length > 0 && (
                                        <span className={`ml-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-primary-main/10 text-primary-main'}`}>
                                            {pendingStudents.length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full sm:w-80 2xl:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder={activeTab === 'receipts' ? "Buscar por alumno o N°..." : "Buscar alumno..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-bg-app dark:bg-black/20 border border-transparent focus:border-primary-main/30 rounded-2xl transition-all outline-none text-text-main font-bold text-xs"
                            />
                        </div>
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
                                {/* PENDIENTES TAB - Bento Grid */}
                                {activeTab === 'pending' && (
                                    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 -mr-1">
                                        {pendingStudents.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                                                <div className="w-20 h-20 bg-primary-main/10 text-primary-main rounded-full flex items-center justify-center mb-4">
                                                    <CheckCircle2 size={40} />
                                                </div>
                                                <h3 className="text-xl font-black text-text-main uppercase italic font-accent mb-2">¡Todo al día!</h3>
                                                <p className="text-text-muted font-bold text-[10px] uppercase tracking-widest">No hay alumnos con pagos pendientes.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-8">
                                                {pendingStudents.map(student => (
                                                    <motion.div 
                                                        key={student.id} 
                                                        layout
                                                        className="group bg-surface/50 dark:bg-white/[0.03] backdrop-blur-sm p-5 2xl:p-6 rounded-[32px] border border-border-main/50 hover:border-primary-main/30 hover:bg-surface dark:hover:bg-white/[0.05] transition-all duration-300 relative flex flex-col justify-between"
                                                    >
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-main to-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary-main/20">
                                                                    {student.name.charAt(0)}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h3 className="font-black text-text-main uppercase tracking-tighter truncate leading-none">{student.name}</h3>
                                                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1 opacity-60 truncate">{student.service_name}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">Vence</span>
                                                                <span className="text-xs font-black text-text-main">Día {student.deadline_day || 10}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-4">
                                                            <div className="flex items-end justify-between p-4 bg-bg-app dark:bg-black/20 rounded-[20px] border border-border-main/30 group-hover:bg-primary-main/[0.02] transition-colors">
                                                                <div>
                                                                    <p className="text-[9px] font-black text-primary-main/60 uppercase tracking-widest leading-none mb-1">Monto Total</p>
                                                                    <p className="text-2xl font-black text-text-main leading-none tabular-nums">
                                                                        {user?.currency || '$'}{Number(student.amount).toLocaleString('es-AR')}
                                                                    </p>
                                                                </div>
                                                                
                                                                <div className="h-10 w-[1px] bg-border-main/50 mx-2" />
                                                                
                                                                <div className="hidden sm:block">
                                                                    <p className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest leading-none mb-1 text-right">Estado</p>
                                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                                        <span className="text-[8px] font-black text-amber-500 uppercase">Pendiente</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2">
                                                                {isPro && user?.mpAccessToken ? (
                                                                    <button
                                                                        onClick={() => handleSendPaymentLink(student)}
                                                                        className="flex items-center justify-center gap-2 py-3 bg-surface hover:bg-[#009EE3] text-[#009EE3] hover:text-white border border-[#009EE3]/30 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all italic shadow-sm"
                                                                    >
                                                                        <CreditCard size={14} /> Link MP
                                                                    </button>
                                                                ) : (
                                                                    <Link
                                                                        to={isPro ? "/app/settings?tab=business" : "/app/settings?tab=subscription"}
                                                                        className="flex items-center justify-center gap-2 py-3 bg-surface text-text-muted border border-border-main rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-bg-app transition-all italic text-center"
                                                                    >
                                                                        <CreditCard size={14} /> {isPro ? 'Vincular' : 'Pro'}
                                                                    </Link>
                                                                )}
                                                                <button
                                                                    onClick={() => handleRecordPayment(student)}
                                                                    className="flex items-center justify-center gap-2 py-3 bg-primary-main text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-primary-main/20 hover:scale-[1.03] active:scale-95 transition-all italic"
                                                                >
                                                                    <Wallet size={16} /> Registrar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* HISTORIAL TAB - Modern List */}
                                {activeTab === 'history' && (
                                    <div className="flex-1 min-h-0 flex flex-col gap-4">
                                        <div className="flex-shrink-0 bg-surface/30 dark:bg-white/[0.02] backdrop-blur-md border border-border-main/50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 bg-bg-app dark:bg-black/20 p-1 rounded-xl border border-border-main/30">
                                                    <select
                                                        value={selectedYear}
                                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                                        className="px-3 py-1.5 bg-transparent text-text-main rounded-lg appearance-none font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer"
                                                    >
                                                        {years.map(year => <option key={year} value={year} className="bg-surface">{year}</option>)}
                                                    </select>
                                                    <div className="w-px h-4 bg-border-main/50" />
                                                    <select
                                                        value={selectedMonth || ''}
                                                        onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : null)}
                                                        className="px-3 py-1.5 bg-transparent text-text-main rounded-lg appearance-none font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer"
                                                    >
                                                        <option value="" className="bg-surface">Todo el año</option>
                                                        {MONTHS.map((month, i) => <option key={i} value={i + 1} className="bg-surface">{month}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleExportMonthlyClosing}
                                                className="flex items-center gap-2 px-6 py-2 bg-primary-main/10 text-primary-main hover:bg-primary-main hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                            >
                                                <Download size={14} /> Exportar
                                            </button>
                                        </div>

                                        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 -mr-1">
                                            {filteredHistory.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full py-20 text-text-muted">
                                                    <Calendar size={48} className="mb-4 opacity-10" />
                                                    <p className="font-bold uppercase tracking-widest text-[10px]">Sin registros en este periodo.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3 pb-8">
                                                    {filteredHistory.map(payment => (
                                                        <motion.div 
                                                            key={payment.id} 
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="bg-surface/50 dark:bg-white/[0.02] border border-border-main/30 rounded-2xl p-4 flex items-center justify-between hover:border-primary-main/20 hover:bg-surface transition-all group"
                                                        >
                                                            <div className="flex items-center gap-4 min-w-0">
                                                                <div className="w-10 h-10 rounded-xl bg-bg-app dark:bg-black/20 flex items-center justify-center text-primary-main font-black text-sm border border-border-main/30">
                                                                    {payment.student?.name.charAt(0)}
                                                                </div>
                                                                <div className="truncate">
                                                                    <p className="font-black text-text-main leading-tight truncate">{payment.student?.name || 'Alumno Eliminado'}</p>
                                                                    <p className="text-[9px] uppercase font-bold text-text-muted tracking-wide flex items-center gap-1.5">
                                                                        <Clock size={10} strokeWidth={3} />
                                                                        {new Date(payment.paidAt).toLocaleDateString('es-AR')} • {new Date(payment.paidAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} HS
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-6">
                                                                <div className="text-right hidden sm:block">
                                                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40 leading-none mb-1">Monto</p>
                                                                    <p className="font-black text-primary-main tabular-nums leading-none">{user?.currency || '$'}{Number(payment.amount).toLocaleString('es-AR')}</p>
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-2">
                                                                    <button 
                                                                        onClick={() => handleShareReceipt(payment.id)} 
                                                                        className="flex items-center gap-2 px-4 py-2 bg-primary-main/10 text-primary-main hover:bg-primary-main hover:text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                                                                    >
                                                                        <Share2 size={14} /> <span className="hidden md:inline">Confirmar</span>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setDeleteModal({ isOpen: true, paymentId: payment.id })} 
                                                                        className="p-2 rounded-xl text-text-muted hover:bg-red-500/10 hover:text-red-500 transition-all"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* RECIBOS TAB - Compact Bento */}
                                {activeTab === 'receipts' && (
                                    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 -mr-1">
                                        {filteredReceipts.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                                                <ReceiptIcon size={48} className="mb-4 opacity-10 text-primary-main" />
                                                <h3 className="text-xl font-black text-text-main uppercase italic font-accent mb-2">Sin Recibos</h3>
                                                <p className="text-text-muted font-bold text-[10px] uppercase tracking-widest">Los recibos se generan automáticamente al registrar cobros.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                                                {filteredReceipts.map(receipt => (
                                                    <motion.div 
                                                        key={receipt.id} 
                                                        layout
                                                        className="bg-surface/50 dark:bg-white/[0.03] p-5 rounded-[28px] border border-border-main/50 hover:border-primary-main/30 group transition-all"
                                                    >
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-bg-app dark:bg-black/20 text-primary-main rounded-2xl flex flex-col items-center justify-center border border-border-main/30">
                                                                    <span className="text-[7px] font-black uppercase text-text-muted/60 tracking-widest mb-0.5">Día</span>
                                                                    <span className="text-lg font-black leading-none">{new Date(receipt.paidAt).getDate()}</span>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h3 className="font-black text-text-main text-base leading-tight truncate">{receipt.studentName}</h3>
                                                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1 opacity-60">{receipt.receiptNumber}</p>
                                                                </div>
                                                            </div>
                                                            <div className="p-2 bg-primary-main/10 rounded-xl text-primary-main opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <ReceiptIcon size={16} />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="px-3 py-1.5 bg-bg-app dark:bg-black/20 rounded-xl border border-border-main/20">
                                                                <p className="text-[11px] font-black text-primary-main tabular-nums">{user?.currency || '$'}{receipt.amount.toLocaleString()}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button 
                                                                    onClick={() => handleDownloadReceipt(receipt.id)}
                                                                    className={`p-2.5 rounded-xl transition-all ${isPro ? 'bg-bg-app text-text-main hover:bg-primary-main/10 hover:text-primary-main' : 'bg-bg-soft-app text-text-muted opacity-50 cursor-not-allowed'}`}
                                                                    title="Descargar PDF"
                                                                >
                                                                    <Download size={16} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleShareReceipt(receipt.id)}
                                                                    className="p-2.5 bg-primary-main/10 text-primary-main rounded-xl hover:bg-primary-main hover:text-white transition-all shadow-sm"
                                                                    title="Compartir"
                                                                >
                                                                    <Share2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
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
