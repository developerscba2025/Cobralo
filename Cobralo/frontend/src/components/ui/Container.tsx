import React from 'react';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    /** Aplica o remueve el padding lateral nativo del contenedor */
    noPadding?: boolean;
}

/**
 * Contenedor Maestro Responsive
 * 
 * Implementa de forma nativa la Regla 7:
 * width: 100%, max-width: 1200px, margin: 0 auto, padding progresivo mobile-first.
 * 
 * IMPORTANTE: Las clases de Tailwind DEBEN ser estáticas (no interpoladas)
 * para que el compilador JIT las detecte y genere el CSS correspondiente.
 */
export const Container: React.FC<ContainerProps> = ({ 
    children, 
    className = '', 
    noPadding = false 
}) => {
    return (
        <div className={`w-full max-w-[1920px] mx-auto ${noPadding ? '' : 'px-4 sm:px-6 md:px-8'} ${className}`.trim()}>
            {children}
        </div>
    );
};

export default Container;
