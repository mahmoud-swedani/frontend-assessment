'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fadeIn, SPRING } from '@/lib/animations';
import { cn } from '@/lib/utils';

type FeedbackState = 'idle' | 'loading' | 'success' | 'error' | 'info';

interface ContextualFeedbackProps {
  state: FeedbackState;
  children: ReactNode;
  className?: string;
  showIcon?: boolean;
}

const stateStyles: Record<FeedbackState, { className: string; icon?: string }> = {
  idle: { className: '' },
  loading: { 
    className: 'border-primary/20 bg-primary/5',
    icon: '⏳',
  },
  success: { 
    className: 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800',
    icon: '✨',
  },
  error: { 
    className: 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800',
    icon: '⚠️',
  },
  info: { 
    className: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800',
    icon: 'ℹ️',
  },
};

export function ContextualFeedback({
  state,
  children,
  className,
  showIcon = true,
}: ContextualFeedbackProps) {
  const prefersReducedMotion = useReducedMotion();
  const stateStyle = stateStyles[state];
  
  const variants = prefersReducedMotion ? {} : {
    idle: fadeIn,
    loading: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: {
        opacity: 1,
        scale: [1, 1.02, 1],
        transition: {
          repeat: Infinity,
          duration: 1.5,
          ease: [0.4, 0, 0.6, 1] as const,
        },
      },
    },
    success: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: {
        opacity: 1,
        scale: [0.9, 1.1, 1],
        transition: SPRING.bouncy,
      },
    },
    error: {
      hidden: { opacity: 0, x: 0 },
      visible: {
        opacity: 1,
        x: [0, -5, 5, -5, 0],
        transition: {
          duration: 0.4,
          ease: [0.4, 0, 0.6, 1] as const,
        },
      },
    },
    info: fadeIn,
  };
  
  return (
    <motion.div
      initial="hidden"
      animate={prefersReducedMotion ? {} : state}
      variants={variants[state] || undefined}
      className={cn(
        'rounded-xl border-2 p-4 transition-colors',
        stateStyle.className,
        className
      )}
    >
      <div className="flex items-start gap-3">
        {showIcon && stateStyle.icon && (
          <motion.span
            animate={state === 'success' ? { rotate: [0, 360] } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-2xl"
            aria-hidden="true"
          >
            {stateStyle.icon}
          </motion.span>
        )}
        <div className="flex-1">{children}</div>
      </div>
    </motion.div>
  );
}

