/**
 * Cobralo Motion System
 * Centralized animations and physics for a premium and consistent feel.
 */

export const SPRING_PHYSICS = {
  type: "spring",
  stiffness: 260,
  damping: 20
} as const;

export const GENTLE_SPRING = {
  type: "spring",
  stiffness: 100,
  damping: 15,
  mass: 1
} as const;

export const fadeInVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
} as const;

export const floatVariants = {
    initial: { y: 0 },
    animate: {
        y: [-10, 0, -10],
        transition: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
} as const;

export const fadeInUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { ...GENTLE_SPRING }
  }
} as const;

export const slideInRightVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { ...SPRING_PHYSICS }
  },
  exit: { opacity: 0, x: -30 }
} as const;

export const staggerContainerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
} as const;

export const listItemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { ...GENTLE_SPRING }
  }
} as const;

export const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { ...SPRING_PHYSICS }
  },
  exit: { opacity: 0, scale: 0.95 }
} as const;

export const tabVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};
