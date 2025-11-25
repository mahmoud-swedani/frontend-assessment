'use client';

import { motion, HTMLMotionProps, type Variants } from 'framer-motion';
import { useFadeInOnScroll } from '@/hooks/useScrollAnimation';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getMotionScaleTransition, type MotionScale } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface ScrollRevealProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: React.ReactNode;
  motionScale?: MotionScale;
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

export function ScrollReveal({
  children,
  motionScale = 'medium',
  className,
  threshold = 0.1,
  triggerOnce = true,
  ...props
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref, isInView } = useFadeInOnScroll({ threshold, triggerOnce });
  
  const variants = prefersReducedMotion ? {} : {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: getMotionScaleTransition(motionScale, true),
    },
  };
  
  return (
    <motion.div
      ref={ref as any}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      {...(prefersReducedMotion ? {} : { variants: variants as Variants })}
      className={cn('motion-safe:will-change-transform', className)}
      style={{ willChange: prefersReducedMotion ? 'auto' : 'transform, opacity' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

