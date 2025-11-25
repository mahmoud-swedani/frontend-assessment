'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { tokens } from '@/lib/design-tokens';

interface AmbientLightProps {
  intensity?: 'low' | 'medium' | 'high';
  color?: string;
  position?: 'top' | 'center' | 'bottom';
  interactive?: boolean;
  className?: string;
}

export function AmbientLight({
  intensity = 'medium',
  color,
  position = 'center',
  interactive = false,
  className = '',
}: AmbientLightProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const intensityValues = {
    low: 0.2,
    medium: 0.3,
    high: 0.5,
  };
  
  const glowIntensity = intensityValues[intensity];
  const lightColor = color || tokens.colors.primary;
  
  const positionClasses = {
    top: 'top-0',
    center: 'top-1/2 -translate-y-1/2',
    bottom: 'bottom-0',
  };
  
  if (prefersReducedMotion) {
    return null;
  }
  
  return (
    <motion.div
      className={`absolute inset-x-0 ${positionClasses[position]} pointer-events-none z-0 ${className}`}
      aria-hidden="true"
      animate={{
        opacity: [glowIntensity * 0.7, glowIntensity, glowIntensity * 0.7],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        background: `radial-gradient(ellipse at ${position}, ${lightColor}40 0%, transparent 70%)`,
        height: '50%',
        filter: 'blur(40px)',
      }}
    />
  );
}

