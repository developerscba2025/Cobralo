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

    const { isPro } = useAuth();
    if (isPro) {
        return children;
    }

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
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-white/20 dark:bg-black/40 backdrop-blur-[2px] transition-all duration-300"
                >
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl transition-transform duration-300 border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-6 max-w-[90%] md:max-w-[340px]">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-[24px] flex items-center justify-center">
                            <Lock size={32} />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">Función no disponible</p>
                            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Mejorá tu plan para usar esta herramienta</p>
                        </div>
                        <button className="bg-slate-900 dark:bg-primary-main text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-xl hover:opacity-90 transition-all shadow-md">
                            Ver Planes
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
