'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { tokens } from '@/lib/design-tokens';

interface ParticleTrailProps {
  enabled?: boolean;
  color?: string;
  count?: number;
  speed?: number;
}

interface TrailParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export function ParticleTrail({
  enabled = true,
  color,
  count = 8,
  speed = 2,
}: ParticleTrailProps) {
  const prefersReducedMotion = useReducedMotion();
  const [particles, setParticles] = useState<TrailParticle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const nextIdRef = useRef(0);
  
  const particleColor = color || tokens.colors.chart2;
  
  useEffect(() => {
    if (!enabled || prefersReducedMotion || !containerRef.current) {
      return;
    }
    
    const createParticle = (x: number, y: number): TrailParticle => ({
      id: nextIdRef.current++,
      x,
      y,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      life: 0,
      maxLife: 500 + Math.random() * 500,
      size: 2 + Math.random() * 3,
    });
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Create new particles
      const newParticles = Array.from({ length: count }, () =>
        createParticle(x, y)
      );
      
      setParticles((prev) => [...prev, ...newParticles].slice(-50)); // Limit to 50 particles
    };
    
    const animate = () => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life + 16,
            vx: particle.vx * 0.95,
            vy: particle.vy * 0.95,
          }))
          .filter((particle) => particle.life < particle.maxLife)
      );
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, prefersReducedMotion, count, speed]);
  
  if (!enabled || prefersReducedMotion) {
    return null;
  }
  
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particleColor,
            opacity: 1 - particle.life / particle.maxLife,
            boxShadow: `0 0 ${particle.size * 2}px ${particleColor}`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        />
      ))}
    </div>
  );
}

