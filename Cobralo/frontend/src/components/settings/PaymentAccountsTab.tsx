import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Banknote } from 'lucide-react';
import { api } from '../../services/api';
import type { BusinessPaymentAccount } from '../../services/api';
import { showToast } from '../Toast';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentAccountsTab: React.FC = () => {
    const [accounts, setAccounts] = useState<BusinessPaymentAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newAccount, setNewAccount] = useState({ name: '', alias: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            setLoading(true);
            const data = await api.getPaymentAccounts();
            setAccounts(data);
        } catch (error: any) {
            console.error('Error loading accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAccount.name || !newAccount.alias) return;
        try {
            setSaving(true);
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/payment-accounts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newAccount)
            });
            if (!res.ok) throw new Error('Error creating account');
            const created = await res.json();
            setAccounts([...accounts, created]);
            setNewAccount({ name: '', alias: '' });
            setIsCreating(false);
            showToast.success('Cuenta guardada');
        } catch (error: any) {
            showToast.error('Error al guardar la cuenta');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/payment-accounts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!res.ok) throw new Error('Error deleting account');
            setAccounts(accounts.filter(a => a.id !== id));
            showToast.success('Cuenta eliminada');
        } catch (error: any) {
            showToast.error('Error al eliminar');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-zinc-500">Cargando cuentas...</div>;
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-black text-text-main">Cuentas de Pago</h2>
                <p className="text-sm font-bold text-text-muted">
                    Configurá tus CVU, CBU o Alias (ej. Mercado Pago, Brubank) para que tus alumnos puedan elegir dónde pagarte.
                </p>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {accounts.map(acc => (
                        <motion.div
                            key={acc.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-50 dark:bg-bg-dark rounded-[24px] p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary-main/10 flex items-center justify-center text-primary-main">
                                    <Banknote size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-sm text-text-main">{acc.name}</p>
                                    <p className="font-bold text-xs text-text-muted mt-0.5">{acc.alias}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(acc.id)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                title="Eliminar cuenta"
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {accounts.length === 0 && !isCreating && (
                    <div className="text-center py-10 bg-zinc-50 dark:bg-bg-dark border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[24px]">
                        <p className="text-sm font-bold text-text-muted mb-4">No tenés cuentas configuradas.</p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="text-xs font-black uppercase text-primary-main hover:underline"
                        >
                            + Agregar Cuenta
                        </button>
                    </div>
                )}

                {isCreating ? (
                    <form onSubmit={handleCreate} className="bg-zinc-50 dark:bg-bg-dark rounded-[24px] p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Nueva Cuenta</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Nombre Institución</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ej: Mercado Pago"
                                    className="w-full p-4 bg-white dark:bg-black dark:text-white rounded-2xl border-none font-bold text-sm outline-none shadow-sm focus:ring-2 focus:ring-primary-main/20 transition-all"
                                    value={newAccount.name}
                                    onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Alias o CBU</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ej: mi.negocio.mp"
                                    className="w-full p-4 bg-white dark:bg-black dark:text-white rounded-2xl border-none font-bold text-sm outline-none shadow-sm focus:ring-2 focus:ring-primary-main/20 transition-all"
                                    value={newAccount.alias}
                                    onChange={e => setNewAccount({ ...newAccount, alias: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-5 py-3 rounded-xl font-bold text-xs text-text-muted hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-primary-main text-white shadow-lg shadow-primary-glow active:scale-95 transition disabled:opacity-50"
                            >
                                {saving ? 'Guardando...' : 'Guardar Cuenta'}
                            </button>
                        </div>
                    </form>
                ) : (
                    accounts.length > 0 && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full py-4 rounded-[24px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold hover:border-primary-main hover:text-primary-main transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            Agregar otra cuenta
                        </button>
                    )
                )}
            </div>
        </div>
    );
};

export default PaymentAccountsTab;
