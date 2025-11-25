import { Variants, Transition } from 'framer-motion';

export type { Variants, Transition };
import { tokens } from './design-tokens';

/**
 * MOTION DESIGN SYSTEM
 * 
 * This file contains the centralized motion design system for the application.
 * All animations should use these standardized values to ensure consistency.
 * 
 * MOTION SCALES:
 * - micro: 120ms - Button taps, hovers, tooltips
 * - small: 200ms - Card appearances, small transitions
 * - medium: 300ms - View transitions, modal opens
 * - large: 450ms - Page transitions, major state changes
 * 
 * EASING STANDARDS:
 * - Primary easing: [0.25, 0.1, 0.25, 1] - Smooth, elegant motion (default)
 * - Premium easing: [0.16, 1, 0.3, 1] - Ultra-smooth for special cases
 * - Smooth easing: [0.4, 0, 0.2, 1] - Material Design (compatibility)
 * - Spring physics: Used for organic, natural motion
 * 
 * PERFORMANCE STANDARDS:
 * - Maintain 60fps on mid-range devices
 * - Use transform and opacity only (GPU-accelerated)
 * - Avoid animating width, height, top, left
 * - Use will-change strategically (only when animating)
 * 
 * ACCESSIBILITY:
 * - All animations respect prefers-reduced-motion
 * - Instant transitions when reduced motion is enabled
 * - Focus states always visible (no animation-only indicators)
 */

// Check for reduced motion preference (SSR-safe)
export const getPrefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Helper function to determine if animations should run
export const shouldAnimate = (): boolean => {
  return !prefersReducedMotion;
};

// For static checks (use hook for dynamic updates)
export const prefersReducedMotion = typeof window !== 'undefined' 
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
  : false;

// Animation durations - Standardized Duration Tokens
export const DURATION = {
  instant: 0,     // For reduced motion
  micro: 0.12,    // Button taps, hovers (120ms)
  small: 0.2,     // Card appearances (200ms)
  medium: 0.3,    // View transitions (300ms)
  large: 0.45,    // Page transitions (450ms)
  // Legacy (for compatibility)
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
};

// Motion Scale Constants (from design tokens)
export const MOTION_SCALE = {
  MICRO: {
    duration: tokens.motion.micro.default,
    min: tokens.motion.micro.min,
    max: tokens.motion.micro.max,
  },
  SMALL: {
    duration: tokens.motion.small.default,
    min: tokens.motion.small.min,
    max: tokens.motion.small.max,
  },
  MEDIUM: {
    duration: tokens.motion.medium.default,
    min: tokens.motion.medium.min,
    max: tokens.motion.medium.max,
  },
  LARGE: {
    duration: tokens.motion.large.default,
    min: tokens.motion.large.min,
    max: tokens.motion.large.max,
  },
} as const;

// Helper to get motion scale transition
export const getMotionScaleTransition = (
  scale: 'micro' | 'small' | 'medium' | 'large',
  useSpring = false,
  easingVariant: 'primary' | 'smooth' | 'premium' | 'snappy' | 'gentle' = 'primary'
): Transition => {
  if (prefersReducedMotion) {
    return { duration: 0 };
  }
  
  const motionScale = MOTION_SCALE[scale.toUpperCase() as keyof typeof MOTION_SCALE];
  
  if (useSpring) {
    return {
      type: 'spring',
      stiffness: scale === 'micro' ? 400 : scale === 'small' ? 300 : scale === 'medium' ? 200 : 150,
      damping: scale === 'micro' ? 25 : scale === 'small' ? 22 : scale === 'medium' ? 20 : 18,
      mass: 1,
    };
  }
  
  return {
    duration: motionScale.duration,
    ease: getEasing(easingVariant),
  };
};

// Spring Physics Presets (Elegant, Gentle, Bouncy, Smooth)
export const SPRING = {
  gentle: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 20,
    mass: 1,
  },
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 15,
    mass: 0.8,
  },
  smooth: {
    type: 'spring' as const,
    stiffness: 150,
    damping: 25,
    mass: 1,
  },
  elegant: {
    type: 'spring' as const,
    stiffness: 120,
    damping: 22,
    mass: 1.1,
  },
  delicate: {
    type: 'spring' as const,
    stiffness: 80,
    damping: 18,
    mass: 1.2,
  },
};

// Unified Easing System - Modern, Smooth, Elegant
export const EASING = {
  primary: [0.25, 0.1, 0.25, 1],      // Main easing for most transitions - smooth and elegant
  smooth: [0.4, 0, 0.2, 1],            // Material Design (keep for compatibility)
  premium: [0.16, 1, 0.3, 1],          // Ultra-smooth for special cases
  snappy: [0.34, 1.56, 0.64, 1],       // For micro-interactions
  gentle: [0.22, 1, 0.36, 1],          // For delicate animations
  // Legacy (for compatibility)
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  spring: [0.68, -0.55, 0.265, 1.55],
};

// Helper function to get easing curve by variant
export const getEasing = (variant: 'primary' | 'smooth' | 'premium' | 'snappy' | 'gentle' = 'primary'): [number, number, number, number] => {
  return EASING[variant] as [number, number, number, number];
};

// Base transition with spring physics
export const baseTransition: Transition = prefersReducedMotion
  ? { duration: 0 }
  : SPRING.elegant;

// Soft Fade with Scale (Feminine)
export const fadeIn: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.96,
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: prefersReducedMotion ? { duration: 0 } : SPRING.gentle,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: prefersReducedMotion ? { duration: 0 } : getMotionScaleTransition('micro'),
  },
};

// Elegant Slide Up
export const slideUp: Variants = {
  hidden: { 
    opacity: 0,
    y: 24,
    scale: 0.98,
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: prefersReducedMotion ? { duration: 0 } : SPRING.elegant,
  },
  exit: {
    opacity: 0,
    y: -24,
    scale: 0.98,
    transition: prefersReducedMotion ? { duration: 0 } : { duration: DURATION.fast },
  },
};

export const slideDown: Variants = {
  hidden: { 
    opacity: 0,
    y: -20,
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: baseTransition,
  },
};

export const slideLeft: Variants = {
  hidden: { 
    opacity: 0,
    x: 20,
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: baseTransition,
  },
};

export const slideRight: Variants = {
  hidden: { 
    opacity: 0,
    x: -20,
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: baseTransition,
  },
};

// Delicate Scale In
export const scaleIn: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.92,
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: prefersReducedMotion ? { duration: 0 } : SPRING.delicate,
  },
};

// Stagger container - Standardized
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : tokens.motion.stagger.normal,
      delayChildren: prefersReducedMotion ? 0 : 0.1,
    },
  },
};

// Stagger item with gentle spring
export const staggerItem: Variants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.96,
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: prefersReducedMotion ? { duration: 0 } : SPRING.gentle,
  },
};

// Elegant Page Transition
export const pageTransition: Variants = {
  initial: { 
    opacity: 0,
    y: 24,
    scale: 0.98,
  },
  animate: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: prefersReducedMotion ? { duration: 0 } : SPRING.smooth,
  },
  exit: {
    opacity: 0,
    y: -24,
    scale: 0.98,
    transition: prefersReducedMotion ? { duration: 0 } : { duration: DURATION.fast },
  },
};

// Premium Hover Animations with Spring
export const hoverScale = {
  scale: prefersReducedMotion ? 1 : 1.03,
  transition: prefersReducedMotion ? { duration: 0 } : SPRING.gentle,
};

export const hoverLift = {
  y: prefersReducedMotion ? 0 : -6,
  transition: prefersReducedMotion ? { duration: 0 } : SPRING.elegant,
};

export const hoverGlow = {
  scale: prefersReducedMotion ? 1 : 1.02,
  boxShadow: prefersReducedMotion 
    ? 'none' 
    : '0 8px 30px oklch(0.7 0.12 15 / 0.3), 0 0 60px oklch(0.75 0.1 320 / 0.15)',
  transition: prefersReducedMotion ? { duration: 0 } : SPRING.smooth,
};

// Gentle Float Animation - Enhanced with smooth multi-axis movement
export const floating: Variants = {
  animate: {
    y: prefersReducedMotion ? 0 : [0, -8, 0],
    x: prefersReducedMotion ? 0 : [0, 3, 0],
    rotate: prefersReducedMotion ? 0 : [0, 3, -3, 0],
    scale: prefersReducedMotion ? 1 : [1, 1.03, 1],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: [0.42, 0, 0.58, 1], // Ultra-smooth ease-in-out
      repeatType: 'reverse' as const,
    },
  },
};

// Delicate Pulse
export const delicatePulse: Variants = {
  animate: {
    scale: prefersReducedMotion ? 1 : [1, 1.02, 1],
    opacity: prefersReducedMotion ? 1 : [1, 0.95, 1],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: getEasing('gentle'),
    },
  },
};

// Soft Pulse Animation
export const pulse: Variants = {
  animate: {
    scale: prefersReducedMotion ? 1 : [1, 1.03, 1],
    opacity: prefersReducedMotion ? 1 : [1, 0.9, 1],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: getEasing('gentle'),
    },
  },
};

// Shimmer animation (for loading)
export const shimmer = {
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
  backgroundSize: '200% 100%',
  animation: prefersReducedMotion ? 'none' : 'shimmer 1.5s infinite',
};

// Micro-interaction variants for buttons and cards
export const buttonSpring = {
  whileHover: {
    scale: prefersReducedMotion ? 1 : 1.02,
    transition: prefersReducedMotion ? { duration: 0 } : SPRING.gentle,
  },
  whileTap: {
    scale: 0.98,
    transition: prefersReducedMotion ? { duration: 0 } : SPRING.bouncy,
  },
};

export const cardSpring = {
  whileHover: {
    y: prefersReducedMotion ? 0 : -8,
    scale: prefersReducedMotion ? 1 : 1.01,
    transition: prefersReducedMotion ? { duration: 0 } : SPRING.elegant,
  },
  whileTap: {
    scale: 0.99,
    transition: prefersReducedMotion ? { duration: 0 } : SPRING.bouncy,
  },
};

// Glassmorphism styles (kept for compatibility)
export const glassmorphism = {
  background: 'oklch(1 0.01 15 / 0.7)',
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  border: '1px solid oklch(0.9 0.01 15 / 0.3)',
};

// Dark mode glassmorphism
export const glassmorphismDark = {
  background: 'oklch(0.18 0.02 15 / 0.7)',
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  border: '1px solid oklch(0.25 0.02 15 / 0.3)',
};

// Route Transition Variants
export const routeTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : getMotionScaleTransition('medium', true),
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : getMotionScaleTransition('small'),
  },
};

// Modal/Drawer Animation Variants
export const modalBackdrop: Variants = {
  hidden: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
  },
  visible: {
    opacity: 1,
    backdropFilter: 'blur(16px)',
    transition: prefersReducedMotion
      ? { duration: 0 }
      : getMotionScaleTransition('medium'),
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: prefersReducedMotion
      ? { duration: 0 }
      : getMotionScaleTransition('micro'),
  },
};

export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : getMotionScaleTransition('medium', true),
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : getMotionScaleTransition('small'),
  },
};

export const drawerSlide: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : {
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        },
  },
  exit: {
    x: '100%',
    opacity: 0,
    scale: 0.95,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : getMotionScaleTransition('small'),
  },
};

// Toast Notification Variants
export const toastSlideIn: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : getMotionScaleTransition('small', true),
  },
  exit: {
    x: '100%',
    opacity: 0,
    scale: 0.9,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : getMotionScaleTransition('micro'),
  },
};

export const toastSlideDown: Variants = {
  hidden: {
    y: -20,
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : getMotionScaleTransition('small', true),
  },
  exit: {
    y: -20,
    opacity: 0,
    scale: 0.95,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : getMotionScaleTransition('micro'),
  },
};

// Micro-interaction variants by scale
export const microInteraction = {
  micro: {
    whileHover: {
      scale: prefersReducedMotion ? 1 : 1.01,
      transition: getMotionScaleTransition('micro'),
    },
    whileTap: {
      scale: 0.99,
      transition: getMotionScaleTransition('micro'),
    },
  },
  small: {
    whileHover: {
      scale: prefersReducedMotion ? 1 : 1.02,
      transition: getMotionScaleTransition('small', true),
    },
    whileTap: {
      scale: 0.98,
      transition: getMotionScaleTransition('micro'),
    },
  },
  medium: {
    whileHover: {
      scale: prefersReducedMotion ? 1 : 1.03,
      y: prefersReducedMotion ? 0 : -4,
      transition: getMotionScaleTransition('medium', true),
    },
    whileTap: {
      scale: 0.97,
      transition: getMotionScaleTransition('small'),
    },
  },
  large: {
    whileHover: {
      scale: prefersReducedMotion ? 1 : 1.05,
      y: prefersReducedMotion ? 0 : -8,
      transition: getMotionScaleTransition('large', true),
    },
    whileTap: {
      scale: 0.95,
      transition: getMotionScaleTransition('medium'),
    },
  },
} as const;

// Export type for motion scale
export type MotionScale = 'micro' | 'small' | 'medium' | 'large';

// Breathing animation for buttons
export const breathing: Variants = {
  animate: {
    scale: prefersReducedMotion ? 1 : [1, 1.02, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: getEasing('gentle'),
    },
  },
};

// Enhanced button micro-interactions with smooth click animation
export const buttonMicro = {
  whileHover: {
    scale: prefersReducedMotion ? 1 : 1.02,
    y: prefersReducedMotion ? 0 : -2,
    transition: getMotionScaleTransition('micro', true),
  },
  whileTap: {
    scale: prefersReducedMotion ? 0.98 : 0.95,
    y: prefersReducedMotion ? 0 : 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 17,
      mass: 0.5,
    },
  },
  whileFocus: {
    scale: 1.01,
    boxShadow: '0 0 0 4px oklch(0.7 0.12 15 / 0.2)',
    transition: getMotionScaleTransition('micro'),
  },
};

// Input focus animation variants
export const inputFocus: Variants = {
  initial: { 
    scale: 1, 
    borderColor: 'oklch(0.9 0.01 15)',
    boxShadow: '0 0 0 0px oklch(0.7 0.12 15 / 0)',
  },
  focus: {
    scale: prefersReducedMotion ? 1 : 1.01,
    borderColor: 'oklch(0.7 0.12 15)',
    boxShadow: '0 0 0 3px oklch(0.7 0.12 15 / 0.1)',
    transition: getMotionScaleTransition('small', true),
  },
};

// Enhanced shimmer effect for skeletons
export const shimmerEffect: Variants = {
  animate: {
    x: prefersReducedMotion ? 0 : ['-100%', '200%'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Card appear animation (fade + scale + slight lift) - Enhanced with flicker-free transition
export const cardAppear: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.98,
    y: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : {
          ...getMotionScaleTransition('medium'),
          ease: getEasing('primary'),
        },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -8,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : getMotionScaleTransition('micro'),
  },
};

// Table row appear animation (slide + fade)
export const rowAppear: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    x: 0,
  },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : getMotionScaleTransition('small'),
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : { duration: 0.15 },
  },
};

// View switch animation (grid/table transition)
export const viewSwitch: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 12,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : {
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -12,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : getMotionScaleTransition('small'),
  },
};

// Refetch pulse animation (subtle pulse for data refresh)
export const refetchPulse: Variants = {
  animate: {
    scale: prefersReducedMotion ? 1 : [1, 1.01, 1],
    opacity: prefersReducedMotion ? 1 : [1, 0.98, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: getEasing('gentle'),
    },
  },
};

// Loading spinner animation
export const loadingSpinner: Variants = {
  animate: {
    rotate: prefersReducedMotion ? 0 : 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Button loading state animation - Enhanced with smooth click feedback
export const buttonLoading = {
  whileHover: prefersReducedMotion ? {} : {
    scale: 1.02,
    y: -2,
    transition: SPRING.gentle,
  },
  whileTap: {
    scale: prefersReducedMotion ? 0.98 : 0.94,
    y: prefersReducedMotion ? 0 : 2,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 20,
      mass: 0.4,
    },
  },
};

// Staggered grid entry animation - Standardized
export const staggerGrid: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : tokens.motion.stagger.normal,
      delayChildren: prefersReducedMotion ? 0 : 0.1,
    },
  },
};

// Staggered table entry animation - Standardized
export const staggerTable: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : tokens.motion.stagger.tight,
      delayChildren: prefersReducedMotion ? 0 : 0.05,
    },
  },
};

// Error shake animation
export const errorShake: Variants = {
  animate: {
    x: prefersReducedMotion ? 0 : [0, -8, 8, -8, 8, 0],
    transition: {
      duration: 0.5,
      ease: getEasing('primary'),
    },
  },
};

// Filter/Sort feedback animation (subtle pulse)
export const filterFeedback: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  animate: {
    scale: prefersReducedMotion ? 1 : [1, 1.02, 1],
    opacity: prefersReducedMotion ? 1 : [1, 0.95, 1],
    transition: {
      duration: 0.4,
      ease: getEasing('primary'),
    },
  },
};

// Highlight pulse for active filters
export const highlightPulse: Variants = {
  animate: {
    boxShadow: prefersReducedMotion
      ? 'none'
      : [
          '0 0 0 0px oklch(0.7 0.12 15 / 0)',
          '0 0 0 4px oklch(0.7 0.12 15 / 0.3)',
          '0 0 0 0px oklch(0.7 0.12 15 / 0)',
        ],
    transition: {
      duration: 0.6,
      ease: getEasing('primary'),
    },
  },
};

// Smooth view transition (for Table ↔ Grid) - Optimized: removed filter blur for better performance
export const viewMorph: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : getMotionScaleTransition('medium'),
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : getMotionScaleTransition('medium'),
  },
};

// Skeleton fade-out animation - Enhanced with flicker-free transition
export const skeletonFadeOut: Variants = {
  initial: {
    opacity: 1,
    scale: 1,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : getMotionScaleTransition('small'),
  },
};

// Enhanced skeleton to content transition - flicker-free with subtle zoom
export const skeletonToContent: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : {
          ...getMotionScaleTransition('medium'),
          ease: getEasing('primary'),
        },
  },
};

