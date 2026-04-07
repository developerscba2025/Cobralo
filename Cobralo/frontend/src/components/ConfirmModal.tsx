import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    variant = 'danger'
}) => {
    const variantStyles = {
        danger: {
            icon: 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400',
            button: 'bg-red-600 hover:bg-red-700'
        },
        warning: {
            icon: 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
            button: 'bg-amber-600 hover:bg-amber-700'
        },
        info: {
            icon: 'bg-green-100 text-green-700 dark:bg-green-600/10 dark:text-green-400',
            button: 'bg-green-700 hover:bg-green-800'
        }
    };

    const styles = variantStyles[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] p-8 shadow-2xl relative border border-slate-100 dark:border-slate-700"
                    >
                        <button
                            onClick={onCancel}
                            className="absolute right-6 top-6 text-slate-300 hover:text-slate-600 dark:hover:text-white transition"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-full ${styles.icon} flex items-center justify-center mb-4`}>
                                <AlertTriangle size={32} />
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                {title}
                            </h2>

                            <p className="text-slate-500 dark:text-slate-400 mb-8">
                                {message}
                            </p>

                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className={`flex-1 py-4 px-6 rounded-2xl font-bold text-white ${styles.button} transition`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
