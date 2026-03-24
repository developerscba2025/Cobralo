import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Payment } from '../services/api';
import { Calendar, DollarSign, User, Trash2, Filter, Download } from 'lucide-react';
import { showToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const History = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; paymentId: number | null }>({
        isOpen: false,
        paymentId: null
    });

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    useEffect(() => {
        loadPayments();
    }, [selectedYear, selectedMonth]);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const filters: { year?: number; month?: number } = { year: selectedYear };
            if (selectedMonth) filters.month = selectedMonth;

            const data = await api.getPayments(filters);
            setPayments(data);
        } catch (error) {
            console.error('Error loading payments:', error);
            showToast.error('Error al cargar el historial');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.paymentId) return;

        try {
            await api.deletePayment(deleteModal.paymentId);
            showToast.success('Pago eliminado');
            loadPayments();
        } catch {
            showToast.error('Error al eliminar el pago');
        } finally {
            setDeleteModal({ isOpen: false, paymentId: null });
        }
    };

    const totalAmount = payments.reduce((acc, p) => acc + Number(p.amount), 0);

    return (
        <Layout>
            <header className="mb-10">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Historial de Pagos
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Registro de todos los cobros realizados.
                </p>
            </header>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-[24px] p-6 mb-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                    <Filter size={20} className="text-slate-400" />

                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="px-4 py-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-xl border-none font-medium"
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    <select
                        value={selectedMonth || ''}
                        onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : null)}
                        className="px-4 py-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-xl border-none font-medium"
                    >
                        <option value="">Todos los meses</option>
                        {MONTHS.map((month, i) => (
                            <option key={i} value={i + 1}>{month}</option>
                        ))}
                    </select>

                    <div className="ml-auto flex items-center gap-2 bg-green-50 dark:bg-green-600/10 px-4 py-3 rounded-xl">
                        <DollarSign size={18} className="text-green-700 dark:text-green-400" />
                        <span className="font-bold text-green-700 dark:text-green-400">
                            Total: {user?.currency || '$'}{totalAmount.toLocaleString('es-AR')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Payments List */}
            <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-slate-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
                        <p className="mt-4">Cargando historial...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                        <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No hay pagos registrados para este período.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest">Alumno</th>
                                    <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest">Monto</th>
                                    <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest">Período</th>
                                    <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest">Fecha de Pago</th>
                                    <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(payment => (
                                    <tr key={payment.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-600/10 flex items-center justify-center">
                                                    <User size={18} className="text-green-700 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white">
                                                        {payment.student?.name || 'Alumno eliminado'}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{payment.student?.service_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-black text-green-700 dark:text-green-400">
                                            {user?.currency || '$'}{Number(payment.amount).toLocaleString('es-AR')}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">
                                            {MONTHS[payment.month - 1]} {payment.year}
                                        </td>
                                        <td className="p-4 text-slate-500">
                                            {new Date(payment.paidAt).toLocaleDateString('es-AR')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1">
                                                <a
                                                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/receipts/${payment.id}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 hover:bg-green-50 dark:hover:bg-green-600/10 rounded-xl text-slate-400 hover:text-green-600 transition"
                                                    title="Descargar Recibo"
                                                >
                                                    <Download size={18} />
                                                </a>
                                                <button
                                                    onClick={() => setDeleteModal({ isOpen: true, paymentId: payment.id })}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-500 transition"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Eliminar Pago"
                message="¿Estás seguro de eliminar este registro de pago? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ isOpen: false, paymentId: null })}
                variant="danger"
            />
        </Layout>
    );
};

export default History;
