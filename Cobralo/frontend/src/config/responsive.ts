/**
 * Configuración Centralizada de Responsive Design
 * Cumple con las 10 Reglas Obligatorias de Responsive Design establecidas para el proyecto.
 */

export const RESPONSIVE_RULES = {
    /**
     * Regla 5: Breakpoints obligatorios en cada componente (Mobile-First)
     */
    breakpoints: {
        mobile: '480px',   // max-width
        tablet: '768px',   // max-width
        desktop: '1024px', // min-width
    },

    /**
     * Regla 7: Contenedores
     * width: 100%, max-width: 1200px, margin: 0 auto, padding: 0 1rem
     */
    container: {
        maxWidth: '1200px',
        padding: {
            mobile: '1rem',
            tablet: '1.5rem',
            desktop: '2rem',
        }
    },

    /**
     * Regla 9: Accesibilidad táctil
     * Áreas clickeables mínimas
     */
    touchTarget: {
        minWidth: '44px',
        minHeight: '44px',
    },

    /**
     * Clases base de Tailwind preestablecidas para consistencia total en modulos
     */
    classes: {
        // Enforce Regla 7 (max-width, centrado y paddings progresivos)
        mainContainer: 'w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8',
        // Enforce Regla 9 (Touch interactivo mínimo)
        touchable: 'min-w-[44px] min-h-[44px] flex items-center justify-center',
    }
} as const;

export default RESPONSIVE_RULES;
