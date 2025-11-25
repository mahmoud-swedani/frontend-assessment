'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { toastSlideIn, toastSlideDown } from '@/lib/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { Button } from './button';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const variantStyles: Record<ToastVariant, { icon: typeof CheckCircle2; className: string }> = {
  success: {
    icon: CheckCircle2,
    className: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
  },
};

export function Toast({ 
  id, 
  title, 
  description, 
  variant = 'info',
  duration = 5000,
  onClose,
  position = 'top-right'
}: ToastProps) {
  const prefersReducedMotion = useReducedMotion();
  const { icon: Icon, className } = variantStyles[variant];
  const variants = position.includes('top') ? toastSlideDown : toastSlideIn;
  
  // Auto-dismiss
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [duration, id, onClose]);
  
  return (
    <motion.div
      layout
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={prefersReducedMotion ? {} : variants}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border-2 shadow-large min-w-[300px] max-w-[400px]',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && (
          <div className="font-semibold text-sm mb-1">{title}</div>
        )}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onClose(id)}
        className="h-6 w-6 p-0 flex-shrink-0"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

// Toast Container
interface ToastContainerProps {
  toasts: Array<ToastProps & { id: string }>;
  onClose: (id: string) => void;
  position?: ToastProps['position'];
}

export function ToastContainer({ toasts, onClose, position = 'top-right' }: ToastContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 end-4',
    'top-left': 'top-4 start-4',
    'bottom-right': 'bottom-4 end-4',
    'bottom-left': 'bottom-4 start-4',
  };
  
  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2 pointer-events-none',
        positionClasses[position]
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={onClose} position={position} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

