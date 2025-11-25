/**
 * Morphing Shape & Icon Animations
 * SVG path morphing utilities for smooth shape transitions
 */

import { Variants } from 'framer-motion';
import { prefersReducedMotion } from './animations';

// Morphing animation variants
export const morphVariants: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : {
          pathLength: { duration: 0.6, ease: 'easeInOut' },
          opacity: { duration: 0.3 },
        },
  },
  exit: {
    pathLength: 0,
    opacity: 0,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : { duration: 0.3 },
  },
};

// Shape morphing with scale
export const shapeMorph: Variants = {
  initial: {
    scale: 0.8,
    rotate: -180,
    opacity: 0,
  },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : {
          type: 'spring',
          stiffness: 200,
          damping: 20,
        },
  },
  exit: {
    scale: 0.8,
    rotate: 180,
    opacity: 0,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : { duration: 0.3 },
  },
};

// Icon state transition
export const iconMorph: Variants = {
  initial: {
    scale: 0,
    rotate: -90,
    opacity: 0,
  },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : {
          type: 'spring',
          stiffness: 300,
          damping: 20,
        },
  },
  exit: {
    scale: 0,
    rotate: 90,
    opacity: 0,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : { duration: 0.2 },
  },
};

// Smooth path morphing helper
export function createPathMorph(
  fromPath: string,
  toPath: string,
  duration: number = 0.5
): Variants {
  return {
    initial: {
      d: fromPath,
      opacity: 0,
    },
    animate: {
      d: toPath,
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : {
            d: { duration, ease: [0.4, 0, 0.2, 1] },
            opacity: { duration: duration * 0.5 },
          },
    },
    exit: {
      d: fromPath,
      opacity: 0,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: duration * 0.5 },
    },
  };
}

// Contextual shape changes based on state
export const contextualMorph = {
  idle: {
    scale: 1,
    rotate: 0,
    opacity: 1,
  },
  active: {
    scale: 1.1,
    rotate: 5,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  success: {
    scale: [1, 1.2, 1],
    rotate: [0, 360],
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
  error: {
    scale: [1, 1.1, 1],
    rotate: [0, -10, 10, 0],
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
};

