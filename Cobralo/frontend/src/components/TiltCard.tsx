import React from 'react';

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    intensity?: number;
}

/**
 * TiltCard - Ahora simplificado a un contenedor estático por petición del usuario
 * para eliminar el "efecto de mouse" (tilt/glint) manteniendo la estructura.
 */
const TiltCard: React.FC<TiltCardProps> = ({ children, className = "" }) => {
    return (
        <div className={`w-full h-full ${className}`}>
            <div className="w-full h-full relative">
                {children}
            </div>
        </div>
    );
};

export default TiltCard;
