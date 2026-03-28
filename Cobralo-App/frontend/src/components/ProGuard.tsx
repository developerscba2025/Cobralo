import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PricingModal } from './PricingModal';
import { Lock } from 'lucide-react';

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

    // Gating disabled per user feedback: "no me gusta lo de funcion premium"
    return children;
    
    /* Original gating logic preserved in comments
    const { isPro } = useAuth();
    if (isPro) {
        return children;
    }
    */

    // Si es inline (para iconos o badges pequeños)
    if (inline) {
        return (
            <>
                <span
                    title={`Pasate a Pro para usar ${featureName}`}
                    className="cursor-pointer bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 border border-amber-200 dark:border-amber-800"
                    onClick={() => setShowPricing(true)}
                >
                    <Lock size={10} className="fill-current" /> PRO
                </span>
                <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
            </>
        );
    }

    // Para secciones completas
    return (
        <>
            <div className="relative group overflow-hidden rounded-[24px]">
                {/* Contenido blureado y sin eventos */}
                <div 
                    className="pointer-events-none select-none filter blur-[3px] opacity-40 grayscale"
                >
                    {children}
                </div>
                
                {/* Overlay con candado y mensaje */}
                <div
                    onClick={() => setShowPricing(true)}
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-white/10 dark:bg-black/10 backdrop-blur-[1px] group-hover:bg-white/20 dark:group-hover:bg-black/20 transition-all duration-300"
                >
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-2xl transition-transform duration-300 border-2 border-slate-100 dark:border-slate-700 flex flex-col items-center gap-6 max-w-[90%] md:max-w-[400px]">
                        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-500/10 text-amber-600 rounded-[30px] flex items-center justify-center shadow-inner">
                            <Lock size={40} fill="currentColor" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Función Premium</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">Disponible en Cobralo PRO</p>
                        </div>
                        <button className="mt-2 bg-green-700 text-white text-xs font-black uppercase tracking-[0.2em] px-10 py-4 rounded-2xl hover:bg-green-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-900/20">
                            MEJORAR AHORA
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
