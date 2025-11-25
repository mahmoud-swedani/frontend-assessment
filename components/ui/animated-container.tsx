'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { fadeIn, staggerContainer, pageTransition, Variants, getPrefersReducedMotion } from '@/lib/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface AnimatedContainerProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
  variant?: 'fade' | 'slideUp' | 'stagger' | 'page' | 'none';
  variants?: Variants;
  className?: string;
}

export function AnimatedContainer({
  children,
  variant = 'fade',
  variants,
  className,
  ...props
}: AnimatedContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  const getVariants = () => {
    if (variants) return variants;
    
    switch (variant) {
      case 'fade':
        return fadeIn;
      case 'slideUp':
        return pageTransition;
      case 'stagger':
        return staggerContainer;
      case 'page':
        return pageTransition;
      default:
        return fadeIn;
    }
  };

  if (variant === 'none' || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={getVariants()}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn('motion-safe:will-change-transform', className)}
      style={{ willChange: prefersReducedMotion ? 'auto' : 'transform, opacity' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

