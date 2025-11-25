'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { tokens } from '@/lib/design-tokens';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
}

const colors = [
  tokens.colors.chart1,   // Rose
  tokens.colors.chart2,   // Lavender
  tokens.colors.chart3,   // Blush
  tokens.colors.chart4,   // Beige
] as const;

export function Confetti({ enabled = true, intensity: intensityProp }: { enabled?: boolean; intensity?: 'low' | 'medium' | 'high' }) {
  const prefersReducedMotion = useReducedMotion();
  const intensity = intensityProp || 'medium';
  
  if (!enabled || prefersReducedMotion) return null;
  
  const particleCounts = {
    low: 15,
    medium: 30,
    high: 50,
  };
  
  const particles: ConfettiParticle[] = Array.from({ length: particleCounts[intensity] }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10,
    color: colors[Math.floor(Math.random() * colors.length)] as string,
    delay: Math.random() * 0.5,
    vx: (Math.random() - 0.5) * 2,
    vy: 2 + Math.random() * 3,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
  }));
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            opacity: 1,
            scale: 1,
            rotate: particle.rotation,
          }}
          animate={{
            y: '110vh',
            x: `${particle.x}vw`,
            opacity: [1, 1, 0.8, 0],
            scale: [1, 1.2, 1, 0.8],
            rotate: particle.rotation + 360 + particle.rotationSpeed * 180,
          }}
          transition={{
            duration: 2 + Math.random() * 1.5,
            delay: particle.delay,
            ease: [0.4, 0, 0.6, 1],
          }}
          className="absolute w-3 h-3 rounded-full"
          style={{ 
            backgroundColor: particle.color,
            boxShadow: `0 0 ${4 + Math.random() * 4}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
}

