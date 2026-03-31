import { Toaster, toast, resolveValue } from 'react-hot-toast';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ToastContainer = () => {
    return (
        <Toaster
            position="top-right"
            containerStyle={{
                top: 24,
                right: 24,
                bottom: 24,
                left: 24,
            }}
            gutter={12}
        >
            {(t) => (
                <AnimatePresence mode="wait">
                    {t.visible && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(4px)' }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            style={{
                                background: '#090c0a', // Brand Dark
                                color: '#fff',
                                borderRadius: '24px',
                                padding: '16px 20px',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                border: t.type === 'success' 
                                    ? '1px solid rgba(34, 197, 120, 0.2)' 
                                    : t.type === 'error'
                                        ? '1px solid rgba(239, 68, 68, 0.2)'
                                        : '1px solid rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(12px)',
                                minWidth: '320px',
                                maxWidth: '420px',
                                pointerEvents: 'auto',
                            }}
                        >
                            <div className="flex-shrink-0">
                                {t.type === 'success' && (
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <CheckCircle2 size={24} strokeWidth={2.5} />
                                    </div>
                                )}
                                {t.type === 'error' && (
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                        <AlertCircle size={24} strokeWidth={2.5} />
                                    </div>
                                )}
                                {t.type === 'loading' && (
                                    <div className="w-10 h-10 rounded-full bg-primary-main/10 flex items-center justify-center text-primary-main">
                                        <Loader2 size={24} className="animate-spin" />
                                    </div>
                                )}
                                {t.type === 'blank' && (
                                    <div className="w-10 h-10 rounded-full bg-zinc-500/10 flex items-center justify-center text-zinc-400">
                                        <AlertCircle size={24} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 mb-0.5">
                                    {t.type === 'success' ? 'Éxito' : t.type === 'error' ? 'Error' : 'Notificación'}
                                </p>
                                <div className="text-sm font-bold text-zinc-100 dark:text-emerald-50 leading-snug">
                                    {resolveValue(t.message, t)}
                                </div>
                            </div>

                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="p-2 rounded-xl text-zinc-600 hover:text-white dark:hover:text-emerald-400 hover:bg-white/5 transition-all"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </Toaster>
    );
};

export const showToast = {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    loading: (message: string) => toast.loading(message),
    dismiss: (id?: string) => toast.dismiss(id),
    promise: <T,>(
        promise: Promise<T>,
        msgs: { loading: string; success: string; error: string }
    ) => toast.promise(promise, msgs),
};

export default ToastContainer;
