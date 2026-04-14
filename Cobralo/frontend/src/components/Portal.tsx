import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
    children: React.ReactNode;
}

const Portal: React.FC<PortalProps> = ({ children }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent scrolling on the body when a modal is open via Portal
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    if (!mounted) return null;

    return createPortal(
        children,
        document.body
    );
};

export default Portal;
