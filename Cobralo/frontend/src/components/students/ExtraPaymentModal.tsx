import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { api, type Student } from '../../services/api';
import { showToast } from '../Toast';

interface ExtraPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    student: Student | null;
    currency: string;
}

const ExtraPaymentModal: React.FC<ExtraPaymentModalProps> = ({ 
    isOpen, onClose, onSuccess, student, currency 
}) => {
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');

    const handleExtraPayment = async () => {
        if (!student || !amount) return;
        try {
            const now = new Date();
            await api.createPayment({
                studentId: student.id,
                amount: Number(amount),
                month: now.getMonth() + 1,
                year: now.getFullYear()
            });

            if (note.trim()) {
                await api.createNote({
                    studentId: student.id,
                    content: `Pago Extra (${currency}${amount}): ${note.trim()}`
                });
            }

            showToast.success('Pago extra registrado correctamente');
            onSuccess();
            onClose();
            setAmount('');
            setNote('');
        } catch {
            showToast.error('Error al registrar pago extra');
        }
    };

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-sm bg-white dark:bg-bg-soft rounded-3xl p-6 shadow-2xl border border-zinc-100 dark:border-border-emerald z-10">
                <h2 className="text-xl font-black text-text-main mb-2">Pago Extra</h2>
                <p className="text-sm font-bold text-text-muted mb-6">Registrar pago manual adicional para {student.name}</p>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-zinc-400 mb-1 ml-1 block">Monto a registrar</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400">{currency}</span>
                            <input 
                                type="number" 
                                min="0"
                                className="w-full p-4 pl-8 bg-zinc-50 dark:bg-bg-dark rounded-xl font-bold border-none outline-none focus:ring-2 focus:ring-primary-main/20 text-text-main"
                                placeholder="Ej: 5000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
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
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 p-4 rounded-xl font-bold bg-zinc-100 dark:bg-bg-dark text-text-muted hover:bg-zinc-200">Cancelar</button>
                    <button onClick={handleExtraPayment} disabled={!amount} className="flex-1 p-4 rounded-xl font-black uppercase text-[10px] bg-primary-main text-white shadow-lg shadow-primary-glow active:scale-95 transition-all disabled:opacity-50">Registrar</button>
                </div>
            </motion.div>
        </div>
    );
};

export default ExtraPaymentModal;
