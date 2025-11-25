'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface UseMagneticHoverOptions {
  strength?: number;
  range?: number;
  damping?: number;
  stiffness?: number;
}

export function useMagneticHover(options: UseMagneticHoverOptions = {}) {
  const {
    strength = 0.3,
    range = 50,
    damping = 15,
    stiffness = 150,
  } = options;
  
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { damping, stiffness });
  const springY = useSpring(y, { damping, stiffness });
  
  const translateX = useTransform(springX, (value) => value * strength);
  const translateY = useTransform(springY, (value) => value * strength);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current || prefersReducedMotion) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    
    // Clamp to range
    const clampedX = Math.max(-range, Math.min(range, deltaX * range));
    const clampedY = Math.max(-range, Math.min(range, deltaY * range));
    
    x.set(clampedX);
    y.set(clampedY);
  }, [range, prefersReducedMotion]);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  }, [x, y]);
  
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  
  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion) return;
    
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mouseenter', handleMouseEnter);
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [handleMouseMove, handleMouseLeave, handleMouseEnter, prefersReducedMotion]);
  
  return {
    ref,
    isHovered,
    style: prefersReducedMotion ? {} : {
      x: translateX,
      y: translateY,
    },
  };
}

