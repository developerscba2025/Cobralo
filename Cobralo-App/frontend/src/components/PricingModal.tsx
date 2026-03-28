import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
    const { isPro, user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<'PRO_MONTHLY' | 'PRO_SEMESTRAL'>('PRO_MONTHLY');
    const [loading, setLoading] = useState(false);

    if (!isOpen || isPro) return null;

    const handleCheckout = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/subscription/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ planId: selectedPlan })
            });

            const data = await response.json();

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                alert('Error al iniciar el pago. Intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar tu solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[2000] p-4 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div 
                className="card-premium relative max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 md:p-12 animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    className="absolute top-6 right-6 text-zinc-400 hover:text-primary-main transition-colors text-2xl"
                    onClick={onClose}
                >
                    ✕
                </button>

                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center justify-center flex-wrap gap-2">
                        Lanzamiento Cobralo 
                        <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full animate-pulse">
                            50% OFF
                        </span>
                    </h1>
                    <p className="text-zinc-500 dark:text-emerald-500/60 font-accent max-w-md mx-auto">
                        ¡Aprovecha nuestra oferta de lanzamiento y lleva tu academia al siguiente nivel!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {/* Plan FREE */}
                    <div className="card-sub p-8 flex flex-col items-center border-zinc-100 dark:border-border-emerald">
                        <span className="label-premium mb-4">Plan Actual</span>
                        <h2 className="text-2xl font-bold mb-4">FREE</h2>
                        <div className="text-4xl font-bold text-zinc-400 dark:text-emerald-500/20 mb-8">
                            $0
                        </div>
                        <ul className="w-full space-y-3 mb-8 text-left">
                            <li className="flex items-center gap-2 text-zinc-500 dark:text-emerald-100/40 border-b border-zinc-100 dark:border-border-emerald pb-2">
                                <span className="text-primary-main">✓</span> Hasta 5 estudiantes
                            </li>
                            <li className="flex items-center gap-2 text-zinc-500 dark:text-emerald-100/40 border-b border-zinc-100 dark:border-border-emerald pb-2">
                                <span className="text-primary-main">✓</span> Control de asistencia
                            </li>
                            <li className="flex items-center gap-2 text-zinc-500 dark:text-emerald-100/40 border-b border-zinc-100 dark:border-border-emerald pb-2">
                                <span className="text-primary-main">✓</span> Registro de pagos
                            </li>
                            <li className="flex items-center gap-2 text-zinc-300 dark:text-emerald-900/40 pb-2">
                                <span className="text-zinc-300 dark:text-zinc-800">✗</span> Funciones Premium
                            </li>
                        </ul>
                        <button className="btn btn-ghost w-full justify-center opacity-50 cursor-not-allowed text-xs" disabled>
                            Plan actual {user?.plan === 'FREE' ? '✓' : ''}
                        </button>
                    </div>

                    {/* Plan PRO */}
                    <div className="card-premium p-8 flex flex-col items-center border-primary-main/30 dark:border-primary-main/20 bg-primary-main/[0.02] dark:bg-primary-main/[0.03] relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-main text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg shadow-primary-main/20">
                            Recomendado
                        </div>
                        
                        <h2 className="text-2xl font-black mt-4">PRO</h2>

                        <div className="w-full space-y-3 my-8">
                            <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                                selectedPlan === 'PRO_MONTHLY' 
                                ? 'border-primary-main bg-primary-main/[0.05] dark:bg-primary-main/[0.1]' 
                                : 'border-zinc-100 dark:border-border-emerald bg-white dark:bg-bg-dark hover:border-primary-main/30'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        className="accent-primary-main w-4 h-4"
                                        checked={selectedPlan === 'PRO_MONTHLY'}
                                        onChange={() => setSelectedPlan('PRO_MONTHLY')}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">Mensual</span>
                                        <span className="text-xs text-zinc-500">Facturación cada 30 días</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-zinc-400 line-through">$999</div>
                                    <div className="text-xl font-black text-primary-main">$499</div>
                                </div>
                            </label>

                            <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                                selectedPlan === 'PRO_SEMESTRAL' 
                                ? 'border-primary-main bg-primary-main/[0.05] dark:bg-primary-main/[0.1]' 
                                : 'border-zinc-100 dark:border-border-emerald bg-white dark:bg-bg-dark hover:border-primary-main/30'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        className="accent-primary-main w-4 h-4"
                                        checked={selectedPlan === 'PRO_SEMESTRAL'}
                                        onChange={() => setSelectedPlan('PRO_SEMESTRAL')}
                                    />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold">Semestral</span>
                                            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-md font-bold">
                                                -20% Extra
                                            </span>
                                        </div>
                                        <span className="text-xs text-zinc-500">Un solo pago cada 6 meses</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-zinc-400 line-through">$4999</div>
                                    <div className="text-xl font-black text-primary-main">$2499</div>
                                </div>
                            </label>
                        </div>

                        <ul className="w-full space-y-2.5 mb-8 text-left">
                            {[
                                'Estudiantes ilimitados',
                                'Recordatorios WhatsApp',
                                'Recibos PDF Personalizados',
                                'Dashboards Avanzados',
                                'Google Calendar Sync',
                                'Exportación a Excel'
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-emerald-100/70 border-b border-zinc-100 dark:border-border-emerald/30 pb-2 last:border-0">
                                    <span className="text-primary-main font-bold">✓</span> {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            className="btn btn-primary w-full py-4 justify-center shadow-lg shadow-primary-main/20 hover:scale-[1.02] active:scale-[0.98]"
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : '💳 Suscribirme con Mercado Pago'}
                        </button>
                    </div>
                </div>

                <div className="mt-6 p-8 rounded-3xl border border-dashed border-primary-main/30 bg-zinc-50/50 dark:bg-bg-dark text-left">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span>🏦</span> Transferencia Bancaria (PRO Semestral)
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-emerald-100/60 mb-6">
                        Si prefieres pagar vía transferencia (pago único por 6 meses), utiliza los siguientes datos y envía el comprobante por WhatsApp:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-2xl bg-white dark:bg-bg-soft border border-zinc-100 dark:border-border-emerald">
                        <div>
                            <p className="text-[10px] label-premium opacity-50 mb-1">Alias</p>
                            <p className="text-sm font-mono font-bold text-primary-main">cobralo.app.mp</p>
                        </div>
                        <div>
                            <p className="text-[10px] label-premium opacity-50 mb-1">CBU</p>
                            <p className="text-sm font-mono font-bold text-zinc-600 dark:text-emerald-100">0000003100012345678901</p>
                        </div>
                        <div>
                            <p className="text-[10px] label-premium opacity-50 mb-1">Monto PRO Semestral</p>
                            <p className="text-sm font-bold text-emerald-600">$2.499 <span className="text-xs font-normal opacity-60">(50% OFF)</span></p>
                        </div>
                        <div>
                            <p className="text-[10px] label-premium opacity-50 mb-1">Titular</p>
                            <p className="text-sm font-bold text-zinc-600 dark:text-emerald-100">Cobralo Soluciones</p>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-zinc-400 dark:text-emerald-500/40 font-accent">
                    Acceso inmediato al confirmar el pago. Los precios incluyen IVA.
                </p>
            </div>
        </div>
    );
};

