'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { tokens } from '@/lib/design-tokens';

interface SparkleEffectProps {
  count?: number;
  duration?: number;
  size?: number;
  color?: string;
}

export function SparkleEffect({
  count = 5,
  duration = 1,
  size = 4,
  color,
}: SparkleEffectProps) {
  const prefersReducedMotion = useReducedMotion();
  const sparkleColor = color || tokens.colors.chart2;
  
  if (prefersReducedMotion) {
    return null;
  }
  
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const distance = 30 + Math.random() * 20;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              width: size,
              height: size,
              backgroundColor: sparkleColor,
              boxShadow: `0 0 ${size * 2}px ${sparkleColor}`,
            }}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              x,
              y,
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration,
              delay: i * 0.1,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}

