import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    intensity?: number;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = "", intensity = 5 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024 || 'ontouchstart' in window);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Motion values for tilt
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth springs
    const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
    const rotateX = useSpring(useTransform(y, [-100, 100], [intensity, -intensity]), springConfig);
    const rotateY = useSpring(useTransform(x, [-100, 100], [-intensity, intensity]), springConfig);




    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || isMobile) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate relative position from -100 to 100
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const relativeX = (mouseX / rect.width) * 200 - 100;
        const relativeY = (mouseY / rect.height) * 200 - 100;
        
        x.set(relativeX);
        y.set(relativeY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    // Glint effect values
    const glintX = useTransform(x, [-100, 100], ['-50%', '50%']);
    const glintY = useTransform(y, [-100, 100], ['-50%', '50%']);

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`perspective-[1000px] ${className}`}
        >
            <motion.div
                style={!isMobile ? {
                    rotateX,
                    rotateY,
                    transformStyle: 'preserve-3d',
                } : {}}
                className="w-full h-full relative group"
            >
                {/* Static base content */}
                <div style={{ transform: 'translateZ(0px)' }} className="w-full h-full">
                    {children}
                </div>

                {/* Glint effect */}
                {!isMobile && (
                    <motion.div 
                        style={{
                            x: glintX,
                            y: glintY,
                            background: 'radial-gradient(circle at center, rgba(255,255,255,0.12) 0%, transparent 80%)',
                            transformStyle: 'preserve-3d',
                            translateZ: '20px',
                        }}
                        className="absolute inset-[-50%] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl z-20"
                    />
                )}
            </motion.div>
        </div>
    );
};

export default TiltCard;
