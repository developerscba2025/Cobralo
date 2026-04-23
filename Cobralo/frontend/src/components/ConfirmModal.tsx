import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Portal from './Portal';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
    children?: React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    variant = 'danger',
    isLoading = false,
    children
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
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] flex items-center justify-center p-4 modal-overlay"
                        onClick={onCancel}
                    />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            className="relative w-full max-w-md shadow-2xl glass-premium rounded-[32px] p-8 z-[2001]"
                        >
                            <button
                                onClick={onCancel}
                                className="absolute right-6 top-6 text-text-muted hover:text-text-main transition"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-full ${styles.icon} flex items-center justify-center mb-4`}>
                                    <AlertTriangle size={32} />
                                </div>

                                <h2 className="text-2xl font-black text-text-main mb-2">
                                    {title}
                                </h2>

                                <p className="text-text-muted mb-8">
                                    {message}
                                </p>

                                {children}

                                <div className="flex gap-4 w-full mt-8">
                                    <button
                                        onClick={onCancel}
                                        className="flex-1 py-4 px-6 rounded-2xl font-bold text-text-main bg-bg-app hover:brightness-95 dark:hover:brightness-110 transition"
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className={`flex-1 py-4 px-6 rounded-2xl font-bold text-white ${styles.button} transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Borrando...</span>
                                            </>
                                        ) : confirmText}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </Portal>
    );
};

export default ConfirmModal;
