import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PricingModal } from './PricingModal';

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
    const { isPro } = useAuth();
    const [showPricing, setShowPricing] = useState(false);

    if (isPro) {
        return children;
    }

    // Si es inline (para iconos o badges pequeños)
    if (inline) {
        return (
            <>
                <span
                    title={`Pasate a Pro para usar ${featureName}`}
                    style={{
                        cursor: 'pointer',
                        padding: '2px 6px',
                        backgroundColor: '#ffeaa7',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'inline-block'
                    }}
                    onClick={() => setShowPricing(true)}
                >
                    🔒 Pro
                </span>
                <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
            </>
        );
    }

    // Para botones normales
    return (
        <>
            <div
                onClick={() => setShowPricing(true)}
                style={{
                    position: 'relative'
                }}
            >
                {/* Copiar el elemento pero deshabilitarlo */}
                {React.cloneElement(children as React.ReactElement<any>, {
                    disabled: true,
                    style: {
                        ...(children.props as any).style,
                        opacity: 0.6,
                        cursor: 'not-allowed'
                    }
                })}
                {/* Overlay con candado */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '24px'
                    }}
                >
                    🔒
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
export const useProFeature = (featureName: string) => {
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
