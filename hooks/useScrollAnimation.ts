'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  parallaxSpeed?: number;
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = false,
    parallaxSpeed = 0.5,
  } = options;
  
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(ref, { 
    once: triggerOnce,
    amount: threshold,
    ...(rootMargin ? { margin: rootMargin as any } : {}),
  });
  
  const [scrollY, setScrollY] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  
  useEffect(() => {
    if (prefersReducedMotion) {
      setParallaxOffset(0);
      return;
    }
    
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress
      const scrollProgress = Math.max(
        0,
        Math.min(
          1,
          (window.scrollY + windowHeight - elementTop) / (windowHeight + elementHeight)
        )
      );
      
      setScrollY(window.scrollY);
      
      // Calculate parallax offset
      const offset = (window.scrollY - elementTop + windowHeight) * parallaxSpeed;
      setParallaxOffset(offset);
    };
    
    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll(); // Initial calculation
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [parallaxSpeed, prefersReducedMotion]);
  
  return {
    ref,
    isInView,
    scrollY,
    parallaxOffset: prefersReducedMotion ? 0 : parallaxOffset,
  };
}

// Hook for fade-in on scroll
export function useFadeInOnScroll(options: UseScrollAnimationOptions = {}) {
  const { ref, isInView } = useScrollAnimation(options);
  
  return {
    ref,
    isInView,
  };
}

// Hook for parallax effect
export function useParallax(speed: number = 0.5) {
  const { ref, parallaxOffset } = useScrollAnimation({ parallaxSpeed: speed });
  
  return {
    ref,
    parallaxOffset,
    style: {
      transform: `translateY(${parallaxOffset}px)`,
    },
  };
}

// Hook for sticky element with smooth transitions
export function useStickyScroll(options: { offset?: number } = {}) {
  const { offset = 0 } = options;
  const ref = useRef<HTMLElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return;
    
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const shouldBeSticky = rect.top <= offset;
      
      setIsSticky(shouldBeSticky);
    };
    
    // Throttle scroll
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [offset, prefersReducedMotion]);
  
  return {
    ref,
    isSticky,
  };
}

