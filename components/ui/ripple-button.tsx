'use client';

import { motion } from 'framer-motion';
import { Button, type ButtonProps } from './button';
import { useRipple } from '@/hooks/useRipple';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface RippleButtonProps extends ButtonProps {
  rippleColor?: string;
  rippleDuration?: number;
}

export function RippleButton({
  children,
  className,
  rippleColor,
  rippleDuration = 600,
  onClick,
  ...props
}: RippleButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ripples, addRipple, color, duration, opacity } = useRipple({
    color: rippleColor,
    duration: rippleDuration,
  });
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!prefersReducedMotion) {
      addRipple(e);
    }
    onClick?.(e);
  };
  
  return (
    <Button
      {...props}
      onClick={handleClick}
      className={cn('relative overflow-hidden', className)}
    >
      {children}
      
      {/* Ripple effects */}
      {!prefersReducedMotion && (
        <span className="absolute inset-0 pointer-events-none">
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                backgroundColor: color,
                opacity,
              }}
              initial={{ scale: 0, opacity }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: duration / 1000, ease: 'easeOut' }}
            />
          ))}
        </span>
      )}
    </Button>
  );
}

