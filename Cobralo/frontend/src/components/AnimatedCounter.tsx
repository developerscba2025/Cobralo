import React, { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
    value, 
    prefix = '', 
    suffix = '', 
    decimals = 0,
    className = '' 
}) => {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 40,
        stiffness: 450,
        mass: 0.5
    });
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [motionValue, isInView, value]);

    useEffect(() => {
        return springValue.onChange((latest) => {
            if (ref.current) {
                ref.current.textContent = `${prefix}${Intl.NumberFormat('es-AR', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                }).format(latest)}${suffix}`;
            }
        });
    }, [springValue, prefix, suffix, decimals]);

    return <span ref={ref} className={className} />;
};

export default AnimatedCounter;
