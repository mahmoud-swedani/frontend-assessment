'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING, scaleIn } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'info' | 'warning';
  className?: string;
  animate?: boolean;
}

export function AnimatedBadge({ 
  children, 
  variant = 'default',
  className,
  animate = true 
}: AnimatedBadgeProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const variantStyles = {
    default: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200',
  };
  
  return (
    <motion.span
      initial={animate && !prefersReducedMotion ? "hidden" : false}
      animate={animate && !prefersReducedMotion ? "visible" : false}
      variants={prefersReducedMotion ? {} : scaleIn}
      whileHover={!prefersReducedMotion ? { scale: 1.1 } : undefined}
      transition={SPRING.gentle}
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shadow-soft',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </motion.span>
  );
}

