import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Sparkles, CheckCircle2, X } from 'lucide-react';

interface ProLockProps {
    featureName: string;
    children?: React.ReactNode;
}

export const ProLock: React.FC<ProLockProps> = ({ featureName, children }) => {
    const { isPro } = useAuth();
    const [showModal, setShowModal] = useState(false);

    if (isPro) {
        return <>{children}</>;
    }

    return (
        <div className="relative group overflow-hidden rounded-[24px]">
            {/* The Locked Content (Blurred) */}
            <div className="opacity-40 blur-[4px] pointer-events-none select-none grayscale">
                {children}
            </div>

            {/* The Lock Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/5 dark:bg-emerald-950/5 backdrop-blur-[2px] border border-white/10 dark:border-emerald-500/5 transition-all group-hover:backdrop-blur-[4px]">
                <div className="w-12 h-12 bg-white dark:bg-bg-soft rounded-full flex items-center justify-center shadow-lg dark:shadow-none mb-4 border border-zinc-100 dark:border-border-emerald group-hover:scale-110 transition-transform">
                    <Lock className="text-primary-main" size={20} />
                </div>
                
                <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-2 text-zinc-900 dark:text-emerald-50 text-center">
                    Funcionalidad Pro
                </h4>
                
                <button
                    className="btn btn-primary text-xs !py-2.5 shadow-lg shadow-primary-main/20"
                    onClick={() => setShowModal(true)}
                >
                    Desbloquear {featureName}
                </button>
            </div>

            {/* Upgrade Modal */}
            {showModal && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[3000] p-4 animate-in fade-in duration-300"
                    onClick={() => setShowModal(false)}
                >
                    <div 
                        className="card-premium relative max-w-lg w-full p-8 md:p-10 animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            className="absolute top-6 right-6 text-zinc-400 hover:text-primary-main transition-colors"
                            onClick={() => setShowModal(false)}
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-primary-main/10 rounded-2xl flex items-center justify-center mb-6">
                                <Sparkles className="text-primary-main" size={32} />
                            </div>
                            
                            <h2 className="text-2xl font-black mb-2">🚀 Acceso exclusivo Pro</h2>
                            <p className="text-zinc-500 dark:text-emerald-500/60 text-sm mb-8">
                                Desbloquea <span className="text-zinc-800 dark:text-emerald-400 font-bold">{featureName}</span> y potencia tu academia hoy mismo.
                            </p>

                            <div className="w-full space-y-4 mb-10 text-left">
                                {[
                                    'Estudiantes ilimitados y sin restricciones',
                                    'Recordatorios automáticos por WhatsApp',
                                    'Generación de recibos PDF profesionales',
                                    'Reportes avanzados y estadísticas',
                                    'Soporte prioritario 24/7'
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-bg-dark/50 border border-zinc-100 dark:border-border-emerald">
                                        <CheckCircle2 className="text-primary-main shrink-0 mt-0.5" size={16} />
                                        <span className="text-xs text-zinc-600 dark:text-emerald-100/70">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <a 
                                href="/app/settings" 
                                className="btn btn-primary w-full py-4 justify-center text-sm shadow-xl shadow-primary-main/20"
                            >
                                Pasate a Pro por $499/mes
                            </a>
                            <p className="mt-4 text-[10px] label-premium opacity-50">Oferta limitada de lanzamiento</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

