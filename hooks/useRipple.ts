'use client';

import { useState, useCallback } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface UseRippleOptions {
  color?: string;
  duration?: number;
  opacity?: number;
}

export function useRipple(options: UseRippleOptions = {}) {
  const {
    color = 'oklch(1 0 0 / 0.3)',
    duration = 600,
    opacity = 0.6,
  } = options;
  
  const prefersReducedMotion = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [nextId, setNextId] = useState(0);
  
  const addRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const newRipple: Ripple = {
      id: nextId,
      x,
      y,
      size,
    };
    
    setRipples((prev) => [...prev, newRipple]);
    setNextId((prev) => prev + 1);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, duration);
  }, [nextId, duration, prefersReducedMotion]);
  
  return {
    ripples,
    addRipple,
    color,
    duration,
    opacity,
  };
}

