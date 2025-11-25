'use client';

import { useEffect, useState, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  isLowPerformance: boolean;
}

interface UsePerformanceMonitorOptions {
  threshold?: number; // FPS threshold for low performance
  sampleSize?: number; // Number of frames to sample
  onLowPerformance?: (metrics: PerformanceMetrics) => void;
}

export function usePerformanceMonitor(options: UsePerformanceMonitorOptions = {}) {
  const {
    threshold = 30, // 30 FPS threshold
    sampleSize = 60, // Sample 60 frames
    onLowPerformance,
  } = options;
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    isLowPerformance: false,
  });
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const frameTimesRef = useRef<number[]>([]);
  const rafRef = useRef<number | undefined>(undefined);
  
  useEffect(() => {
    const measureFrame = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      frameCountRef.current++;
      frameTimesRef.current.push(deltaTime);
      
      // Keep only recent frame times
      if (frameTimesRef.current.length > sampleSize) {
        frameTimesRef.current.shift();
      }
      
      // Calculate metrics every sampleSize frames
      if (frameCountRef.current % sampleSize === 0) {
        const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        const fps = 1000 / avgFrameTime;
        const isLowPerformance = fps < threshold;
        
        const newMetrics: PerformanceMetrics = {
          fps: Math.round(fps),
          frameTime: Math.round(avgFrameTime * 100) / 100,
          isLowPerformance,
        };
        
        setMetrics(newMetrics);
        
        if (isLowPerformance && onLowPerformance) {
          onLowPerformance(newMetrics);
        }
      }
      
      rafRef.current = requestAnimationFrame(measureFrame);
    };
    
    rafRef.current = requestAnimationFrame(measureFrame);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [threshold, sampleSize, onLowPerformance]);
  
  return metrics;
}

// Hook for adaptive quality based on performance
export function useAdaptiveQuality() {
  const { isLowPerformance } = usePerformanceMonitor({
    threshold: 30,
    onLowPerformance: () => {
      // Could dispatch event or update global state
    },
  });
  
  return {
    particleCount: isLowPerformance ? 20 : 50,
    animationQuality: isLowPerformance ? 'low' : 'high',
    enableAdvancedEffects: !isLowPerformance,
  };
}

