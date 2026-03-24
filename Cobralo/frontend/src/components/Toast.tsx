import { Toaster, toast, resolveValue } from 'react-hot-toast';
import { X } from 'lucide-react';

export const ToastContainer = () => {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#1e293b',
                    color: '#fff',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                },
                success: {
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                },
            }}
        >
            {(t) => (
                <div
                    style={{
                        ...t.style,
                        opacity: t.visible ? 1 : 0,
                        transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
                        transition: 'all 200ms ease-in-out',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minWidth: '200px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {t.icon}
                        <div style={{ flex: 1 }}>
                            {resolveValue(t.message, t)}
                        </div>
                    </div>
                    {t.type !== 'loading' && (
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                padding: '4px',
                                marginLeft: '8px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
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
