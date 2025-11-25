'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { createParticleSystem, updateParticleSystem, type Particle, type ParticleConfig } from '@/lib/particles';
import { tokens } from '@/lib/design-tokens';

interface ParticleBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  interactive?: boolean;
  className?: string;
}

export function ParticleBackground({ 
  intensity = 'medium',
  interactive = true,
  className = '' 
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);
  
  const intensityConfig = {
    low: { count: 20, speed: 0.3 },
    medium: { count: 50, speed: 0.5 },
    high: { count: 100, speed: 0.7 },
  };
  
  const config: ParticleConfig = {
    count: intensityConfig[intensity].count,
    speed: intensityConfig[intensity].speed,
    size: tokens.futuristic.particles.size,
    opacity: tokens.futuristic.particles.opacity,
    colors: [
      tokens.colors.chart1,
      tokens.colors.chart2,
      tokens.colors.chart3,
      tokens.colors.chart4,
    ],
    bounds: { width: 0, height: 0 },
    interactive,
  };
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }, []);
  
  useEffect(() => {
    if (prefersReducedMotion || !isVisible) {
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    // Set canvas size
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      config.bounds = { width: rect.width, height: rect.height };
      
      // Recreate particles on resize
      particlesRef.current = createParticleSystem(config);
    };
    
    resize();
    particlesRef.current = createParticleSystem(config);
    
    // Handle window resize
    window.addEventListener('resize', resize);
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 16, 100); // Cap at 100ms
      lastTime = currentTime;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update config with mouse position
      if (interactive) {
        config.mouseX = mouseRef.current.x;
        config.mouseY = mouseRef.current.y;
      }
      
      // Update particles
      particlesRef.current = updateParticleSystem(
        particlesRef.current,
        config,
        deltaTime * 0.1
      );
      
      // Draw particles
      particlesRef.current.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = particle.size * 2;
        ctx.shadowColor = particle.color;
        ctx.fill();
        ctx.restore();
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    // Intersection Observer for visibility
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]) {
          setIsVisible(entries[0].isIntersecting);
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(canvas);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      observer.disconnect();
    };
  }, [prefersReducedMotion, intensity, interactive, isVisible, config, handleMouseMove]);
  
  if (prefersReducedMotion) {
    return null;
  }
  
  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      aria-hidden="true"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

