import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PricingModal } from './PricingModal';
import { showToast } from './Toast';

interface ProFeatureProps {
    children: React.ReactElement;
    featureName?: string;
    inline?: boolean;
}

/**
 * Envuelve un botón o componente para agregr funcionalidad Pro
 * Si el usuario no es Pro, muestra un ícono de candado y abre el modal de pricing al hacer clic
 */
export const ProFeature: React.FC<ProFeatureProps> = ({
    children,
    featureName = 'esta funcionalidad',
    inline = false
}) => {
    const [showPricing, setShowPricing] = useState(false);

    const { isPro } = useAuth();
    if (isPro) {
        return children;
    }

    const handleClick = () => {
        showToast.error(`¡Esta es una función PRO! Actualizá tu plan para usar ${featureName}.`);
        setShowPricing(true);
    };

    // Si es inline (para iconos o badges pequeños)
    if (inline) {
        return (
            <>
                <span
                    title={`Pasate a Pro para usar ${featureName}`}
                    className="cursor-pointer bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-amber-500/20 hover:scale-105 transition-all shadow-lg shadow-amber-500/5"
                    onClick={handleClick}
                >
                    <Lock size={12} className="fill-amber-500/20" /> PRO
                </span>
                <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
            </>
        );
    }

    // Para secciones completas
    return (
        <>
            <div className="relative group overflow-hidden rounded-[40px] border border-zinc-100 dark:border-white/5 shadow-inner bg-bg-app">
                {/* Contenido blureado y sin eventos */}
                <div 
                    className="pointer-events-none select-none filter blur-[6px] opacity-30 grayscale"
                >
                    {children}
                </div>
                
                {/* Overlay con candado y mensaje */}
                <div
                    onClick={handleClick}
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-black/[0.03] dark:bg-black/40 backdrop-blur-[4px] transition-all duration-300 group-hover:bg-black/[0.06]"
                >
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-10 rounded-[48px] shadow-2xl transition-all duration-500 border border-white dark:border-white/5 flex flex-col items-center gap-8 max-w-[90%] md:max-w-[400px] group-hover:scale-105 group-hover:-translate-y-2">
                        <div className="w-20 h-20 bg-primary-main/10 dark:bg-emerald-500/10 text-primary-main rounded-[32px] flex items-center justify-center shadow-inner rotate-3 group-hover:rotate-0 transition-all duration-500">
                            <Lock size={36} strokeWidth={2.5} />
                        </div>
                        <div className="text-center space-y-3">
                            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">Acceso Exclusivo Pro</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] max-w-[200px] mx-auto leading-relaxed">Mejorá tu plan para desbloquear {featureName}</p>
                        </div>
                        <button className="bg-primary-main text-white text-[10px] font-black uppercase tracking-[0.2em] px-10 py-5 rounded-2xl hover:bg-green-600 transition-all shadow-xl shadow-primary-glow active:scale-95">
                            Ver Planes Pro
                        </button>
                    </div>
                </div>
            </div>
            <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
        </>
    );
};

/**
 * Componente para mostrar badges de "Pro" en botones
 */
export const ProBadge: React.FC = () => {
    return (
        <span
            style={{
                display: 'inline-block',
                backgroundColor: '#667eea',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold',
                marginLeft: '6px',
                textTransform: 'uppercase'
            }}
        >
            Pro
        </span>
    );
};

/**
 * Hook para verificar si una feature está disponible
 */
export const useProFeature = (_featureName: string) => {
    const { isPro } = useAuth();
    const [showPricing, setShowPricing] = useState(false);

    const isAvailable = isPro;

    const handleRequiresPro = (callback?: () => void) => {
        if (isPro && callback) {
            callback();
        } else if (!isPro) {
            setShowPricing(true);
        }
    };

    return {
        isAvailable,
        showPricing,
        setShowPricing,
        handleRequiresPro
    };
};
