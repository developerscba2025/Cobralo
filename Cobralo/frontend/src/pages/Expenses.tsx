import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Expense } from '../services/api';
import { showToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { Plus, Trash2, DollarSign, Tag, Search, X } from 'lucide-react';

const Expenses = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; expenseId: number | null }>({
        isOpen: false,
        expenseId: null
    });

    const [formData, setFormData] = useState({
        description: '',
        amount: 0,
        category: 'General',
        date: new Date().toISOString().split('T')[0]
    });

    const categories = ['General', 'Alquiler', 'Materiales', 'Publicidad', 'Servicios', 'Otros'];

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const data = await api.getCurrentExpenses();
            setExpenses(data);
        } catch (error) {
            console.error('Error loading expenses:', error);
            showToast.error('Error al cargar gastos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createExpense(formData);
            showToast.success('Gasto registrado');
            setIsModalOpen(false);
            setFormData({
                description: '',
                amount: 0,
                category: 'General',
                date: new Date().toISOString().split('T')[0]
            });
            loadExpenses();
        } catch (error) {
            showToast.error('Error al registrar gasto');
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.expenseId) return;
        try {
            await api.deleteExpense(deleteModal.expenseId);
            showToast.success('Gasto eliminado');
            loadExpenses();
        } catch (error) {
            showToast.error('Error al eliminar gasto');
        } finally {
            setDeleteModal({ isOpen: false, expenseId: null });
        }
    };

    const filteredExpenses = expenses.filter(e =>
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalAmount = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

    return (
        <Layout>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Gestión de Gastos</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Controla los egresos del mes actual.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-red-50 dark:bg-red-500/10 px-6 py-3 rounded-2xl flex items-center gap-3 border border-red-100 dark:border-red-500/20">
                        <DollarSign size={20} className="text-red-500" />
                        <div>
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none">Total Mes</p>
                            <p className="text-xl font-black text-red-600 dark:text-red-400 leading-tight">
                                {user?.currency || '$'}{totalAmount.toLocaleString('es-AR')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition flex items-center gap-2"
                    >
                        <Plus size={18} /> Nuevo Gasto
                    </button>
                </div>
            </header>

            {/* Search */}
            <div className="relative max-w-md mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar descripción o categoría..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-600 shadow-sm transition"
                />
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-slate-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
                        <p className="mt-4">Cargando gastos...</p>
                    </div>
                ) : filteredExpenses.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                        <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No hay gastos registrados este mes.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest">Descripción</th>
                                    <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest">Categoría</th>
                                    <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest">Fecha</th>
                                    <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest">Monto</th>
                                    <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map(expense => (
                                    <tr key={expense.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-800 dark:text-white">{expense.description}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-md">
                                                <Tag size={10} /> {expense.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500 text-sm">
                                            {new Date(expense.date).toLocaleDateString('es-AR')}
                                        </td>
                                        <td className="p-4 font-black text-red-500">
                                            -{user?.currency || '$'}{Number(expense.amount).toLocaleString('es-AR')}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, expenseId: expense.id })}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-500 transition"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] p-8 shadow-2xl relative border border-slate-100 dark:border-slate-700">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-300 hover:text-slate-600 dark:hover:text-white transition">
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Nuevo Gasto</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-3 mb-1 block uppercase tracking-widest">Descripción</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ej: Alquiler de sala"
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none outline-none font-medium"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-3 mb-1 block uppercase tracking-widest">Monto</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{user?.currency || '$'}</span>
                                    <input
                                        required
                                        type="number"
                                        placeholder="0"
                                        className="w-full p-4 pl-8 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none outline-none font-black text-lg"
                                        value={formData.amount || ''}
                                        onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 ml-3 mb-1 block uppercase tracking-widest">Categoría</label>
                                    <select
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none font-bold outline-none"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 ml-3 mb-1 block uppercase tracking-widest">Fecha</label>
                                    <input
                                        type="date"
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none outline-none font-medium"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-2xl transition mt-4 shadow-lg shadow-green-600/20">
                                Guardar Gasto
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Eliminar Gasto"
                message="¿Estás seguro de eliminar este gasto? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ isOpen: false, expenseId: null })}
                variant="danger"
            />
        </Layout>
    );
};

export default Expenses;
