'use client';

import { motion } from 'framer-motion';
import { Button, type ButtonProps } from './button';
import { useMagneticHover } from '@/hooks/useMagneticHover';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SparkleEffect } from './sparkle-effect';
import { cn } from '@/lib/utils';

interface MagneticButtonProps extends ButtonProps {
  enableMagnetic?: boolean;
  enableParticles?: boolean;
  magneticStrength?: number;
}

export function MagneticButton({
  children,
  className,
  enableMagnetic = true,
  enableParticles = false,
  magneticStrength = 0.3,
  ...props
}: MagneticButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref, isHovered, style } = useMagneticHover({
    strength: enableMagnetic ? magneticStrength : 0,
    range: 20,
  });
  
  return (
    <motion.div
      ref={ref as any}
      style={prefersReducedMotion ? {} : style}
      className="inline-block"
    >
      <Button
        {...props}
        className={cn('relative overflow-hidden', className)}
      >
        {children}
        
        {/* Particle effects on hover */}
        {enableParticles && isHovered && !prefersReducedMotion && (
          <SparkleEffect count={5} duration={0.8} size={3} />
        )}
      </Button>
    </motion.div>
  );
}

