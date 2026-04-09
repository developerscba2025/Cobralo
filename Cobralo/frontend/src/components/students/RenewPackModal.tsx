import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Plus, Minus, Check, X, CreditCard } from 'lucide-react';
import { api, type Student } from '../../services/api';

interface RenewPackModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
    onSuccess: () => void;
}

const RenewPackModal: React.FC<RenewPackModalProps> = ({ isOpen, onClose, student, onSuccess }) => {
    const [amount, setAmount] = useState<number>(student?.classes_per_month || 4);
    const [markAsPaid, setMarkAsPaid] = useState(true);
    const [loading, setLoading] = useState(false);

    if (!student) return null;

    const handleRenew = async () => {
        setLoading(true);
        try {
            const newTotalCredits = (student.credits || 0) + amount;
            const updateData: any = {
                credits: newTotalCredits
            };

            if (markAsPaid) {
                updateData.status = 'paid';
            }

            await api.updateStudent(student.id, updateData);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error renewing pack:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-surface dark:bg-bg-soft rounded-[32px] border border-border-main shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 pb-0 flex justify-between items-start">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-primary-main/10 flex items-center justify-center text-primary-main mb-4">
                                    <RefreshCw size={24} />
                                </div>
                                <h3 className="text-xl font-black text-text-main tracking-tight uppercase">Renovar Pack</h3>
                                <p className="text-sm font-bold text-text-muted mt-1">Sumar clases a {student.name}</p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-text-muted"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Current Stats */}
                            <div className="bg-black/5 dark:bg-white/[0.03] rounded-2xl p-4 flex items-center justify-between border border-border-main/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-text-main/5 flex items-center justify-center text-text-muted">
                                        <CreditCard size={16} />
                                    </div>
                                    <span className="text-sm font-bold text-text-muted">Clases actuales</span>
                                </div>
                                <span className="text-xl font-black text-text-main tabular-nums">{student.credits || 0}</span>
                            </div>

                            {/* Amount Selector */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Cantidad a sumar</label>
                                <div className="flex items-center gap-4 bg-black/5 dark:bg-white/[0.03] rounded-2xl p-2 border border-border-main/50">
                                    <button 
                                        onClick={() => setAmount(Math.max(1, amount - 1))}
                                        className="w-10 h-10 rounded-xl bg-surface dark:bg-bg-soft border border-border-main flex items-center justify-center text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <div className="flex-1 text-center">
                                        <span className="text-2xl font-black text-text-main tabular-nums">{amount}</span>
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter block">clases nuevas</span>
                                    </div>
                                    <button 
                                        onClick={() => setAmount(amount + 1)}
                                        className="w-10 h-10 rounded-xl bg-surface dark:bg-bg-soft border border-border-main flex items-center justify-center text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Mark as paid toggle */}
                            <button 
                                onClick={() => setMarkAsPaid(!markAsPaid)}
                                className="w-full flex items-center justify-between p-4 rounded-2xl border border-border-main/50 hover:bg-black/5 dark:hover:bg-white/[0.03] transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                        markAsPaid ? 'bg-primary-main border-primary-main text-white' : 'border-border-main'
                                    }`}>
                                        {markAsPaid && <Check size={14} strokeWidth={3} />}
                                    </div>
                                    <span className="text-xs font-bold text-text-main">Marcar alumno como "Al Día"</span>
                                </div>
                                <span className="text-[10px] font-black text-primary-main/50 group-hover:text-primary-main uppercase tracking-widest transition-colors">Recomendado</span>
                            </button>

                            {/* Total Result */}
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-text-muted uppercase">Pasa de {student.credits || 0} a <span className="text-primary-main">{(student.credits || 0) + amount}</span> clases totales</p>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 pt-0 flex gap-3">
                            <button 
                                onClick={onClose}
                                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-text-muted hover:text-text-main transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleRenew}
                                disabled={loading}
                                className="flex-[2] py-4 bg-primary-main text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-main/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <RefreshCw size={16} className="animate-spin" />
                                ) : (
                                    <>Actualizar Pack +</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default RenewPackModal;
